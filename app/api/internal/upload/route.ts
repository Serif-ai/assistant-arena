import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { UploadedAIResponse } from "@/types/ai-response";
import { DEFAULT_ELO_RATING } from "@/const";
import { EmailThreadCreateBody } from "@/types/thread";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const emailThreadsFile = formData.get("emailThreads") as File | null;
    const aiResponsesFile = formData.get("aiResponses") as File | null;
    const organization = formData.get("organization") as string | null;
    const modelName = formData.get("model") as string | null;

    if (!organization || !modelName) {
      return NextResponse.json(
        { error: "Organization and model name are required" },
        { status: 400 }
      );
    }

    const emailThreads = JSON.parse(
      (await emailThreadsFile?.text()) || "[]"
    ) as EmailThreadCreateBody[];
    const aiResponses = JSON.parse(
      (await aiResponsesFile?.text()) || "[]"
    ) as UploadedAIResponse[];

    if (!Array.isArray(emailThreads) && !Array.isArray(aiResponses)) {
      return NextResponse.json(
        { error: "Invalid file format" },
        { status: 400 }
      );
    }

    let threadResults;
    if (emailThreads.length) {
      try {
        threadResults = await prisma.thread.createMany({
          data: emailThreads.map((thread) => ({
            id: thread.id,
            emails: thread.emails as Prisma.InputJsonValue[],
            userEmail: thread.userEmail,
          })),
          skipDuplicates: true,
        });
        console.log("threadResults", threadResults);
      } catch (error) {
        console.error("Error creating email threads:", error);
        throw error;
      }
    }

    let responseResults;
    if (aiResponses.length && modelName && organization) {
      try {
        const model = await prisma.model.upsert({
          where: {
            name_organization: {
              name: modelName,
              organization: organization,
            },
          },
          create: {
            name: modelName,
            organization: organization,
            eloRating: DEFAULT_ELO_RATING,
          },
          update: {},
        });

        responseResults = await prisma.aIResponse.createMany({
          data: aiResponses.map((response) => ({
            draft: response.draft,
            threadId: response.threadId,
            modelId: model.id,
          })),
          skipDuplicates: true,
        });

        console.log("responseResults", responseResults);
      } catch (error) {
        console.error("Error creating AI responses:", error);
        throw error;
      }
    }

    return NextResponse.json({
      threadCount: threadResults?.count || 0,
      responseCount: responseResults?.count || 0,
    });
  } catch (error) {
    console.error("Upload processing error:", error);
    return NextResponse.json(
      { error: "Failed to process uploads" },
      { status: 500 }
    );
  }
}
