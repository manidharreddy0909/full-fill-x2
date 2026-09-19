"""
FULFILL-X Local Model Registry (Phase 6)
Manages model lifecycle states, checksum validation, activation, and rollback.
"""
import os
import hashlib
import joblib
import logging
from typing import Dict, List, Optional, Tuple, Any
from app.ml.schemas import MLTaskType, ModelLifecycleStatus, ModelMetadata

logger = logging.getLogger("fulfillx.ml.registry")


class LocalModelRegistry:
    """
    Registry for managing model artifacts, lifecycle, checksum verification, and rollback.
    """

    _instance: Optional["LocalModelRegistry"] = None

    def __init__(self):
        # model_id -> ModelMetadata
        self._models: Dict[str, ModelMetadata] = {}
        # (organization_id, task_type) -> active_model_id
        self._active_models: Dict[Tuple[str, str], str] = {}
        # (organization_id, task_type) -> previous_active_model_id
        self._previous_active_models: Dict[Tuple[str, str], str] = {}
        # Cache for loaded model objects: model_id -> instance
        self._loaded_instances: Dict[str, Any] = {}

    @classmethod
    def get_instance(cls) -> "LocalModelRegistry":
        if cls._instance is None:
            cls._instance = LocalModelRegistry()
        return cls._instance

    def register_model(self, metadata: ModelMetadata, instance: Optional[Any] = None) -> None:
        """Register a newly trained model."""
        self._models[metadata.model_id] = metadata
        if instance is not None:
            self._loaded_instances[metadata.model_id] = instance
        logger.info(f"Registered model '{metadata.model_id}' ({metadata.task_type.value}) status: {metadata.status.value}")

    def get_metadata(self, model_id: str) -> Optional[ModelMetadata]:
        return self._models.get(model_id)

    def list_models(
        self, organization_id: str = "org-fulfillx-default", task_type: Optional[MLTaskType] = None
    ) -> List[ModelMetadata]:
        results = [
            m for m in self._models.values()
            if m.organization_id == organization_id or m.organization_id == "org-fulfillx-default"
        ]
        if task_type:
            results = [m for m in results if m.task_type == task_type]
        return results

    def get_active_model(
        self, organization_id: str, task_type: MLTaskType
    ) -> Optional[Tuple[ModelMetadata, Any]]:
        """Retrieve active model metadata and loaded instance."""
        key = (organization_id, task_type.value)
        active_id = self._active_models.get(key)
        if not active_id:
            # Fallback to any active model in task_type
            for m in self._models.values():
                if m.task_type == task_type and m.status == ModelLifecycleStatus.ACTIVE:
                    active_id = m.model_id
                    break
        if not active_id:
            return None

        meta = self._models.get(active_id)
        if not meta:
            return None

        instance = self._load_instance(meta)
        return meta, instance

    def activate_model(self, organization_id: str, model_id: str) -> bool:
        """Promote a validated model to ACTIVE state."""
        meta = self._models.get(model_id)
        if not meta:
            logger.warning(f"Cannot activate non-existent model '{model_id}'")
            return False

        key = (organization_id, meta.task_type.value)
        current_active = self._active_models.get(key)
        if current_active:
            self._previous_active_models[key] = current_active
            curr_meta = self._models.get(current_active)
            if curr_meta:
                curr_meta.status = ModelLifecycleStatus.RETIRED

        meta.status = ModelLifecycleStatus.ACTIVE
        self._active_models[key] = model_id
        logger.info(f"Model '{model_id}' activated for task '{meta.task_type.value}'")
        return True

    def rollback_model(self, organization_id: str, task_type: MLTaskType) -> bool:
        """Rollback active model to previous validated model."""
        key = (organization_id, task_type.value)
        prev_id = self._previous_active_models.get(key)
        if not prev_id or prev_id not in self._models:
            logger.warning(f"No previous active model available for rollback in task '{task_type.value}'")
            return False

        current_id = self._active_models.get(key)
        if current_id and current_id in self._models:
            self._models[current_id].status = ModelLifecycleStatus.REJECTED

        prev_meta = self._models[prev_id]
        prev_meta.status = ModelLifecycleStatus.ACTIVE
        self._active_models[key] = prev_id
        logger.info(f"Rolled back task '{task_type.value}' active model to '{prev_id}'")
        return True

    def _load_instance(self, meta: ModelMetadata) -> Any:
        if meta.model_id in self._loaded_instances:
            return self._loaded_instances[meta.model_id]

        # Verify checksum before loading artifact
        if os.path.exists(meta.artifact_location):
            hasher = hashlib.sha256()
            with open(meta.artifact_location, "rb") as f:
                hasher.update(f.read())
            if hasher.hexdigest() != meta.checksum:
                logger.error(f"Checksum mismatch for model '{meta.model_id}'! Aborting load.")
                return None
            instance = joblib.load(meta.artifact_location)
            self._loaded_instances[meta.model_id] = instance
            return instance
        return None

    def reset(self) -> None:
        self._models.clear()
        self._active_models.clear()
        self._previous_active_models.clear()
        self._loaded_instances.clear()
