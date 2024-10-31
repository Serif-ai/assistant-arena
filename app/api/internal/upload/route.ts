import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { UploadedAIResponse, UploadedEmailThread } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const emailThreadsFile = formData.get("emailThreads") as File | null;
    const aiResponsesFile = formData.get("aiResponses") as File | null;
    const organization = formData.get("organization") as string | null;
    const model = formData.get("model") as string | null;

    console.log("organization", organization);
    console.log("model", model);
    console.log("emailThreadsFile", emailThreadsFile);
    console.log("aiResponsesFile", aiResponsesFile);

    const emailThreads = JSON.parse(
      (await emailThreadsFile?.text()) || "[]"
    ) as UploadedEmailThread[];
    const aiResponses = JSON.parse(
      (await aiResponsesFile?.text()) || "[]"
    ) as UploadedAIResponse[];

    console.log("emailThreads", emailThreads);
    console.log("aiResponses", aiResponses);

    if (!Array.isArray(emailThreads) && !Array.isArray(aiResponses)) {
      return NextResponse.json(
        { error: "Invalid file format" },
        { status: 400 }
      );
    }

    let threadResults;
    if (emailThreads.length) {
      console.log("before creating email threads");
      try {
        threadResults = await prisma.emailThread.createMany({
          data: emailThreads.map((thread) => ({
            id: thread.id,
            groundTruth: thread.groundTruth as Prisma.InputJsonValue,
            messages: thread.thread as Prisma.InputJsonValue[],
          })),
        });
      } catch (error) {
        console.error("Error creating email threads:", error);
      }
    }

    let responseResults;
    if (aiResponses.length) {
      console.log("before creating ai responses");
      try {
        responseResults = await prisma.aIResponse.createMany({
          data: aiResponses.map((response) => ({
            content: response.response,
            threadId: response.exampleId,
            organization: organization || "",
            model: model || "",
          })),
        });
      } catch (error) {
        console.error("Error creating AI responses:", error);
      }
    }

    console.log("threadResults", {
      success: true,
      threadCount: threadResults?.count || 0,
      responseCount: responseResults?.count || 0,
    });

    return NextResponse.json({
      success: true,
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
