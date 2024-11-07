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
  const ip = request.nextUrl.searchParams.get("clientIp") || "unknown";
  console.time("total");
  console.time("threads");

  const [userWithVotes, initialThreads] = await Promise.all([
    prisma.user.upsert({
      where: { ip },
      create: { ip },
      update: {},
      select: {
        id: true,
        votes: {
          select: { threadId: true },
        },
      },
    }),
    prisma.thread.findMany({
      where: {
        id: { notIn: excludeThreadIds },
      },
      include: {
        drafts: {
          include: { model: true },
        },
        groundTruth: true,
      },
    }),
  ]);
  console.timeEnd("threads");
  const user = userWithVotes;
  const votedIds = new Set(user.votes.map((v) => v.threadId));
  let threads = initialThreads.filter((t) => !votedIds.has(t.id));

  const hasMore = threads.length > BATCH_SIZE;
  threads = threads.sort(() => Math.random() - 0.5).slice(0, BATCH_SIZE);

  if (!threads.length) {
    return NextResponse.json({
      userId: user.id,
      threads: [],
      hasMore: false,
    });
  }

  const threadData: ThreadWithResponses[] = threads
    .map((thread) => {
      if (!thread.drafts || thread.drafts.length < 2) return null;

      const [responseA, responseB] = thread.drafts
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);

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
        groundTruth: thread.groundTruth[0]
          ? {
              email: thread.groundTruth[0].email as TypedEmail,
            }
          : undefined,
      } as ThreadWithResponses;
    })
    .filter((t): t is NonNullable<typeof t> => !!t);
  console.timeEnd("total");

  return NextResponse.json({
    userId: user.id,
    threads: threadData,
    hasMore,
  });
}
