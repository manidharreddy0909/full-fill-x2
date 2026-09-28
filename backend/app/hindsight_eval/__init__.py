"""
FULFILL-X Hindsight Learning Evaluation Package (Phase 5)
Active learning evaluation: Memoryless Agent vs Hindsight-Enabled Agent.
"""
from app.hindsight_eval.models import (
    AgentMode,
    EvaluationScenarioType,
    EvaluationScenario,
    CausalAttribution,
    EpisodeTrace,
    ExperimentMetrics,
    LearningCurvePoint,
    EvaluationExperimentReport,
)
from app.hindsight_eval.scenarios import ScenarioSequenceGenerator
from app.hindsight_eval.agents import MemorylessAgent, HindsightAgent
from app.hindsight_eval.runner import EvaluationExperimentRunner
from app.hindsight_eval.service import HindsightEvaluationService, hindsight_eval_service

__all__ = [
    "AgentMode",
    "EvaluationScenarioType",
    "EvaluationScenario",
    "CausalAttribution",
    "EpisodeTrace",
    "ExperimentMetrics",
    "LearningCurvePoint",
    "EvaluationExperimentReport",
    "ScenarioSequenceGenerator",
    "MemorylessAgent",
    "HindsightAgent",
    "EvaluationExperimentRunner",
    "HindsightEvaluationService",
    "hindsight_eval_service",
]
