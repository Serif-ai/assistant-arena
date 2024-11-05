"use server";

import { revalidateTag } from "next/cache";
import { callApi } from "../utils";

export const upload = async (formData: FormData) => {
  const res = await callApi<{
    threadCount: number;
    responseCount: number;
    groundTruthCount: number;
  }>("/api/internal/upload", {
    method: "POST",
    body: formData,
  });

  revalidateTag("get-threads");
  return res;
};
