import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ELO_K_FACTOR } from "@/const";

function calculateEloRating(winnerRating: number, loserRating: number): number {
  const expectedScore =
    1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  return Math.round(ELO_K_FACTOR * (1 - expectedScore));
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    userId: string;
    threadId: string;
    winnerId: string;
    loserId: string;
    timeToVote: number;
  };

  const { userId, threadId, winnerId, loserId, timeToVote } = body;

  const [winnerResponse, loserResponse] = await Promise.all([
    prisma.aIResponse.findUnique({
      where: { id: winnerId },
      include: { model: true },
    }),
    prisma.aIResponse.findUnique({
      where: { id: loserId },
      include: { model: true },
    }),
  ]);

  if (!winnerResponse?.model || !loserResponse?.model) {
    return NextResponse.json(
      { error: "Invalid response or model IDs" },
      { status: 400 }
    );
  }

  const ratingChange = calculateEloRating(
    winnerResponse.model.eloRating,
    loserResponse.model.eloRating
  );

  await prisma.$transaction([
    prisma.model.update({
      where: { id: winnerResponse.model.id },
      data: { eloRating: winnerResponse.model.eloRating + ratingChange },
    }),
    prisma.model.update({
      where: { id: loserResponse.model.id },
      data: { eloRating: loserResponse.model.eloRating - ratingChange },
    }),
    prisma.vote.create({
      data: {
        userId,
        threadId,
        winnerModelId: winnerResponse.model.id,
        loserModelId: loserResponse.model.id,
        timeToVote,
      },
    }),
  ]);

  return NextResponse.json({
    success: true,
    ratingChange,
    newWinnerRating: winnerResponse.model.eloRating + ratingChange,
    newLoserRating: loserResponse.model.eloRating - ratingChange,
  });
}
