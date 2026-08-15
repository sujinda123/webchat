"use client";
import { useEffect, useState, useMemo } from "react";
import { Avatar } from "@/components/ui/avatar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { io } from "socket.io-client";

async function fetchChatList() {
  const res = await fetch("/api/chats");
  if (!res.ok) throw new Error("เกิดข้อผิดพลาดในการดึงข้อมูล");
  return res.json();
}

export interface Chat {
  userId: string;
  lastActiveTime: number;
  name: string;
  avatar: string;
}

interface ChatListResponse {
  data: Chat[];
}

export default function SectionChatList() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<ChatListResponse>({
    queryKey: ["chats"],
    queryFn: fetchChatList,
  });

  const [activeUpdates, setActiveUpdates] = useState<Record<string, number>>(
    {},
  );

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      socket.emit("join-room", "admin-list-room");
    });

    // ดักฟังเฉพาะสัญญาณความเคลื่อนไหวเพื่อสั่งขยับรายชื่อ
    socket.on(
      "new-chat-activity",
      (data: { user: string; timestamp: number }) => {
        setActiveUpdates((prev) => ({
          ...prev,
          [data.user]: data.timestamp,
        }));

        queryClient.invalidateQueries({ queryKey: ["chats"] });
      },
    );

    return () => {
      socket.off("connect");
      socket.off("new-chat-activity");
      socket.disconnect();
    };
  }, [queryClient]);

  const displayChats = useMemo(() => {
    const initialChats = data?.data || [];

    const updatedChats = initialChats
      .map((chat) => {
        const newActiveTime = activeUpdates[chat.userId];
        const rawTime = newActiveTime || chat.lastActiveTime;
        const normalizedTime = rawTime < 10000000000 ? rawTime * 1000 : rawTime;

        return {
          ...chat,
          lastActiveTime: normalizedTime,
        };
      })
      .sort((a, b) => b.lastActiveTime - a.lastActiveTime);

    return updatedChats;
  }, [data?.data, activeUpdates]);

  if (isLoading) return null;

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      {displayChats.map((chat: Chat) => (
        <Link
          href={`/chats/${chat.userId}`}
          key={chat.userId}
          className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm w-full cursor-pointer hover:bg-gray-100 transition-all"
        >
          <div className="flex items-center gap-3">
            <Avatar>
              <Image
                src={chat.avatar || "https://github.com"}
                alt={chat.name || "User"}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            </Avatar>
            <div>
              <h2 className="text-base font-bold text-gray-800">
                {chat.name || chat.userId}
              </h2>
            </div>
          </div>
          <span className="text-[10px] text-gray-400">
            {chat.lastActiveTime
              ? new Date(chat.lastActiveTime).toLocaleTimeString("th", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
          </span>
        </Link>
      ))}
    </div>
  );
}
