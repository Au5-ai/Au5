// "use client";

// import { Assistant } from "@/shared/types/assistants";
// import React, { useEffect, useState } from "react";
// import { Bot, User } from "lucide-react";
// import { motion } from "framer-motion";
// import { Card } from "@/shared/components/ui";
// import { aiController } from "@/shared/network/api/aiController";

// interface AIContentsProps {
//   assistant: Assistant;
//   meetId: string;
//   meetingId: string;
// }

// export default function AIContents({
//   assistant,
//   meetId,
//   meetingId,
// }: AIContentsProps) {
//   const [messages, setMessages] = useState<string[]>([]);
//   const [isStreaming, setIsStreaming] = useState(false);

//   useEffect(() => {
//     let cancelled = false;
//     const controller = new AbortController();

//     async function init() {
//       try {
//         setIsStreaming(true);
//         setMessages([]); // clear previous messages

//         // const response = await aiController.generate({
//         //   meetingId,
//         //   meetId,
//         //   assistantId: assistant.id,
//         // });
//         const response = await fetch("http://localhost:1366/ai/generate", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             authorization:
//               "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjExMDA3ZDlhLTRlZGQtNDEwZi05MTdiLWUxZTIzZGY0NzJkZCIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJNb2hhbW1hZCBLYXJpbWkiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiIyIiwianRpIjoiYTMwODVmNmMtMDM5MS00YzNiLTk4OTgtZjQ4YWI3YjNlYTdmIiwiZXhwIjoxNzU5OTE1MDg1LCJpc3MiOiJBdTUiLCJhdWQiOiJBdTUtY2xpZW50cyJ9.BLZn6gCgmGAdNZYCaxa56gwoHOEcc_Y0dOpPlYzOmD4",
//           },
//           body: JSON.stringify({
//             meetingId,
//             meetId,
//             assistantId: assistant.id,
//           }),
//           signal: controller.signal,
//         });

//         if (!response.ok || !response.body) {
//           console.error("Failed to connect to stream");
//           setIsStreaming(false);
//           return;
//         }

//         const reader = response.body.getReader();
//         const decoder = new TextDecoder();
//         let partial = "";

//         while (true) {
//           const { done, value } = await reader.read();
//           if (done || cancelled) break;

//           partial += decoder.decode(value, { stream: true });

//           const lines = partial.split("\n");
//           partial = lines.pop() ?? "";

//           // ✅ Batch update once per chunk
//           const newMessages = lines
//             .map((line) => line.trim())
//             .filter(Boolean)
//             .map((line) => `🤖 AI: ${line}`);

//           if (newMessages.length) {
//             setMessages((prev) => [...prev, ...newMessages]);
//           }
//         }
//       } catch (err) {
//         if (!cancelled) console.error("Stream error:", err);
//       } finally {
//         setIsStreaming(false);
//       }
//     }

//     init();

//     // Cleanup when component unmounts or props change
//     return () => {
//       cancelled = true;
//       controller.abort();
//     };
//   }, [assistant.id, meetId, meetingId]);

//   return (
//     <Card className="flex flex-col w-full max-w-2xl mx-auto p-4 gap-8 shadow-none border-0 pt-8">
//       {/* User prompt */}
//       <motion.div
//         initial={{ opacity: 0, y: 10 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="flex items-start justify-end">
//         <div className="px-4 py-2 rounded-2xl text-sm max-w-[75%] bg-primary text-white rounded-br-none">
//           {assistant.instructions}
//         </div>
//         <div className="p-2 rounded-full bg-primary/10 ml-2">
//           <User className="h-4 w-4 text-primary" />
//         </div>
//       </motion.div>

//       {/* AI messages */}
//       <motion.div
//         initial={{ opacity: 0, y: 10 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="flex items-start justify-start">
//         <div className="p-2 rounded-full bg-muted mr-2">
//           <Bot className="h-4 w-4 text-primary" />
//         </div>
//         <div className="px-4 py-2 rounded-2xl text-sm max-w-[75%] bg-muted text-foreground rounded-bl-none">
//           {messages.map((m, i) => (
//             <div key={i} className="text-sm whitespace-pre-wrap">
//               {m}
//             </div>
//           ))}
//           {isStreaming && (
//             <motion.span
//               className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse ml-2"
//               layout
//             />
//           )}
//         </div>
//       </motion.div>
//     </Card>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { Bot, User } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/shared/components/ui";
import { Assistant } from "@/shared/types/assistants";

interface AIContentsProps {
  assistant: Assistant;
  meetId: string;
  meetingId: string;
}

export default function AIContents({
  assistant,
  meetId,
  meetingId,
}: AIContentsProps) {
  const [messages, setMessages] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    let cancel = false;
    const controller = new AbortController();

    async function init() {
      setIsStreaming(true);
      setMessages([]);

      const response = await fetch("http://localhost:1366/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjExMDA3ZDlhLTRlZGQtNDEwZi05MTdiLWUxZTIzZGY0NzJkZCIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJNb2hhbW1hZCBLYXJpbWkiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiIyIiwianRpIjoiYTMwODVmNmMtMDM5MS00YzNiLTk4OTgtZjQ4YWI3YjNlYTdmIiwiZXhwIjoxNzU5OTE1MDg1LCJpc3MiOiJBdTUiLCJhdWQiOiJBdTUtY2xpZW50cyJ9.BLZn6gCgmGAdNZYCaxa56gwoHOEcc_Y0dOpPlYzOmD4",
        },
        body: JSON.stringify({ meetingId, meetId, assistantId: assistant.id }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        console.error("Failed to connect to stream");
        setIsStreaming(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done || cancel) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const clean = line.trim();
          if (!clean) continue;

          try {
            const json = JSON.parse(clean);
            if (json.type === "response.output_text.delta") {
              // Each delta is a new partial AI token
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] =
                  (copy[copy.length - 1] || "") + json.delta;
                return copy;
              });
            } else if (json.type === "response.completed") {
              setIsStreaming(false);
            } else if (json.type === "thread.created") {
              setMessages((prev) => [...prev, ""]);
            }
          } catch {
            // Sometimes it's raw text not JSON
            setMessages((prev) => [...prev, clean]);
          }
        }
      }
      setIsStreaming(false);
    }

    init();

    return () => {
      cancel = true;
      controller.abort();
    };
  }, [assistant.id, meetId, meetingId]);

  return (
    <Card className="flex flex-col w-full max-w-2xl mx-auto p-4 gap-8 shadow-none border-0 pt-8">
      {/* User message */}
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

      {/* AI streaming response */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-start">
        <div className="p-2 rounded-full bg-muted mr-2">
          <Bot className="h-4 w-4 text-primary" />
        </div>
        <div className="px-4 py-2 rounded-2xl text-sm max-w-[75%] bg-muted text-foreground rounded-bl-none whitespace-pre-wrap">
          {messages.join("")}
          {isStreaming && (
            <motion.span
              className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse ml-1"
              layout
            />
          )}
        </div>
      </motion.div>
    </Card>
  );
}
