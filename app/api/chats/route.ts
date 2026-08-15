import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { pushMessageToUser } from "@/services/push/push.service";

export async function GET() {
  const keys = await redis.keys("line:user:*");

  if (keys.length === 0) {
    return NextResponse.json({ data: [] });
  }

  const data = await Promise.all(
    keys.map(async (key) => {
      const data = await redis.hgetall(key);
      return {
        userId: key.replace("line:user:", ""),
        lastMessage: data.lastMessage || "-",
        lastActive: data.lastActive ? Number(data.lastActive) : Date.now(),
        name: data.name || "-",
        avatar: data.avatar || "",
      };
    }),
  );

  data.sort((a, b) => b.lastActive - a.lastActive);

  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  try {
    const { user, message } = await req.json();

    redis.lpush(
      `line:chat:${user}`,
      JSON.stringify({ user, text: message, timestamp: Date.now(), is_self: true }),
    );

    await pushMessageToUser(user, message);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Send message error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
