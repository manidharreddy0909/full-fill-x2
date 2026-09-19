"""
FULFILL-X Demo Report Generator (Phase 16)
Generates structured JSON and human-readable Markdown competition reports upon demo completion.
"""
import os
import json
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any

from app.schemas.demo import DemoSession, DemoReport

logger = logging.getLogger("fulfillx.demo_report")


class DemoReportGenerator:
    """
    Generates and saves competition demo session reports.
    """

    @staticmethod
    def generate_report(session: DemoSession, output_dir: str = "artifacts/demo") -> DemoReport:
        """
        Builds DemoReport object and writes demo_report.json and demo_report.md to disk.
        """
        total_duration_ms = sum(step.duration_ms for step in session.timeline)
        workflow_completed = session.status in ["COMPLETED", "APPROVED"]

        approval_decision: Optional[Dict[str, Any]] = None
        candidate_plan_selected: Optional[str] = None

        if session.executive_summary and session.executive_summary.approval_record:
            rec = session.executive_summary.approval_record
            approval_decision = {
                "decision": rec.decision,
                "approver_name": rec.approver_name,
                "selected_plan_id": rec.selected_plan_id,
                "decision_rationale": rec.decision_rationale,
                "timestamp": rec.timestamp.isoformat() if hasattr(rec.timestamp, "isoformat") else str(rec.timestamp),
            }
            candidate_plan_selected = rec.selected_plan_id

        report = DemoReport(
            session_id=session.session_id,
            scenario_id=session.scenario_id,
            seed=session.seed,
            mode=session.mode,
            status=session.status,
            total_duration_ms=total_duration_ms,
            workflow_completed=workflow_completed,
            candidate_plan_selected=candidate_plan_selected,
            approval_decision=approval_decision,
            final_executive_summary=session.executive_summary,
            evaluation_summary=session.evaluation_summary,
            timeline_steps=session.timeline,
            generated_at=datetime.now(timezone.utc),
        )

        # Ensure directory exists
        os.makedirs(output_dir, exist_ok=True)

        # Write JSON artifact
        json_path = os.path.join(output_dir, "demo_report.json")
        try:
            with open(json_path, "w", encoding="utf-8") as f:
                f.write(report.model_dump_json(indent=2))
            logger.info(f"Demo report JSON saved to {json_path}")
        except Exception as e:
            logger.error(f"Failed to save demo report JSON: {e}")

        # Write Markdown artifact
        md_path = os.path.join(output_dir, "demo_report.md")
        try:
            md_content = DemoReportGenerator._build_markdown(report)
            with open(md_path, "w", encoding="utf-8") as f:
                f.write(md_content)
            logger.info(f"Demo report Markdown saved to {md_path}")
        except Exception as e:
            logger.error(f"Failed to save demo report Markdown: {e}")

        return report

    @staticmethod
    def _build_markdown(report: DemoReport) -> str:
        """Construct clean Markdown presentation report for judges."""
        exec_sum = report.final_executive_summary
        eval_sum = report.evaluation_summary

        lines = [
            f"# FULFILL-X Competition Demo Report — {report.scenario_id.value}",
            f"**Session ID:** `{report.session_id}` | **Mode:** `{report.mode.value}` | **Seed:** `{report.seed}` | **Status:** `{report.status.value}`",
            f"**Generated At:** {report.generated_at.strftime('%Y-%m-%d %H:%M:%S UTC')} | **Total Execution Time:** {report.total_duration_ms:.2f} ms",
            "",
            "---",
            "",
            "## 1. Executive Summary",
        ]

        if exec_sum:
            lines.extend([
                f"- **Network Health Score:** `{exec_sum.network_health_score:.1f} / 100.0`",
                f"- **Composite Risk Score:** `{exec_sum.composite_risk_score:.2f}`",
                f"- **Recommended Candidate Plan:** `{exec_sum.recommended_candidate_id}`",
                f"- **Total Candidate Plans Evaluated:** `{len(exec_sum.candidate_plans)}`",
                f"- **Human Approval Status:** `{exec_sum.human_approval_status}`",
            ])
        else:
            lines.append("Executive summary not available.")

        lines.extend([
            "",
            "## 2. Benchmark & Quantitative Evaluation",
        ])

        if eval_sum:
            lines.extend([
                f"- **Resilience Score:** `{eval_sum.resilience_score:.2f} / 100.0`",
                f"- **SLR (Service Level Realization):** `{eval_sum.service_level_realization * 100:.1f}%`",
                f"- **Cost Variance:** `+${eval_sum.cost_variance_usd:,.2f}`",
                f"- **SLA Preservation Rate:** `{eval_sum.sla_preservation_rate * 100:.1f}%`",
                f"- **Adversarial Survival Index:** `{eval_sum.adversarial_survival_index * 100:.1f}%`",
                f"- **Deterministic Verification:** `{'PASS' if eval_sum.deterministic_verification_passed else 'FAIL'}`",
            ])
        else:
            lines.append("Evaluation metrics not computed for this run.")

        lines.extend([
            "",
            "## 3. Human Executive Decision Gate",
        ])

        if report.approval_decision:
            ad = report.approval_decision
            lines.extend([
                f"- **Decision:** `{ad.get('decision')}`",
                f"- **Approver:** `{ad.get('approver_name')}`",
                f"- **Selected Plan:** `{ad.get('selected_plan_id')}`",
                f"- **Rationale:** *\"{ad.get('decision_rationale')}\"*",
            ])
        else:
            lines.append("No human decision recorded.")

        lines.extend([
            "",
            "## 4. End-to-End Intelligence Timeline",
            "",
            "| Step | Stage | Title | Status | Duration (ms) | Summary |",
            "| --- | --- | --- | --- | --- | --- |",
        ])

        for step in report.timeline_steps:
            lines.append(
                f"| {step.step_index} | `{step.stage.value}` | {step.title} | `{step.status}` | {step.duration_ms:.1f} | {step.summary} |"
            )

        lines.extend([
            "",
            "---",
            "*Report generated automatically by FULFILL-X Phase 16 Competition Demo Engine.*",
        ])

        return "\n".join(lines)
