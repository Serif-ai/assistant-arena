import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import VoteClient from "./components/vote-client";
import LeaderboardClient from "./components/leaderboard-client";
import { getThreads } from "@/lib/fetchers/thread";

export default async function Home() {
  const data = (await getThreads()) || {
    threads: [],
    userId: "",
    hasMore: false,
  };
  let defaultTab = "vote";

  if (data.threads.length === 0) {
    defaultTab = "leaderboard";
  }

  return (
    <div className="container mx-auto py-8">
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="vote">Vote</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="vote">
          <VoteClient
            initialThreads={data.threads}
            userId={data.userId}
            initialHasMore={data.hasMore}
          />
        </TabsContent>

        <TabsContent value="leaderboard">
          <LeaderboardClient />
        </TabsContent>
      </Tabs>
    </div>
  );
}
