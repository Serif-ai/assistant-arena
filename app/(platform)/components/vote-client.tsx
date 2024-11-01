"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp } from "lucide-react";
import { vote } from "@/lib/actions/vote";
import { ThreadWithResponses } from "@/types";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

const formatDate = (dateString: string) => {
  const date = parseISO(dateString);
  return format(date, "MMM d, yyyy 'at' h:mm a");
};

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
  const [isLoading, setIsLoading] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<"a" | "b" | null>(
    null
  );
  const [hasMore, setHasMore] = useState(initialHasMore);

  const currentThread = useMemo(
    () => threads[currentIndex],
    [threads, currentIndex]
  );

  const handleVote = async () => {
    if (!userId || !threads[currentIndex] || !selectedResponse) return;

    setIsLoading(true);

    const timeToVote = Math.round((Date.now() - startTime) / 1000);
    const winnerId = currentThread.responses[selectedResponse].id;
    const loserId =
      currentThread.responses[selectedResponse === "a" ? "b" : "a"].id;

    try {
      await vote({
        userId,
        threadId: currentThread.thread.id,
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
      toast.success("Vote submitted successfully");
    } catch (error) {
      toast.error("Vote failed. Something went wrong");
      console.error("Error submitting vote:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    setVoted(false);
    setCurrentIndex((prev) => prev + 1);
  };

  if (!currentThread) {
    return (
      <div className="flex justify-center p-8">No more threads available</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div className="space-y-4 bg-white shadow-sm border rounded-lg overflow-hidden">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold text-lg text-gray-800">
            Thread {currentIndex + 1}
          </h2>
        </div>

        <div className="px-6 pb-6 space-y-6">
          {currentThread.thread.emails.map((msg, i) => (
            <div key={i} className="space-y-4 border-b last:border-b-0 pb-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {msg.from[0].toUpperCase()}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium text-gray-900">
                          {msg.from}
                        </span>
                        <span className="text-xs text-gray-500">
                          {i === 0 ? "Original message" : `Reply #${i}`}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">{formatDate(msg.date)}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">To:</span> {msg.to}
                      {msg.cc && (
                        <div>
                          <span className="font-medium">Cc:</span> {msg.cc}
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-medium text-gray-800">
                      Subject: {msg.subject}
                    </div>
                  </div>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
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
              {/* {currentThread.responses[side as "a" | "b"].model.name} */}
            </div>
            <div className="flex-1 flex flex-col gap-4">
              <div className="bg-card p-6 rounded-lg min-h-[200px] flex-1">
                <p className="whitespace-pre-wrap">
                  {currentThread.responses[side as "a" | "b"].draft.text}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-4">
        {!voted ? (
          <Button
            onClick={handleVote}
            disabled={!selectedResponse || isLoading}
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Submitting...
              </>
            ) : (
              <>
                <ThumbsUp className="mr-2" />
                Submit Vote
              </>
            )}
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
