import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { UploadedAIResponse, UploadedEmailThread } from "@/types";
import { DEFAULT_ELO_RATING } from "@/const";

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
    ) as UploadedEmailThread[];
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
        threadResults = await prisma.emailThread.createMany({
          data: emailThreads.map((thread) => ({
            id: thread.id,
            groundTruth: thread.groundTruth as Prisma.InputJsonValue,
            messages: thread.thread as Prisma.InputJsonValue[],
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
            content: response.response,
            threadId: response.exampleId,
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
