"use client";
import React, { useState } from "react";

export default function SectionSendMessage(props: { userId: string }) {
  const userId = props.userId;
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (message.trim() === "") {
      return;
    }

    fetch("/api/chats", {
      method: "POST",
      body: JSON.stringify({ user: userId, message }),
    });

    setMessage("");
  };

  return (
    <div className="flex items-center gap-2">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 w-full h-full"
      >
        <input
          type="text"
          placeholder="Type a message..."
          className="w-full h-full p-2 rounded-md border border-gray-300"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 font-bold bg-blue-500 text-white rounded-md border border-blue-500"
        >
          Send
        </button>
      </form>
    </div>
  );
}
