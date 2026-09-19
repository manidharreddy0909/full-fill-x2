"""
FULFILL-X Feature Store Repository Abstraction (Phase 6)
Provides Free-First Memory and Persistent Feature Storage with entity and time lookup.
"""
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple
from app.ml.schemas import FeatureSet


class FeatureStoreProtocol(ABC):
    """Abstract contract for Feature Store implementations."""

    @abstractmethod
    def write_features(self, organization_id: str, feature_set: FeatureSet) -> None:
        """Persist a feature set into the store."""
        pass

    @abstractmethod
    def read_features(
        self, organization_id: str, entity_id: str, timestamp: datetime
    ) -> Optional[FeatureSet]:
        """Retrieve exact feature set for an entity at a given timestamp."""
        pass

    @abstractmethod
    def get_latest_features(
        self, organization_id: str, entity_id: str
    ) -> Optional[FeatureSet]:
        """Retrieve the most recent feature set for an entity."""
        pass

    @abstractmethod
    def reset() -> None:
        """Reset state for tests."""
        pass


class MemoryFeatureStore(FeatureStoreProtocol):
    """Free-First Local In-Memory Feature Store Implementation."""

    def __init__(self):
        # Key: (organization_id, entity_id) -> List[FeatureSet] sorted by timestamp
        self._store: Dict[Tuple[str, str], List[FeatureSet]] = {}

    def write_features(self, organization_id: str, feature_set: FeatureSet) -> None:
        key = (organization_id, feature_set.entity_id)
        if key not in self._store:
            self._store[key] = []
        self._store[key].append(feature_set)
        # Keep sorted by timestamp
        self._store[key].sort(key=lambda fs: fs.timestamp)

    def read_features(
        self, organization_id: str, entity_id: str, timestamp: datetime
    ) -> Optional[FeatureSet]:
        key = (organization_id, entity_id)
        if key not in self._store:
            return None
        dt = timestamp if timestamp.tzinfo else timestamp.replace(tzinfo=timezone.utc)
        for fs in reversed(self._store[key]):
            fs_dt = fs.timestamp if fs.timestamp.tzinfo else fs.timestamp.replace(tzinfo=timezone.utc)
            if fs_dt <= dt:
                return fs
        return None

    def get_latest_features(
        self, organization_id: str, entity_id: str
    ) -> Optional[FeatureSet]:
        key = (organization_id, entity_id)
        if key not in self._store or not self._store[key]:
            return None
        return self._store[key][-1]

    def reset() -> None:
        self._store.clear()


class FeatureStoreFactory:
    """Factory singleton resolving configured FeatureStore."""

    _instance: Optional[FeatureStoreProtocol] = None

    @classmethod
    def get_store(cls) -> FeatureStoreProtocol:
        if cls._instance is None:
            cls._instance = MemoryFeatureStore()
        return cls._instance

    @classmethod
    def reset(cls) -> None:
        if cls._instance:
            cls._instance.reset()
        cls._instance = None
