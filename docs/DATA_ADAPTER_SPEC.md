# Data Adapter Protocol & Implementation Specification

## 1. Abstract Adapter Contract (`DataSourceAdapter`)
Every data integration feed in FULFILL-X Phase 4 implements the Python abstract class `DataSourceAdapter` defined in `backend/app/adapters/base.py`.

```python
class DataSourceAdapter(ABC):
    @property
    @abstractmethod
    def source_id(self) -> str: ...

    @property
    @abstractmethod
    def config(self) -> DataSourceConfig: ...

    @abstractmethod
    async def fetch_raw(self, organization_id: str = "org-default") -> list[RawRecord]: ...

    @abstractmethod
    async def normalize(self, raw_records: list[RawRecord]) -> list[ExternalObservation]: ...

    @abstractmethod
    async def health_check(self) -> SourceHealthStatus: ...
```

---

## 2. Dynamic Registry (`AdapterRegistry`)
The singleton `AdapterRegistry` manages adapter instantiation, source lookups, and global ingestion mode (`LIVE`, `HYBRID`, `OFFLINE`).

* In `OFFLINE` mode, adapters generate deterministic Seed 42 fixtures.
* In `LIVE` mode, adapters poll HTTP endpoints directly with fallback on connection failure.
* In `HYBRID` mode, cached or live responses are synthesized deterministically.
