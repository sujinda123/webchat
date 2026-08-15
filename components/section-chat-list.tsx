"use client";
import { Avatar } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";

import Image from "next/image";
import Link from "next/link";

async function fetchChatList() {
  const res = await fetch("/api/chats");
  if (!res.ok) throw new Error("เกิดข้อผิดพลาดในการดึงข้อมูล");
  return res.json();
}

export interface Chat {
  userId: string;
  lastMessage: string;
  lastActive: number;
  name: string;
  avatar: string;
}

interface ChatListResponse {
  data: Chat[];
}

export default function SectionChatList() {
  const { data, isLoading } = useQuery<ChatListResponse>({
    queryKey: ["chats"],
    queryFn: fetchChatList,
  });

  if (isLoading) return null;

  return (
    <div className="flex flex-col items-center gap-2">
      {data?.data?.map((chat: Chat) => (
        <Link
          href={`/chats/${chat.userId}`}
          key={chat.userId}
          className="flex items-center gap-2 bg-white p-2 rounded-md shadow-md w-full cursor-pointer hover:bg-gray-100"
        >
          <Avatar>
            <Image
              src={chat.avatar}
              alt={chat.name}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          </Avatar>
          <h2 className="text-lg font-bold">{chat.name}</h2>
        </Link>
      ))}
    </div>
  );
}
