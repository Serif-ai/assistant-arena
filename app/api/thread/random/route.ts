import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { BATCH_SIZE } from "@/const";
import { ThreadWithResponses, TypedEmail } from "@/types";
import { GetThreadsResponse } from "@/types/thread";

export async function GET(
  request: NextRequest
): Promise<NextResponse<GetThreadsResponse>> {
  const exclude = request.nextUrl.searchParams.get("exclude");
  const excludeThreadIds = exclude ? exclude.split(",") : [];

  const debug: Record<string, number> = {};
  const startTotal = performance.now();
  const start1 = performance.now();
  
  let testIp = null;
  if (process.env.NODE_ENV === "development") {
    testIp = await fetch("https://freeipapi.com/api/json/")
      .then((res) => res.json())
      .then((data) => data.ipAddress);
  }
  debug["1"] = performance.now() - start1;

  const ip = testIp || request.headers.get("x-forwarded-for") || "unknown";
  const start2 = performance.now();
  const user = await prisma.user.upsert({
    where: { ip },
    create: { ip },
    update: {},
  });
  debug["2"] = performance.now() - start2;

  const votedThreadIds = await prisma.vote.findMany({
    where: { userId: user.id },
    select: { threadId: true },
  });
  debug["3"] = performance.now() - start2;

  let threads = await prisma.thread.findMany({
    where: {
      id: {
        notIn: [...votedThreadIds.map((v) => v.threadId), ...excludeThreadIds],
      },
    },
    take: BATCH_SIZE + 1,
  });
  debug["4"] = performance.now() - start2;

  const hasMore = threads.length > BATCH_SIZE;
  threads = threads.sort(() => Math.random() - 0.5).slice(0, BATCH_SIZE);

  if (!threads.length) {
    return NextResponse.json({
      userId: user.id,
      threads: [],
      hasMore: false,
    });
  }

  const drafts = await prisma.aIResponse.findMany({
    where: {
      threadId: { in: threads.map((t) => t.id) },
    },
    include: {
      model: true,
    },
  });
  debug["5"] = performance.now() - start2;

  const groundTruths = await prisma.groundTruth.findMany({
    where: {
      threadId: { in: threads.map((t) => t.id) },
    },
  });
  debug["6"] = performance.now() - start2;

  const groundTruthByThread = groundTruths.reduce((acc, groundTruth) => {
    acc[groundTruth.threadId] = groundTruth;
    return acc;
  }, {} as Record<string, (typeof groundTruths)[0]>);

  const responsesByThread = drafts.reduce((acc, draft) => {
    if (!acc[draft.threadId]) {
      acc[draft.threadId] = [];
    }
    acc[draft.threadId].push(draft);
    return acc;
  }, {} as Record<string, typeof drafts>);

  const threadData: ThreadWithResponses[] = threads
    .map((thread) => {
      const threadResponses = responsesByThread[thread.id] || [];
      const groundTruth = groundTruthByThread[thread.id];

      if (threadResponses.length < 2) {
        return null;
      }

      const shuffledResponses = threadResponses.sort(() => Math.random() - 0.5);
      const [responseA, responseB] = shuffledResponses.slice(0, 2);

      return {
        thread: {
          id: thread.id,
          emails: thread.emails as TypedEmail[],
        },
        responses: {
          a: {
            id: responseA.id,
            draft: responseA.draft as TypedEmail,
            model: responseA.model,
          },
          b: {
            id: responseB.id,
            draft: responseB.draft as TypedEmail,
            model: responseB.model,
          },
        },
        groundTruth: groundTruth
          ? {
              email: groundTruth.email as TypedEmail,
            }
          : undefined,
      } as ThreadWithResponses;
    })
    .filter((t): t is NonNullable<typeof t> => !!t);
  debug["7"] = performance.now() - start2;

  debug["total"] = performance.now() - startTotal;
  return NextResponse.json({
    userId: user.id,
    threads: threadData,
    hasMore,
    debug,
  });
}
