/**
 * FULFILL-X Verification Board UI Component (Phase 09)
 * Glassmorphic verification cockpit displaying:
 * - Verification Status Hero Badge (VERIFIED, CONDITIONAL, REJECTED)
 * - Executive summary KPI metrics (Total Checks, Passed, Warnings, Failed, Score)
 * - Before vs After State Comparison Matrix (StateDiff table with delta badges)
 * - Validation Checks Tabs (Action, Capacity, Route, Inventory, Dependency, Risk, Constraints)
 * - Verification Findings & Remediation Accordion
 */

import React, { useState } from 'react';
import {
  VerificationReport,
  VerificationStatus,
  ValidationSeverity,
} from '../../types/verification';

interface VerificationBoardProps {
  report: VerificationReport | null;
  onRunVerification: () => void;
  isLoading: boolean;
}

export const VerificationBoard: React.FC<VerificationBoardProps> = ({
  report,
  onRunVerification,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<
    'all' | 'capacity' | 'routes' | 'inventory' | 'dependencies' | 'risk' | 'constraints' | 'findings'
  >('all');

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium tracking-wide animate-pulse">
          Executing Isolated Sandbox Execution Simulation & Multi-Layer Plan Verification...
        </p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-xl p-8 space-y-4">
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-100">Verification Simulation Ready</h3>
          <p className="text-sm text-slate-400 max-w-md">
            Test candidate plans inside an isolated in-memory sandbox. Verify capacity bounds, route connectivity,
            inventory levels, risk shifts, and hard constraints before human approval.
          </p>
        </div>
        <button
          onClick={onRunVerification}
          className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium rounded-lg text-sm transition shadow-lg shadow-emerald-950/40"
        >
          Run Verification Simulation
        </button>
      </div>
    );
  }

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <div className="flex items-center space-x-2 px-4 py-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-full font-bold text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>VERIFIED — PASSES ALL CHECKS</span>
          </div>
        );
      case 'CONDITIONAL':
        return (
          <div className="flex items-center space-x-2 px-4 py-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-full font-bold text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span>CONDITIONAL — EXECUTABLE WITH WARNINGS</span>
          </div>
        );
      case 'REJECTED':
        return (
          <div className="flex items-center space-x-2 px-4 py-1.5 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-full font-bold text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
            <span>REJECTED — HARD CONSTRAINT/VALIDATION FAILURES</span>
          </div>
        );
    }
  };

  const getSeverityBadge = (severity: ValidationSeverity) => {
    switch (severity) {
      case 'INFO':
        return <span className="px-2 py-0.5 text-xs bg-slate-800 text-slate-300 rounded font-medium">INFO</span>;
      case 'WARNING':
        return <span className="px-2 py-0.5 text-xs bg-amber-950/60 border border-amber-800/50 text-amber-300 rounded font-medium">WARNING</span>;
      case 'ERROR':
        return <span className="px-2 py-0.5 text-xs bg-rose-950/60 border border-rose-800/50 text-rose-300 rounded font-medium">ERROR</span>;
      case 'CRITICAL':
        return <span className="px-2 py-0.5 text-xs bg-rose-600 text-white rounded font-bold animate-pulse">CRITICAL</span>;
    }
  };

  const diff = report.simulation_result.state_diff;

  return (
    <div className="space-y-6">
      {/* Hero Banner Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 backdrop-blur-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-mono px-2.5 py-1 bg-emerald-950/80 border border-emerald-800/50 text-emerald-400 rounded">
                SANDBOX ISOLATED
              </span>
              <h2 className="text-xl font-bold text-slate-100">{report.candidate_name}</h2>
            </div>
            <p className="text-sm text-slate-400">{report.summary_headline}</p>
          </div>
          {getStatusBadge(report.status)}
        </div>

        {/* Narrative Box */}
        <div className="p-4 bg-slate-950/50 border border-slate-800/80 rounded-lg text-xs font-mono text-slate-300 leading-relaxed">
          {report.narrative_explanation}
        </div>

        {/* Executive Summary Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div className="p-3 bg-slate-950/60 border border-slate-800/60 rounded-lg">
            <div className="text-xs text-slate-400">Total Checks</div>
            <div className="text-lg font-bold text-slate-100">{report.total_checks_count}</div>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800/60 rounded-lg">
            <div className="text-xs text-emerald-400">Passed</div>
            <div className="text-lg font-bold text-emerald-400">{report.passed_checks_count}</div>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800/60 rounded-lg">
            <div className="text-xs text-amber-400">Warnings</div>
            <div className="text-lg font-bold text-amber-400">{report.warning_checks_count}</div>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800/60 rounded-lg">
            <div className="text-xs text-rose-400">Failed</div>
            <div className="text-lg font-bold text-rose-400">{report.failed_checks_count}</div>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800/60 rounded-lg">
            <div className="text-xs text-teal-400">Verification Score</div>
            <div className="text-lg font-bold text-teal-300">{report.overall_score} / 100</div>
          </div>
        </div>
      </div>

      {/* Before vs After State Comparison Matrix */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 backdrop-blur-md space-y-4">
        <h3 className="text-base font-semibold text-slate-100 flex items-center space-x-2">
          <span>Before vs After Sandbox Simulation Matrix</span>
          <span className="text-xs font-normal text-slate-400">(State Diff)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-mono">
              <tr>
                <th className="p-3">Metric</th>
                <th className="p-3">Before (Baseline)</th>
                <th className="p-3">After (Simulated)</th>
                <th className="p-3">Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
              <tr>
                <td className="p-3 font-medium text-slate-200">Service Delivery Level</td>
                <td className="p-3">{diff.service_level_before.toFixed(1)}%</td>
                <td className="p-3 text-emerald-400 font-semibold">{diff.service_level_after.toFixed(1)}%</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 rounded">
                    +{diff.service_level_delta.toFixed(1)}%
                  </span>
                </td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-slate-200">Estimated Total Cost</td>
                <td className="p-3">${(diff.total_cost_before / 1000).toFixed(0)}k</td>
                <td className="p-3 text-amber-300">${(diff.total_cost_after / 1000).toFixed(0)}k</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 bg-amber-950/60 text-amber-300 border border-amber-800/40 rounded">
                    +${(diff.total_cost_delta / 1000).toFixed(1)}k
                  </span>
                </td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-slate-200">Max Transit Delay</td>
                <td className="p-3">{diff.delay_hours_before.toFixed(1)}h</td>
                <td className="p-3 text-emerald-400">{diff.delay_hours_after.toFixed(1)}h</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 rounded">
                    {diff.delay_hours_delta.toFixed(1)}h
                  </span>
                </td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-slate-200">Carbon Emissions CO2</td>
                <td className="p-3">{diff.emissions_co2_before.toFixed(0)} kg</td>
                <td className="p-3 text-amber-300">{diff.emissions_co2_after.toFixed(0)} kg</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 bg-amber-950/60 text-amber-300 border border-amber-800/40 rounded">
                    +{diff.emissions_co2_delta_percent.toFixed(1)}%
                  </span>
                </td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-slate-200">Aggregate Mean Risk</td>
                <td className="p-3">{diff.aggregate_risk_before.toFixed(2)}</td>
                <td className="p-3 text-emerald-400">{diff.aggregate_risk_after.toFixed(2)}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 rounded">
                    {diff.aggregate_risk_delta.toFixed(2)}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-slate-200">Critical Risk Nodes</td>
                <td className="p-3">{diff.critical_risk_nodes_before}</td>
                <td className="p-3 text-teal-300">{diff.critical_risk_nodes_after}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 bg-teal-950/60 text-teal-300 border border-teal-800/40 rounded">
                    {diff.critical_risk_nodes_delta > 0 ? `+${diff.critical_risk_nodes_delta}` : diff.critical_risk_nodes_delta}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Validation Tabs & Content */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 backdrop-blur-md space-y-4">
        <div className="flex border-b border-slate-800 space-x-4 overflow-x-auto text-sm font-medium">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-2 transition ${
              activeTab === 'all'
                ? 'border-b-2 border-emerald-500 text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Checks ({report.validation_checks.length})
          </button>
          <button
            onClick={() => setActiveTab('capacity')}
            className={`pb-2 transition ${
              activeTab === 'capacity'
                ? 'border-b-2 border-emerald-500 text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Capacity ({report.capacity_checks.length})
          </button>
          <button
            onClick={() => setActiveTab('routes')}
            className={`pb-2 transition ${
              activeTab === 'routes'
                ? 'border-b-2 border-emerald-500 text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Routes ({report.route_checks.length})
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-2 transition ${
              activeTab === 'inventory'
                ? 'border-b-2 border-emerald-500 text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Inventory ({report.inventory_checks.length})
          </button>
          <button
            onClick={() => setActiveTab('dependencies')}
            className={`pb-2 transition ${
              activeTab === 'dependencies'
                ? 'border-b-2 border-emerald-500 text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dependencies ({report.dependency_checks.length})
          </button>
          <button
            onClick={() => setActiveTab('risk')}
            className={`pb-2 transition ${
              activeTab === 'risk'
                ? 'border-b-2 border-emerald-500 text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Risk Re-evaluation ({report.risk_checks.length})
          </button>
          <button
            onClick={() => setActiveTab('constraints')}
            className={`pb-2 transition ${
              activeTab === 'constraints'
                ? 'border-b-2 border-emerald-500 text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Constraints ({report.constraint_checks.length})
          </button>
          <button
            onClick={() => setActiveTab('findings')}
            className={`pb-2 transition ${
              activeTab === 'findings'
                ? 'border-b-2 border-emerald-500 text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Findings ({report.findings.length})
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="space-y-3 pt-2">
          {activeTab === 'all' &&
            report.validation_checks.map((c) => (
              <div
                key={c.check_id}
                className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-emerald-400">{c.category}</span>
                    <span className="text-sm font-semibold text-slate-200">{c.name}</span>
                  </div>
                  <p className="text-xs text-slate-400">{c.message}</p>
                  <p className="text-xs font-mono text-slate-500">Evidence: {c.evidence}</p>
                </div>
                <div>{getSeverityBadge(c.severity)}</div>
              </div>
            ))}

          {activeTab === 'capacity' &&
            report.capacity_checks.map((c, i) => (
              <div key={i} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium text-slate-200">{c.entity_name} ({c.capacity_type})</div>
                  <div>{getSeverityBadge(c.status)}</div>
                </div>
                <div className="flex justify-between text-xs text-slate-400 font-mono">
                  <span>Requested Load: {c.requested_load.toFixed(1)}</span>
                  <span>Max Capacity: {c.available_capacity.toFixed(1)}</span>
                  <span>Utilization: {c.capacity_utilization_percent.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full ${
                      c.is_exceeded ? 'bg-rose-500' : c.capacity_utilization_percent > 90 ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.min(100, c.capacity_utilization_percent)}%` }}
                  ></div>
                </div>
              </div>
            ))}

          {activeTab === 'routes' &&
            report.route_checks.map((c, i) => (
              <div key={i} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg flex justify-between items-center">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-slate-200">Route {c.route_id} ({c.transport_mode})</div>
                  <p className="text-xs text-slate-400">{c.message}</p>
                </div>
                <div>{getSeverityBadge(c.status)}</div>
              </div>
            ))}

          {activeTab === 'inventory' &&
            report.inventory_checks.map((c, i) => (
              <div key={i} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg space-y-1">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium text-slate-200">{c.facility_name}</div>
                  <div>{getSeverityBadge(c.status)}</div>
                </div>
                <p className="text-xs text-slate-400">{c.message}</p>
                <div className="text-xs font-mono text-slate-500">
                  Current: {c.current_stock.toFixed(1)} | Projected: {c.projected_stock_after.toFixed(1)} | Safety Threshold: {c.safety_stock_threshold.toFixed(1)}
                </div>
              </div>
            ))}

          {activeTab === 'dependencies' &&
            report.dependency_checks.map((c, i) => (
              <div key={i} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg flex justify-between items-center">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-slate-200">{c.node_name}</div>
                  <p className="text-xs text-slate-400">{c.message}</p>
                </div>
                <div>{getSeverityBadge(c.status)}</div>
              </div>
            ))}

          {activeTab === 'risk' &&
            report.risk_checks.map((c, i) => (
              <div key={i} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg flex justify-between items-center font-mono text-xs">
                <div className="space-y-1">
                  <div className="text-sm font-sans font-medium text-slate-200">{c.node_name}</div>
                  <div className="text-slate-400">{c.message}</div>
                </div>
                <div className="text-right space-y-1">
                  <div>{getSeverityBadge(c.status)}</div>
                  <div className="text-slate-400">{c.risk_score_before.toFixed(2)} → {c.risk_score_after.toFixed(2)}</div>
                </div>
              </div>
            ))}

          {activeTab === 'constraints' &&
            report.constraint_checks.map((c, i) => (
              <div key={i} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg flex justify-between items-center">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-amber-400">[{c.constraint_type}]</span>
                    <span className="text-sm font-semibold text-slate-200">{c.name}</span>
                  </div>
                  <p className="text-xs text-slate-400">{c.message}</p>
                </div>
                <div>{getSeverityBadge(c.status)}</div>
              </div>
            ))}

          {activeTab === 'findings' &&
            (report.findings.length > 0 ? (
              report.findings.map((f) => (
                <div key={f.finding_id} className="p-4 bg-slate-950/80 border border-amber-900/40 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-bold text-slate-200">{f.title}</div>
                    <div>{getSeverityBadge(f.severity)}</div>
                  </div>
                  <p className="text-xs text-slate-300">{f.description}</p>
                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded text-xs font-mono text-amber-300">
                    Remediation Advice: {f.remediation_advice}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs font-mono">
                No critical findings or violations detected. Plan passed all verification checks.
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
