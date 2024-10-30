import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { EmailThread, Prisma } from "@prisma/client";
import { AIResponse } from "@prisma/client";

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

    // Read and parse the files
    const emailThreads = JSON.parse(
      (await emailThreadsFile?.text()) || "[]"
    ) as EmailThread[];
    const aiResponses = JSON.parse(
      (await aiResponsesFile?.text()) || "[]"
    ) as AIResponse[];

    console.log("emailThreads", emailThreads);
    console.log("aiResponses", aiResponses);

    // Validate the data structure
    if (!Array.isArray(emailThreads) && !Array.isArray(aiResponses)) {
      return NextResponse.json(
        { error: "Invalid file format" },
        { status: 400 }
      );
    }

    let threadResults;
    if (emailThreads.length) {
      threadResults = await prisma.emailThread.createMany({
        data: emailThreads.map((thread) => ({
          id: thread.id,
          groundTruth: thread.groundTruth as Prisma.InputJsonValue,
        })),
      });
    }

    let responseResults;
    if (aiResponses.length) {
      responseResults = await prisma.aIResponse.createMany({
        data: aiResponses.map((response) => ({
          content: response.content,
          threadId: response.threadId,
          organization: organization || "",
          model: model || "",
        })),
      });
    }

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
