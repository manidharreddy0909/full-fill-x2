"""
FULFILL-X Challenge Engine Package (Phase 4)
Active learning, counterfactual simulation, boundary probing, and adaptive autonomy.
"""
from app.challenge.models import (
    ChallengeScenarioType,
    ChallengeStatus,
    ChallengeOutcomeStatus,
    BoundaryStatus,
    ChallengeScenario,
    ChallengeResult,
    CounterfactualComparison,
    GradientProbeResult,
    ChallengeMetrics,
)
from app.challenge.generator import ChallengeScenarioGenerator
from app.challenge.counterfactual import CounterfactualEngine
from app.challenge.prioritizer import ChallengePrioritizer
from app.challenge.governance import AdaptiveAutonomyEngine
from app.challenge.service import ChallengeEngineService, challenge_service

__all__ = [
    "ChallengeScenarioType",
    "ChallengeStatus",
    "ChallengeOutcomeStatus",
    "BoundaryStatus",
    "ChallengeScenario",
    "ChallengeResult",
    "CounterfactualComparison",
    "GradientProbeResult",
    "ChallengeMetrics",
    "ChallengeScenarioGenerator",
    "CounterfactualEngine",
    "ChallengePrioritizer",
    "AdaptiveAutonomyEngine",
    "ChallengeEngineService",
    "challenge_service",
]
