"""
Script to execute the complete Phase 12 benchmark suite and output
machine-readable artifacts:
  - artifacts/evaluation/latest_report.json
  - artifacts/evaluation/latest_report.md
"""

import asyncio
import json
import os
from pathlib import Path
from app.evaluation.runner import EvaluationRunner


async def main():
    print("Running FULFILL-X Phase 12 Benchmark Suite across all 8 scenarios...")
    runner = EvaluationRunner()
    report = await runner.run_benchmark("BENCHMARK-V1")

    output_dir = Path("artifacts/evaluation")
    output_dir.mkdir(parents=True, exist_ok=True)

    json_path = output_dir / "latest_report.json"
    md_path = output_dir / "latest_report.md"

    # Save JSON report
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(report.model_dump(), f, indent=2)

    # Save Markdown report
    summary = report.summary
    md_content = f"""# FULFILL-X Phase 12 Benchmark Report

**Benchmark ID:** `{report.benchmark_id}`  
**Timestamp:** `{report.timestamp}`  
**Scenarios Evaluated:** `{report.scenarios_evaluated}`  
**Execution Time:** `{summary.execution_time_seconds:.2f} seconds`  

---

## Executive Summary

- **Overall Score:** `{summary.overall_score * 100:.1f}%`
- **Risk Detection (F1):** `{summary.risk_detection * 100:.1f}%`
- **Risk Localization (IoU):** `{summary.risk_localization * 100:.1f}%`
- **Scenario Validity:** `{summary.scenario_validity * 100:.1f}%`
- **Agent Proposal Validity:** `{summary.agent_validity * 100:.1f}%`
- **Coordination Quality:** `{summary.coordination_quality * 100:.1f}%`
- **Adversarial Coverage:** `{summary.adversarial_coverage * 100:.1f}%`
- **Plan Feasibility:** `{summary.plan_feasibility * 100:.1f}%`
- **Plan Robustness:** `{summary.plan_robustness * 100:.1f}%`
- **Verification Accuracy:** `{summary.verification_accuracy * 100:.1f}%`
- **Transparency Completeness:** `{summary.transparency_completeness * 100:.1f}%`

---

## Scenario Execution Details

| Scenario ID | Status | Risk Detection | Feasibility | Verification |
| :--- | :--- | :--- | :--- | :--- |
"""

    for r in report.runs:
        det = r.metrics["risk_detection"].value * 100 if "risk_detection" in r.metrics else 0.0
        feas = r.metrics["plan_feasibility"].value * 100 if "plan_feasibility" in r.metrics else 0.0
        verif = r.metrics["verification_accuracy"].value * 100 if "verification_accuracy" in r.metrics else 0.0
        md_content += f"| `{r.scenario_id}` | `{r.status.value}` | `{det:.1f}%` | `{feas:.1f}%` | `{verif:.1f}%` |\n"

    md_content += """
---

## Recommendations
"""
    for rec in report.recommendations:
        md_content += f"- {rec}\n"

    with open(md_path, "w", encoding="utf-8") as f:
        f.write(md_content)

    print(f"Generated JSON report: {json_path}")
    print(f"Generated Markdown report: {md_path}")
    print(f"Overall Benchmark Score: {summary.overall_score * 100:.1f}%")


if __name__ == "__main__":
    asyncio.run(main())
