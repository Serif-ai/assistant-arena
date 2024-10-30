export const vote = async (
  userIp: string,
  emailThreadId: string,
  vote: "up" | "down"
) => {
  const resp = await fetch("/api/vote", {
    method: "POST",
    body: JSON.stringify({ userIp, emailThreadId, vote }),
  });

  return resp.json();
};
