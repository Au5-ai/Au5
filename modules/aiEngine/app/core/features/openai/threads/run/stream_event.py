from enum import Enum
from pydantic import BaseModel
from typing import Optional, Dict, Any

class StreamEventType(str, Enum):
    THREAD_CREATED = "thread.created"
    RUN_CREATED = "thread.run.created"
    RUN_QUEUED = "thread.run.queued"
    RUN_IN_PROGRESS = "thread.run.in_progress"
    RUN_REQUIRES_ACTION = "thread.run.requires_action"
    RUN_COMPLETED = "thread.run.completed"
    RUN_FAILED = "thread.run.failed"
    RUN_CANCELLED = "thread.run.cancelled"
    RUN_EXPIRED = "thread.run.expired"
    MESSAGE_CREATED = "thread.message.created"
    MESSAGE_IN_PROGRESS = "thread.message.in_progress"
    MESSAGE_DELTA = "thread.message.delta"
    MESSAGE_COMPLETED = "thread.message.completed"
    ERROR = "error"
    DONE = "done"
    UNKNOWN = "unknown"
    


class StreamEvent(BaseModel):
    """
    Unified stream event model with optional properties.
    Each event type only fills its required fields.
    """
    type: StreamEventType | str
    
    # Thread fields
    thread_id: Optional[str] = None
    
    # Run fields
    run_id: Optional[str] = None
    assistant_id: Optional[str] = None
    status: Optional[str] = None
    created_at: Optional[int] = None
    
    # Message fields
    message_id: Optional[str] = None
    role: Optional[str] = None
    
    # Content fields
    text: Optional[str] = None
    index: Optional[int] = None
    
    # Error fields
    error: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    
    class Config:
        use_enum_values = True
    
    
    
    
class StreamEventFactory:
    
    @staticmethod
    def create_event(event_type_str: str, event: Any) -> StreamEvent:
        """Create StreamEvent from OpenAI event using match/case"""
        
        try:        
            event_type = StreamEventType(event_type_str)        
        except ValueError:
            return StreamEvent(
                type=event_type_str,
                thread_id=getattr(event.data, 'thread_id', None),
                run_id=getattr(event.data, 'run_id', None),
                status=getattr(event.data, 'status', None),
                created_at=getattr(event.data, 'created_at', None),
                message_id=getattr(event.data, 'message_id', None),
                role=getattr(event.data, 'role', None),
                error=getattr(event.data, 'error', None),
            )
                
        match event_type:
            
            case StreamEventType.THREAD_CREATED:
                return StreamEvent(
                    type=event_type,
                    thread_id=event.data.id
                )
            
            case StreamEventType.RUN_CREATED:
                return StreamEvent(
                    type=event_type,
                    run_id=event.data.id,
                    thread_id=event.data.thread_id,
                    assistant_id=event.data.assistant_id,
                    status=event.data.status,
                    created_at=event.data.created_at
                )
            
            case StreamEventType.RUN_QUEUED:
                return StreamEvent(
                    type=event_type,
                    run_id=event.data.id
                )
            
            case StreamEventType.RUN_IN_PROGRESS:
                return StreamEvent(
                    type=event_type,
                    run_id=event.data.id
                )
            
            case StreamEventType.RUN_REQUIRES_ACTION:
                return StreamEvent(
                    type=event_type,
                    run_id=event.data.id,
                    status=event.data.status
                )
            
            case StreamEventType.MESSAGE_CREATED:
                return StreamEvent(
                    type=event_type,
                    message_id=event.data.id,
                    thread_id=event.data.thread_id,
                    role=event.data.role
                )
            
            case StreamEventType.MESSAGE_IN_PROGRESS:
                return StreamEvent(
                    type=event_type,
                    message_id=event.data.id
                )
            
            case StreamEventType.MESSAGE_DELTA:
                # Extract content chunks
                if hasattr(event.data, 'delta') and hasattr(event.data.delta, 'content'):
                    for idx, content_block in enumerate(event.data.delta.content):
                        if hasattr(content_block, 'text') and hasattr(content_block.text, 'value'):
                            return StreamEvent(
                                type=event_type,
                                text=content_block.text.value,
                                index=idx
                            )
                            
                return StreamEvent(
                    type=StreamEventType.UNKNOWN
                )
            
            case StreamEventType.MESSAGE_COMPLETED:
                return StreamEvent(
                    type=event_type,
                    message_id=event.data.id,
                    thread_id=event.data.thread_id
                )
            
            case StreamEventType.RUN_COMPLETED:
                return StreamEvent(
                    type=event_type,
                    run_id=event.data.id,
                    status=event.data.status
                )
            
            case StreamEventType.RUN_FAILED:
                error_message = None
                if hasattr(event.data, 'last_error') and event.data.last_error:
                    error_message = str(event.data.last_error)
                
                return StreamEvent(
                    type=event_type,
                    run_id=event.data.id,
                    status=event.data.status,
                    error=error_message
                )
            
            case StreamEventType.RUN_CANCELLED:
                return StreamEvent(
                    type=event_type,
                    run_id=event.data.id,
                    status=event.data.status
                )
            
            case StreamEventType.RUN_EXPIRED:
                return StreamEvent(
                    type=event_type,
                    run_id=event.data.id,
                    status=event.data.status
                )
            
            case _:
                return StreamEvent(
                    type=StreamEventType.UNKNOWN
                )