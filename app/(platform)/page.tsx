import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import VoteClient from "./components/vote-client";
import LeaderboardClient from "./components/leaderboard-client";
import { getThreads } from "@/lib/fetchers/thread";
import { headers } from "next/headers";

export default async function Home() {
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for") || headersList.get("remote-addr");
  console.log(ip);

  const defaultTab = "vote";
  console.time("initialData");
  const initialData = ip ? await getThreads(ip) : null;
  console.timeEnd("initialData");
  console.log(initialData);

  return (
    <div className="container mx-auto py-8">
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="vote">Vote</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="vote">
          <VoteClient initialData={initialData} />
        </TabsContent>

        <TabsContent value="leaderboard">
          <LeaderboardClient />
        </TabsContent>
      </Tabs>
    </div>
  );
}
