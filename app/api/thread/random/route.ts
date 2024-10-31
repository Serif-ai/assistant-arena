import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const BATCH_SIZE = 5; // Number of threads to return at once

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const user = await prisma.user.upsert({
    where: { ip },
    create: { ip },
    update: {},
  });

  const votedThreadIds = await prisma.vote.findMany({
    where: { userId: user.id },
    select: { threadId: true },
  });

  const threads = await prisma.emailThread.findMany({
    where: {
      id: { notIn: votedThreadIds.map((v) => v.threadId) },
    },
    take: BATCH_SIZE,
  });

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

  const threadData = threads.map((thread) => {
    const threadResponses = responsesByThread[thread.id] || [];
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
  });

  return NextResponse.json({
    userId: user.id,
    threads: threadData,
  });
}
