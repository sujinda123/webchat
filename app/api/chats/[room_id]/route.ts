import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ room_id: string }> },
) {
  const { room_id } = await params;
  const messages = await redis.lrange(`line:chat:${room_id}`, 0, -1);

  const profile = await redis.hgetall(`line:user:${room_id}`);

  const chatMessages = messages.map((message) => JSON.parse(message));

  return NextResponse.json(
    { messages: chatMessages, profile },
    { status: 200 },
  );
}
