import { apiRequestClientStream } from "../apiRequestClient";
import { API_URLS } from "./urls";

export const aiController = {
  generate: (data: {
    meetingId: string;
    meetId: string;
    assistantId: string;
    signal?: AbortSignal;
    onDelta?: (text: string) => void;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }) => {
    const { signal, onDelta, onStart, onEnd, onError, ...bodyData } = data;
    (async () => {
      try {
        onStart?.();
        const response = await apiRequestClientStream(API_URLS.AI.GENERATE, {
          method: "POST",
          body: JSON.stringify(bodyData),
          signal,
        });
        if (!response.ok || !response.body) {
          throw new Error("Failed to connect to stream");
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer = decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          for (const line of lines) {
            const clean = line.trim();
            if (!clean) continue;
            try {
              const json = JSON.parse(clean);
              if (json.content) {
                onDelta?.(json.content);
              } else if (json.event === "thread.message.delta") {
                await new Promise((res) => setTimeout(res, 60));
                onDelta?.(json.data.delta.content[0].text.value);
              } else if (json.event === "thread.message.completed") {
                onEnd?.();
              } else if (json.event === "thread.run.completed") {
                onDelta?.("");
              }
            } catch {
              // ignore parse errors for incomplete chunks
            }
          }
        }
        onEnd?.();
      } catch (err) {
        onError?.(err);
        onEnd?.();
      }
    })();
  },
};
