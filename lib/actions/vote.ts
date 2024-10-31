import { VoteRequestBody } from "@/types";
import { callApi } from "../utils";

export const vote = async (voteInfo: VoteRequestBody) => {
  return await callApi("/api/vote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(voteInfo),
  });
};
