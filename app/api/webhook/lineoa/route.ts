import { redis } from "@/lib/redis";
import { getLineProfile } from "@/services/profile/profile.service";

export async function POST(request: Request) {
  const body = await request.json();
  const events = body.events || [];

  for (const event of events) {
    if (event.type === "message") {
      // Text
      if (event.message.type === "text") {
        const userId = event.source.userId;
        const text = event.message.text;
        const timestamp = event.timestamp;
        const replyToken = event.replyToken;
        const messageId = event.message.id;

        const existingProfile = await redis.hgetall(`line:user:${userId}`);

        if (!existingProfile.name) {
          const profile = await getLineProfile(userId);

          await redis.hset(`line:user:${userId}`, {
            lastReplyToken: replyToken,
            name: profile?.displayName || "",
            avatar: profile?.pictureUrl || "",
          });
        }

        const messageData = JSON.stringify({
          message_id: messageId,
          text,
          timestamp,
          replyToken,
          is_self: false,
        });

        await redis.rpush(`line:chat:${userId}`, messageData);

        console.log(`Saved message from ${userId}: ${text}`);
      }
    }
  }

  // const webhook = await redis.get("lineoa:webhook");

  // if (webhook) {
  //   console.log("from redis:", JSON.stringify(JSON.parse(webhook)));
  //   return Response.json({ message: "POST request received" });
  // }

  // await redis.set("lineoa:webhook", JSON.stringify(body), "EX", 60);
  // console.dir(body, { depth: null });

  return Response.json({ message: "POST request received" });
}
