"use server";

import { GetThreadsResponse } from "@/types/thread";
import { callApi } from "../utils";

export const getThreads = async (ip?: string) => {
  const resp = await callApi<GetThreadsResponse>(
    "/api/thread/random" + (ip ? `?ip=${ip}` : ""),
    {
      next: {
        tags: ["get-threads"],
      },
      cache: "no-store",
    }
  );

  if (resp.success) {
    return resp.data;
  } else {
    return null;
  }
};
