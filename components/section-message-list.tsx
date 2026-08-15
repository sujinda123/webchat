import React, { useMemo } from "react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";

async function fetchConversation(room_id: string) {
  const res = await fetch(`/api/chats/${room_id}`);
  if (!res.ok) throw new Error("เกิดข้อผิดพลาดในการดึงข้อมูล");
  return res.json();
}

export interface Conversation {
  message_id: string;
  text: string;
  timestamp: Date;
  is_self: boolean;
}

interface Profile {
  name: string;
  avatar: string;
}

interface Data {
  messages: Conversation[];
  profile: Profile;
}

export default function SectionMessageList({ room_id }: { room_id: string }) {
  const { data: data, isLoading } = useQuery<Data>({
    queryKey: ["conversation", room_id],
    queryFn: () => fetchConversation(room_id),
  });

  const sortedMessages = useMemo(() => {
    if (!data?.messages) return undefined;
    return [...data.messages].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [data]);

  if (isLoading) return null;

  if (!sortedMessages) return null;

  return (
    <div className="flex flex-col gap-2">
      {sortedMessages.map((item: Conversation, index: number) => (
        <div
          key={item.message_id || index}
          className={cn(
            item.is_self ? "bg-blue-100 text-black" : "bg-gray-100",
            "p-2 rounded-md",
          )}
        >
          <div className={cn("flex items-center")}>
            {item.is_self ? (
              <Avatar className="mr-2">
                <Image
                  src="https://github.com/evilrabbit.png"
                  alt="You"
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              </Avatar>
            ) : (
              <Avatar className="mr-2">
                <Image
                  src={data?.profile?.avatar || "https://github.com/evilrabbit.png"}
                  alt={data?.profile?.name || ""}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              </Avatar>
            )}
            <span className={item.is_self ? "text-right" : "text-left"}>
              {item.is_self ? "You" : data?.profile?.name || ""}
            </span>
          </div>
          <div className="mt-2">
            เวลา {new Date(item.timestamp).toLocaleString("th")}
            <p
              className={cn(
                item.is_self
                  ? "bg-blue-200 text-black"
                  : "bg-gray-200 text-black",
                "p-2 rounded-md",
              )}
            >
              {item.text}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
