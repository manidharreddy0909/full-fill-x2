# Event Transport Specification

## 1. `EventTransport` Protocol Interface
The abstract contract `EventTransport` in `backend/app/realtime/transport.py` decouples domain logic from underlying transport mechanisms:

```python
class EventTransport(ABC):
    @property
    @abstractmethod
    def transport_type(self) -> str: ...

    @abstractmethod
    def subscribe(self, session_id: Optional[str], callback: Callable[[EventEnvelope], Awaitable[None]]) -> None: ...

    @abstractmethod
    def unsubscribe(self, session_id: Optional[str], callback: Callable[[EventEnvelope], Awaitable[None]]) -> None: ...

    @abstractmethod
    async def publish(self, envelope: EventEnvelope) -> EventEnvelope: ...

    @abstractmethod
    def get_replay_events(self, session_id: str, since_sequence: int = 0, max_count: int = 50, organization_id: Optional[str] = None) -> List[EventEnvelope]: ...

    @abstractmethod
    async def health(self) -> Dict[str, Any]: ...
```

---

## 2. Implementations
* **`InMemoryEventTransport`**: Local thread-safe async queue & bounded session replay buffers. Default in local dev mode.
* **`RedisEventTransport`**: Cross-instance Redis Streams event distribution using `fulfillx:events:stream`. Automatically falls back to in-memory mode if Redis connection fails.
