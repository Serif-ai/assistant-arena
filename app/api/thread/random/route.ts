import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ThreadWithResponses, TypedEmail } from "@/types";
import { GetThreadsResponse } from "@/types/thread";

export async function GET(
  request: NextRequest
): Promise<NextResponse<GetThreadsResponse>> {
  let ip = request.nextUrl.searchParams.get("ip");
  if (!ip) {
    ip = request.headers.get("x-forwarded-for") || "unknown";
  }

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
      include: {
        drafts: {
          include: { model: true },
        },
        groundTruth: true,
      },
    }),
  ]);
  const user = userWithVotes;
  const votedIds = new Set(user.votes.map((v) => v.threadId));
  let threads = initialThreads.filter((t) => !votedIds.has(t.id));

  threads = threads.sort(() => Math.random() - 0.5);

  if (!threads.length) {
    return NextResponse.json({
      userId: user.id,
      threads: [],
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
    debug: {
      ip,
    },
  });
}
