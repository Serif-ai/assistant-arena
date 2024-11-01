import { GetThreadsResponse } from "@/types/thread";
import { callApi } from "../utils";

export const getThreads = async () => {
  const resp = await callApi<GetThreadsResponse>("/api/thread/random");

  if (resp.success) {
    return resp.data;
  } else {
    return null;
  }
};
