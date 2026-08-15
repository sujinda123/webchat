import { useEffect, useState, useMemo } from "react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { io } from "socket.io-client";

async function fetchConversation(room_id: string) {
  const res = await fetch(`/api/chats/${room_id}`);
  if (!res.ok) throw new Error("เกิดข้อผิดพลาดในการดึงข้อมูล");
  return res.json();
}

export interface Conversation {
  message_id?: string;
  text: string;
  timestamp: Date | string | number;
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
  // Query
  const { data, isLoading } = useQuery<Data>({
    queryKey: ["conversation", room_id],
    queryFn: () => fetchConversation(room_id),
  });

  // Socket
  const [realtimeMessages, setRealtimeMessages] = useState<Conversation[]>([]);

  // Socket Connection
  useEffect(() => {
    if (!room_id) return;

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      transports: ["websocket"],
    });

    // Wait Join Room
    socket.on("connect", () => {
      console.log("Socket connected, joining room:", room_id);
      socket.emit("join-room", room_id);
    });

    socket.on("receive-message", (newMessage: Conversation) => {
      setRealtimeMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      socket.emit("leave-room", room_id);
      socket.off("connect");
      socket.off("receive-message");
      socket.disconnect();
    };
  }, [room_id]);

  // All Messages
  const allMessages = useMemo(() => {
    const initialMessages = data?.messages || [];
    return [...initialMessages, ...realtimeMessages];
  }, [data?.messages, realtimeMessages]);

  // Sort Messages
  const sortedMessages = useMemo(() => {
    return [...allMessages].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [allMessages]);

  if (isLoading) return null;
  if (!sortedMessages.length) return null;

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
                  src={
                    data?.profile?.avatar || "https://github.com/evilrabbit.png"
                  }
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
