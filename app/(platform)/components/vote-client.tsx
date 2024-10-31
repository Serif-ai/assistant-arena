"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp } from "lucide-react";

interface Thread {
  id: string;
  messages: Array<{
    from: string;
    content: string;
  }>;
}

interface Response {
  id: string;
  content: string;
}

export default function VotePage() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>();
  const [thread, setThread] = useState<Thread>();
  const [responses, setResponses] = useState<{
    a: Response;
    b: Response;
  }>();
  const [startTime] = useState(Date.now());
  const [info, setInfo] = useState<{
    headerIp: string;
    apiIp: string;
  }>();

  useEffect(() => {
    fetchNewThread();
  }, []);

  const fetchNewThread = async () => {
    setLoading(true);
    const res = await fetch("/api/thread/random");
    if (res.ok) {
      const data = await res.json();
      console.log("data", data);

      setUserId(data.userId);
      setThread(data.thread);
      setResponses(data.responses);
      setInfo(data);
    }
    setLoading(false);
  };

  const handleVote = async (winner: "a" | "b") => {
    if (!userId || !thread || !responses) return;

    const timeToVote = Math.round((Date.now() - startTime) / 1000);
    const winnerId = responses[winner].id;
    const loserId = responses[winner === "a" ? "b" : "a"].id;

    await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        threadId: thread.id,
        winnerId,
        loserId,
        timeToVote,
      }),
    });

    fetchNewThread();
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  if (!thread || !responses) {
    return <div className="flex justify-center p-8">No more threads available</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      {JSON.stringify(info, null, 2)}
      <div className="space-y-4 bg-muted p-6 rounded-lg">
        <h2 className="font-semibold text-lg">Previous Thread</h2>
        {thread.messages.map((msg, i) => (
          <div key={i} className="space-y-1">
            <div className="text-sm font-medium">{msg.from}</div>
            <div className="text-sm">{msg.content}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {["a", "b"].map((side) => (
          <div key={side} className="space-y-4">
            <div className="bg-card p-6 rounded-lg min-h-[200px]">
              <p className="whitespace-pre-wrap">{responses[side as "a" | "b"].content}</p>
            </div>
            <Button
              className="w-full"
              onClick={() => handleVote(side as "a" | "b")}
            >
              <ThumbsUp className="mr-2" />
              Vote for Response {side.toUpperCase()}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
