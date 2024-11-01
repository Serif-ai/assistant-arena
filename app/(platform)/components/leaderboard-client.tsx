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
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-pulse flex space-x-4">
          <Trophy className="h-6 w-6 text-muted-foreground" />
          <div className="text-muted-foreground">Loading leaderboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                <button
                  onClick={() => handleSort("assistant")}
                  className="inline-flex items-center gap-2 hover:text-foreground"
                >
                  Assistant
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                <button
                  onClick={() => handleSort("arenaScore")}
                  className="inline-flex items-center gap-2 hover:text-foreground"
                >
                  Arena Score
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                <button
                  onClick={() => handleSort("votes")}
                  className="inline-flex items-center gap-2 hover:text-foreground"
                >
                  Votes
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                <button
                  onClick={() => handleSort("organization")}
                  className="inline-flex items-center gap-2 hover:text-foreground"
                >
                  Organization
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedLeaderboard.map((entry) => (
              <tr
                key={entry.assistant}
                className="border-b transition-colors hover:bg-muted/50"
              >
                <td className="p-4">{entry.assistant}</td>
                <td className="p-4">{entry.arenaScore}</td>
                <td className="p-4">{entry.votes}</td>
                <td className="p-4">{entry.organization}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
