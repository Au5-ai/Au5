# Create a thread and run it with streaming response.

**Returns Server-Sent Events (SSE)** with a unified event model.  
Each event has a type and only the relevant fields filled.

## Event Types and Fields:
- `thread.created`: `thread_id`
- `run.created`: `run_id`, `thread_id`, `assistant_id`, `status`, `created_at`
- `run.queued`: `run_id`
- `run.in_progress`: `run_id`
- `message.created`: `message_id`, `thread_id`, `role`
- `message.in_progress`: `message_id`
- `content`: `text`, `index` (actual response content)
- `message.completed`: `message_id`, `thread_id`
- `run.completed`: `run_id`, `status`
- `run.failed`: `run_id`, `status`, `error`
- `error`: `error`, `details`
- `done`: (signals end of stream)

## Example Request:
```json
{
  "assistant_id": "asst_abc123",
  "thread": {
    "messages": [
      {"role": "user", "content": "Tell me a joke"}
    ]
  }
}
```

## Example Streaming Response:

data: {"type":"thread.created","thread_id":"thread_abc"}

data: {"type":"run.created","run_id":"run_xyz","thread_id":"thread_abc","assistant_id":"asst_123","status":"queued","created_at":1234567890}

data: {"type":"content","text":"Why","index":0}

data: {"type":"content","text":" did","index":0}

data: {"type":"content","text":" the","index":0}

data: {"type":"content","text":" chicken","index":0}

data: {"type":"run.completed","run_id":"run_xyz","status":"completed"}

data: {"type":"done"}
