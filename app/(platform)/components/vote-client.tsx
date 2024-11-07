"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ChevronDown, ChevronUp } from "lucide-react";
import { vote } from "@/lib/actions/vote";
import { ThreadWithResponses } from "@/types";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { getThreads } from "@/lib/fetchers/thread";
import { GetThreadsResponse } from "@/types/thread";

const formatDate = (dateString: string) => {
  const date = parseISO(dateString);
  return format(date, "MMM d, yyyy 'at' h:mm a");
};

export default function VotePage({
  initialData,
}: {
  initialData: GetThreadsResponse | null;
}) {
  const [threads, setThreads] = useState<ThreadWithResponses[]>(
    initialData?.threads || []
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime] = useState(Date.now());
  const [userId, setUserId] = useState(initialData?.userId || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<"a" | "b" | null>(
    null
  );
  const [hasMore, setHasMore] = useState(initialData?.hasMore || false);
  const [showGroundTruth, setShowGroundTruth] = useState(false);
  const [expandedEmails, setExpandedEmails] = useState(false);
  const MAX_VISIBLE_EMAILS = 2;

  const currentThread = useMemo(
    () => threads[currentIndex],
    [threads, currentIndex]
  );

  useEffect(() => {
    console.log("initialData", initialData);
    const init = async () => {
      setIsLoading(true);
      console.time("init");
      const data = await getThreads();
      if (data) {
        console.log("data", data);

        setThreads(data.threads);
        setHasMore(data.hasMore);
        setUserId(data.userId);
      }
      setIsLoading(false);
      console.timeEnd("init");
    };

    if (!initialData) {
      init();
    }
  }, [initialData]);

  const handleVote = async () => {
    if (!userId || !threads[currentIndex] || !selectedResponse) return;

    setIsVoting(true);

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
        const data = await getThreads(threads.map((t) => t.thread.id));
        if (data) {
          setThreads((prev) => [
            ...prev,
            ...data.threads.filter((t) => !prev.includes(t)),
          ]);
          setHasMore(data.hasMore);
        }
      }

      setCurrentIndex((prev) => prev + 1);
      toast.success("Vote submitted successfully");
    } catch (error) {
      toast.error("Vote failed. Something went wrong");
      console.error("Error submitting vote:", error);
    } finally {
      setIsVoting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 space-y-4">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        <p className="text-muted-foreground text-sm">Loading threads...</p>
      </div>
    );
  }

  if (!currentThread) {
    return (
      <div className="flex justify-center p-8">No more threads available</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-4 space-y-4 sm:space-y-8">
      <div className="space-y-4 bg-white shadow-sm border rounded-lg overflow-hidden">
        <div className="border-b px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h2 className="font-semibold text-base sm:text-lg text-gray-800">
              {currentThread.thread.emails[0].subject}
            </h2>
            {currentThread.thread.emails.length > MAX_VISIBLE_EMAILS && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedEmails(!expandedEmails)}
                className="flex items-center gap-1 sm:gap-2 text-sm"
              >
                {expandedEmails ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Show All ({currentThread.thread.emails.length} emails)
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        <div className="px-3 sm:px-6 pb-4 sm:pb-6 space-y-4 sm:space-y-6">
          {currentThread.thread.emails
            .slice(0, expandedEmails ? undefined : MAX_VISIBLE_EMAILS)
            .map((msg, i) => (
              <div key={i} className="space-y-4 border-b last:border-b-0 pb-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {msg.from[0].toUpperCase()}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <div className="flex items-baseline gap-2">
                          <span className="font-medium text-gray-900">
                            {msg.from}
                          </span>
                          <span className="text-xs text-gray-500">
                            {i === 0 ? "Original message" : `Reply #${i}`}
                          </span>
                        </div>
                        <span className="text-xs sm:text-sm text-gray-500">
                          {formatDate(msg.date)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">To:</span> {msg.to}
                        </div>
                        {msg.cc && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Cc:</span> {msg.cc}
                          </div>
                        )}
                        {msg.bcc && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Bcc:</span> {msg.bcc}
                          </div>
                        )}
                        <div className="text-sm font-medium text-gray-800">
                          Subject: {msg.subject}
                        </div>
                      </div>
                    </div>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </div>
                  </div>
                </div>
              </div>
            ))}

          {!expandedEmails &&
            currentThread.thread.emails.length > MAX_VISIBLE_EMAILS && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedEmails(true)}
                className="w-full flex items-center justify-center gap-2 text-sm text-gray-500"
              >
                <ChevronDown className="h-4 w-4" />
                Show All (
                {currentThread.thread.emails.length - MAX_VISIBLE_EMAILS} more
                emails)
              </Button>
            )}
        </div>
      </div>

      <div className="space-y-4 bg-white shadow-sm border rounded-lg overflow-hidden">
        <div className="border-b px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h2 className="font-semibold text-base sm:text-lg text-gray-800">
            What was actually sent
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowGroundTruth(!showGroundTruth)}
          >
            {showGroundTruth ? "Hide" : "Show"} Reference
          </Button>
        </div>

        {showGroundTruth && (
          <div className="px-3 sm:px-6 pb-4 sm:pb-6">
            <div className="bg-muted/30 p-6 rounded-lg">
              {currentThread.groundTruth ? (
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Original Response
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">To:</span>{" "}
                      {currentThread.groundTruth.email.to}
                    </div>
                    {currentThread.groundTruth.email.cc && (
                      <div>
                        <span className="font-medium">Cc:</span>{" "}
                        {currentThread.groundTruth.email.cc}
                      </div>
                    )}
                    {currentThread.groundTruth.email.bcc && (
                      <div>
                        <span className="font-medium">Bcc:</span>{" "}
                        {currentThread.groundTruth.email.bcc}
                      </div>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap text-gray-700">
                    {currentThread.groundTruth.email.text}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No sent email data available for this thread.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        {["a", "b"].map((side) => (
          <div
            key={side}
            className={`space-y-4 border p-3 sm:p-6 rounded-lg flex flex-col cursor-pointer transition-colors
                ${
                  selectedResponse === side
                    ? "border-primary outline"
                    : "hover:border-primary/50"
                }
              `}
            onClick={() => setSelectedResponse(side as "a" | "b")}
          >
            <div className="text-sm text-muted-foreground">
              Assistant {side.toUpperCase()}
            </div>
            <div className="flex-1 flex flex-col gap-4">
              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Subject:</span>{" "}
                  {currentThread.responses[side as "a" | "b"].draft.subject || ""}
                </div>
                <div>
                  <span className="font-medium">To:</span>{" "}
                  {currentThread.responses[side as "a" | "b"].draft.to || ""}
                </div>
                {currentThread.responses[side as "a" | "b"].draft.cc && (
                  <div>
                    <span className="font-medium">Cc:</span>{" "}
                    {currentThread.responses[side as "a" | "b"].draft.cc}
                  </div>
                )}
                {currentThread.responses[side as "a" | "b"].draft.bcc && (
                  <div>
                    <span className="font-medium">Bcc:</span>{" "}
                    {currentThread.responses[side as "a" | "b"].draft.bcc}
                  </div>
                )}
              </div>
              <div className="bg-card p-3 sm:p-6 rounded-lg min-h-[150px] sm:min-h-[200px] flex-1">
                <p className="whitespace-pre-wrap text-sm sm:text-base">
                  {currentThread.responses[side as "a" | "b"].draft.text}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-4">
        <Button onClick={handleVote} disabled={!selectedResponse || isVoting}>
          {isVoting ? (
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
      </div>
    </div>
  );
}
