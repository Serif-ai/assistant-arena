"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp } from "lucide-react";
import { vote } from "@/lib/actions/vote";
import { ThreadWithResponses } from "@/types";

export default function VotePage({
  initialThreads,
  userId,
  initialHasMore,
}: {
  initialThreads: ThreadWithResponses[];
  userId: string;
  initialHasMore: boolean;
}) {
  const [threads, setThreads] = useState<ThreadWithResponses[]>(initialThreads);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime] = useState(Date.now());
  const [voted, setVoted] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<"a" | "b" | null>(
    null
  );
  const [hasMore, setHasMore] = useState(initialHasMore);

  const handleVote = async () => {
    if (!userId || !threads[currentIndex] || !selectedResponse) return;

    const current = threads[currentIndex];
    const timeToVote = Math.round((Date.now() - startTime) / 1000);
    const winnerId = current.responses[selectedResponse].id;
    const loserId = current.responses[selectedResponse === "a" ? "b" : "a"].id;

    try {
      await vote({
        userId,
        threadId: current.thread.id,
        winnerId,
        loserId,
        timeToVote,
      });

      if (currentIndex >= threads.length - 2 && hasMore) {
        const res = await fetch("/api/thread/random");
        if (res.ok) {
          const data = await res.json();
          setThreads((prev) => [
            ...prev,
            {
              thread: data.thread,
              responses: data.responses,
            },
          ]);
          setHasMore(data.hasMore);
        }
      }

      setVoted(true);
    } catch (error) {
      console.error("Error submitting vote:", error);
    }
  };

  const handleNext = () => {
    setVoted(false);
    setCurrentIndex((prev) => prev + 1);
  };

  const current = threads[currentIndex];
  if (!current) {
    return (
      <div className="flex justify-center p-8">No more threads available</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div className="space-y-4 bg-muted p-6 rounded-lg">
        <h2 className="font-semibold text-lg">Thread {currentIndex + 1}</h2>
        {current.thread.messages.map((msg, i) => (
          <div key={i} className="space-y-1">
            <div className="text-sm font-medium">{msg.from}</div>
            <div className="text-sm">{msg.content}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {["a", "b"].map((side) => (
          <div
            key={side}
            className={`space-y-4 border p-6 rounded-lg flex flex-col cursor-pointer transition-colors
                ${
                  selectedResponse === side
                    ? "border-primary border-2"
                    : "hover:border-primary/50"
                }
              `}
            onClick={() => !voted && setSelectedResponse(side as "a" | "b")}
          >
            <div className="text-sm text-muted-foreground">
              Assistant {side.toUpperCase()}
            </div>
            <div className="flex-1 flex flex-col gap-4">
              <div className="bg-card p-6 rounded-lg min-h-[200px] flex-1">
                <p className="whitespace-pre-wrap">
                  {current.responses[side as "a" | "b"].content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-4">
        {!voted ? (
          <Button onClick={handleVote} disabled={!selectedResponse}>
            <ThumbsUp className="mr-2" />
            Submit Vote
          </Button>
        ) : (
          <Button onClick={handleNext} variant="outline">
            Next Thread
          </Button>
        )}
      </div>
    </div>
  );
}
