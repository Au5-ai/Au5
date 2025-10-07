"use client";
import { Assistant } from "@/shared/types/assistants";

import React, { useState } from "react";

import { Bot, User } from "lucide-react";
import { motion } from "framer-motion";
import { Button, Card, Input } from "@/shared/components/ui";

interface AIContentsProps {
  assistant: Assistant;
}

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

export default function AIContents({ assistant }: AIContentsProps) {
  return (
    <Card className="flex flex-col w-full max-w-2xl mx-auto p-4 gap-8 shadow-none border-0 pt-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-end">
        <div className="px-4 py-2 rounded-2xl text-sm max-w-[75%] bg-primary text-white rounded-br-none">
          {assistant.instructions}
        </div>
        <div className="p-2 rounded-full bg-primary/10 ml-2">
          <User className="h-4 w-4 text-primary" />
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-start">
        <div className="p-2 rounded-full bg-muted mr-2">
          <Bot className="h-4 w-4 text-primary" />
        </div>
        <div className="px-4 py-2 rounded-2xl text-sm max-w-[75%] bg-muted text-foreground rounded-bl-none">
          Sure! It’s about creating a chat UI using shadcn and Tailwind.
        </div>
      </motion.div>
    </Card>
  );
}
