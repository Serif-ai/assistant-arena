import prisma from "../lib/prisma";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const posts = await prisma.post.findMany();
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Button>Click me</Button>
      <div>
        {posts.map((post) => (
          <div key={post.id}>
            <div>{post.title}</div>
            <div>{post.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
