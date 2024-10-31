import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import VoteClient from "./components/vote-client";
import LeaderboardClient from "./components/leaderboard-client";
import { getThreads } from "@/lib/fetchers/thread";
import { headers } from "next/headers";

export default async function Home() {
  const data = await getThreads();
  const headersList = await headers();
  const referer = headersList.get("referer");
  console.log("referer", referer);

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
