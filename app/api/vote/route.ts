import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const K_FACTOR = 32;

function calculateEloRating(winnerRating: number, loserRating: number): number {
  const expectedScore = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  return Math.round(K_FACTOR * (1 - expectedScore));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, threadId, winnerId, loserId, timeToVote } = body;

  // Get current ELO ratings
  const [winner, loser] = await Promise.all([
    prisma.aIResponse.findUnique({ where: { id: winnerId } }),
    prisma.aIResponse.findUnique({ where: { id: loserId } }),
  ]);

  if (!winner || !loser) {
    return NextResponse.json({ error: "Invalid response IDs" }, { status: 400 });
  }

  const ratingChange = calculateEloRating(winner.eloRating, loser.eloRating);

  // Update ratings and create vote in transaction
  await prisma.$transaction([
    prisma.aIResponse.update({
      where: { id: winnerId },
      data: { eloRating: winner.eloRating + ratingChange },
    }),
    prisma.aIResponse.update({
      where: { id: loserId },
      data: { eloRating: loser.eloRating - ratingChange },
    }),
    prisma.vote.create({
      data: {
        userId,
        threadId,
        winningResponse: winnerId,
        losingResponse: loserId,
        timeToVote,
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}
