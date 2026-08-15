import { redis, redisPub } from "@/lib/redis";
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
            name: profile?.displayName || "",
            avatar: profile?.pictureUrl || "",
          });
        }

        await redis.hset(`line:user:${userId}`, {
          lastReplyToken: replyToken,
          lastActiveTime: timestamp,
        });

        const messageObj = {
          message_id: messageId,
          text,
          timestamp,
          replyToken,
          is_self: false, // False = Customer
        };

        const messageData = JSON.stringify(messageObj);

        // Save message to Redis list
        await redis.rpush(`line:chat:${userId}`, messageData);

        // psubscribe
        await redisPub.publish(`line:chat:${userId}`, messageData);

        console.log(`Saved & Published message from ${userId}: ${text}`);
      }
    }
  }

  return Response.json({ message: "POST request received" });
}
