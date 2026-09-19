"""
FULFILL-X Feedback Engine (Phase 9)
Evaluates prediction and agent decision accuracy against captured outcome records.
Produces FeedbackRecord (CORRECT, PARTIALLY_CORRECT, INCORRECT, UNOBSERVABLE).
"""
from typing import Dict, List, Optional
from uuid import uuid4

from app.agents.resilience.schemas import FeedbackRecord, FeedbackType, OutcomeRecord


class FeedbackEngine:
    """
    Engine for generating feedback records from outcome records.
    """

    def __init__(self):
        self._feedback_records: Dict[str, FeedbackRecord] = {}

    def generate_feedback(self, outcome: OutcomeRecord) -> FeedbackRecord:
        """
        Generate feedback record based on service level and cost deviations.
        """
        abs_svc_err = abs(outcome.service_deviation)
        
        if abs_svc_err <= 0.05:
            fb_type = FeedbackType.CORRECT
            score = 0.95
            comment = f"Excellent prediction alignment: service level error {abs_svc_err*100:.1f}%"
        elif abs_svc_err <= 0.15:
            fb_type = FeedbackType.PARTIALLY_CORRECT
            score = 0.75
            comment = f"Acceptable alignment: service level error {abs_svc_err*100:.1f}%"
        else:
            fb_type = FeedbackType.INCORRECT
            score = 0.40
            comment = f"Significant deviation: service level error {abs_svc_err*100:.1f}%"

        rec = FeedbackRecord(
            feedback_id=f"fbk-{uuid4().hex[:8]}",
            outcome_id=outcome.outcome_id,
            organization_id=outcome.organization_id,
            feedback_type=fb_type,
            accuracy_score=score,
            comments=comment,
        )
        self._feedback_records[rec.feedback_id] = rec
        return rec

    def list_feedback(self, organization_id: str = "org-fulfillx-default") -> List[FeedbackRecord]:
        return [f for f in self._feedback_records.values() if f.organization_id == organization_id]
