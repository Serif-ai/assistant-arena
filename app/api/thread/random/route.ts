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

  let testIp = null;
  if (process.env.NODE_ENV === "development") {
    testIp = await fetch("https://freeipapi.com/api/json/")
      .then((res) => res.json())
      .then((data) => data.ipAddress);
  }
  const ip = testIp || request.headers.get("x-forwarded-for") || "unknown";

  const user = await prisma.user.upsert({
    where: { ip },
    create: { ip },
    update: {},
  });

  const votedThreadIds = await prisma.vote.findMany({
    where: { userId: user.id },
    select: { threadId: true },
  });

  let threads = await prisma.thread.findMany({
    where: {
      id: {
        notIn: [...votedThreadIds.map((v) => v.threadId), ...excludeThreadIds],
      },
    },
    take: BATCH_SIZE + 1,
  });

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

  const groundTruths = await prisma.groundTruth.findMany({
    where: {
      threadId: { in: threads.map((t) => t.id) },
    },
  });

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

  return NextResponse.json({
    userId: user.id,
    threads: threadData,
    hasMore,
  });
}
