"use server";

import { VoteRequestBody } from "@/types";
import { callApi } from "../utils";
import { revalidateTag } from "next/cache";

export const vote = async (voteInfo: VoteRequestBody) => {
  const res = await callApi("/api/vote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(voteInfo),
  });
  revalidateTag("get-threads");
  return res;
};
