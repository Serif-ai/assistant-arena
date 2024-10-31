import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Get models with their vote counts
    const models = await prisma.model.findMany({
      select: {
        id: true,
        name: true,
        organization: true,
        eloRating: true,
        _count: {
          select: {
            votesWon: true,
            responses: true,
          }
        }
      },
      orderBy: {
        eloRating: 'desc'
      }
    });

    // Format the response
    const leaderboard = models.map((model) => ({
      assistant: model.name,
      organization: model.organization,
      arenaScore: Math.round(model.eloRating),
      votes: model._count.responses, // Total responses
      wins: model._count.votesWon,   // Winning votes
    }));

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard data" },
      { status: 500 }
    );
  }
}
