"use server";

import { GetThreadsResponse } from "@/types/thread";
import { callApi } from "../utils";

export const getThreads = async (excludeThreadIds: string[] = []) => {
  const resp = await callApi<GetThreadsResponse>(
    "/api/thread/random" +
      (excludeThreadIds.length ? `?exclude=${excludeThreadIds.join(",")}` : ""),
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
