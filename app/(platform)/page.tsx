import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import VoteClient from "./components/vote-client";
import LeaderboardClient from "./components/leaderboard-client";
import { getThreads } from "@/lib/fetchers/thread";

export default async function Home() {
  const data = (await getThreads()) || { threads: [], userId: "" };

  return (
    <div className="container mx-auto py-8">
      <Tabs defaultValue="vote" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="vote">Vote</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="vote">
          <VoteClient initialThreads={data.threads} userId={data.userId} />
        </TabsContent>

        <TabsContent value="leaderboard">
          <LeaderboardClient />
        </TabsContent>
      </Tabs>
    </div>
  );
}
