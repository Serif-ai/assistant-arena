import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { BATCH_SIZE } from "@/const";

export async function GET(request: NextRequest) {
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

  let threads = await prisma.emailThread.findMany({
    where: {
      id: { notIn: votedThreadIds.map((v) => v.threadId) },
    },
    take: BATCH_SIZE + 1,
  });

  const hasMore = threads.length > BATCH_SIZE;
  threads = threads.slice(0, BATCH_SIZE);

  if (!threads.length) {
    return NextResponse.json({
      userId: user.id,
      threads: [],
    });
  }

  const drafts = await prisma.aIResponse.findMany({
    where: {
      threadId: { in: threads.map((t) => t.id) },
    },
  });

  const responsesByThread = drafts.reduce((acc, draft) => {
    if (!acc[draft.threadId]) {
      acc[draft.threadId] = [];
    }
    acc[draft.threadId].push(draft);
    return acc;
  }, {} as Record<string, typeof drafts>);
  console.log("responsesByThread", responsesByThread);

  const threadData = threads
    .map((thread) => {
      const threadResponses = responsesByThread[thread.id] || [];

      if (threadResponses.length < 2) {
        return null;
      }

      const shuffledResponses = threadResponses.sort(() => Math.random() - 0.5);
      const [responseA, responseB] = shuffledResponses.slice(0, 2);

      return {
        thread: {
          id: thread.id,
          messages: thread.messages,
        },
        responses: {
          a: {
            id: responseA.id,
            content: responseA.content,
          },
          b: {
            id: responseB.id,
            content: responseB.content,
          },
        },
      };
    })
    .filter((t) => t);

  return NextResponse.json({
    userId: user.id,
    threads: threadData,
    hasMore,
  });
}
