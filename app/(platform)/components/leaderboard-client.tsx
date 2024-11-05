"use client";

import { useEffect, useState } from "react";
import { Trophy, ArrowUpDown } from "lucide-react";

interface LeaderboardEntry {
  assistant: string;
  arenaScore: number;
  votes: number;
  organization: string;
}

export default function LeaderboardClient() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof LeaderboardEntry;
    direction: "asc" | "desc";
  }>({ key: "arenaScore", direction: "desc" });

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("/api/leaderboard");
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: keyof LeaderboardEntry) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "desc"
          ? "asc"
          : "desc",
    });
  };

  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    if (sortConfig.direction === "asc") {
      return a[sortConfig.key] < b[sortConfig.key] ? -1 : 1;
    }
    return a[sortConfig.key] > b[sortConfig.key] ? -1 : 1;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-pulse flex flex-col items-center space-y-2">
          <Trophy className="h-8 w-8 text-primary/70" />
          <div className="text-muted-foreground font-medium">
            Loading leaderboard...
          </div>
        </div>
      </div>
    );
  }

  if (!sortedLeaderboard.length) {
    return (
      <div className="flex justify-center p-8">No more data available</div>
    );
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              {[
                { key: "assistant", label: "Assistant" },
                { key: "arenaScore", label: "Arena Score" },
                { key: "votes", label: "Votes" },
                { key: "organization", label: "Organization" },
              ].map((column) => (
                <th
                  key={column.key}
                  className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden sm:table-cell"
                >
                  <button
                    onClick={() =>
                      handleSort(column.key as keyof LeaderboardEntry)
                    }
                    className="inline-flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    {column.label}
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
              ))}
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground sm:hidden">
                <button
                  onClick={() => handleSort("assistant")}
                  className="inline-flex items-center gap-2 hover:text-foreground transition-colors"
                >
                  Assistant
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedLeaderboard.map((entry, index) => (
              <tr
                key={entry.assistant}
                className="border-b transition-colors hover:bg-muted/50 group"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {index < 3 && (
                      <Trophy
                        className={`h-5 w-5 ${
                          index === 0
                            ? "text-yellow-500"
                            : index === 1
                            ? "text-gray-400"
                            : "text-amber-600"
                        }`}
                      />
                    )}
                    <span className="font-medium">{entry.assistant}</span>
                    <div className="flex flex-col sm:hidden ml-4">
                      <span className="text-sm text-muted-foreground">
                        Score: {entry.arenaScore}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Votes: {entry.votes}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {entry.organization}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="p-4 hidden sm:table-cell">{entry.arenaScore}</td>
                <td className="p-4 hidden sm:table-cell">{entry.votes}</td>
                <td className="p-4 hidden sm:table-cell">
                  {entry.organization}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
