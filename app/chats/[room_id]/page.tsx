"use client";
import SectionMessageList from "@/components/section-message-list";
import SectionSendMessage from "@/components/section-send-message";
import { useParams } from "next/navigation";

export default function Page() {
  const { room_id } = useParams<{ room_id: string }>();

  return (
    <div className="flex flex-col gap-2 h-[calc(100vh-150px)] overflow-auto">
      <h1 className="text-amber-600  text-4xl font-bold mb-4">
        Chat with {room_id}
      </h1>
      <div className="bg-white p-4 rounded-md shadow-md w-full h-full overflow-auto">
        <SectionMessageList room_id={room_id} />
      </div>
      <div className="p-4 rounded-md shadow-md w-full">
        <SectionSendMessage userId={room_id} />
      </div>
    </div>
  );
}
