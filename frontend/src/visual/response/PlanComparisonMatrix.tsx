/**
 * PlanComparisonMatrix — Multi-Objective Plan Trade-Off Comparison
 * Phase 13C: Response & Decision Visualization
 *
 * Side-by-side trade-off matrix: Cost, Risk, Delay, Resilience, Sustainability.
 * Strictly uses real backend CandidatePlan returns.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, CheckCircle2, XCircle, DollarSign, Clock, ShieldCheck, Leaf } from 'lucide-react';
import { StatusPill } from '../telemetry/StatusPill';

export interface CandidatePlanData {
  candidate_id: string;
  name: string;
  description: string;
  estimated_total_cost: number;
  estimated_max_delay_hours: number;
  estimated_total_emissions_co2_kg?: number;
  status: string;
}

export interface PlanComparisonMatrixProps {
  plans: CandidatePlanData[];
  onApprovePlan: (planId: string) => void;
  onRejectPlan: (planId: string) => void;
  isPending: boolean;
}

export const PlanComparisonMatrix: React.FC<PlanComparisonMatrixProps> = ({
  plans,
  onApprovePlan,
  onRejectPlan,
  isPending,
}) => {
  return (
    <div className="p-5 rounded-xl bg-[#090d16]/90 border border-cyan-500/20 backdrop-blur-xl shadow-2xl flex flex-col gap-4 font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-cyan-300 uppercase tracking-wider">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <span>Multi-Objective Candidate Plan Comparison Matrix</span>
        </div>
        <StatusPill color="#38bdf8" label={`${plans.length} PLANS EVALUATED`} />
      </div>

      {/* Side-by-side Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan, idx) => (
          <motion.div
            key={plan.candidate_id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.08 }}
            className="p-4 rounded-xl bg-[#030712]/90 border border-slate-800 flex flex-col justify-between gap-3 hover:border-cyan-500/30 transition-all"
          >
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="font-bold text-cyan-400">{plan.candidate_id}</span>
                <StatusPill
                  color={plan.status === 'APPROVED' ? '#34d399' : plan.status === 'REJECTED' ? '#f87171' : '#fbbf24'}
                  label={plan.status}
                />
              </div>

              <h3 className="text-sm font-bold text-white font-sans">{plan.name}</h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed line-clamp-2">{plan.description}</p>
            </div>

            {/* Metrics Trade-Off Bars */}
            <div className="space-y-2 font-mono text-xs pt-2 border-t border-slate-900">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Cost:
                </span>
                <strong className="text-emerald-400">${plan.estimated_total_cost?.toLocaleString()}</strong>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> Max Delay:
                </span>
                <strong className="text-amber-400">+{plan.estimated_max_delay_hours}h</strong>
              </div>

              {plan.estimated_total_emissions_co2_kg !== undefined && (
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Leaf className="w-3.5 h-3.5 text-cyan-400" /> CO2 Emissions:
                  </span>
                  <strong className="text-cyan-300">{plan.estimated_total_emissions_co2_kg} kg</strong>
                </div>
              )}
            </div>

            {/* Approve / Reject Actions */}
            {plan.status !== 'APPROVED' && plan.status !== 'REJECTED' && (
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => onApprovePlan(plan.candidate_id)}
                  disabled={isPending}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[11px] font-mono font-bold transition-all shadow-md shadow-emerald-900/30"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>APPROVE</span>
                </button>
                <button
                  onClick={() => onRejectPlan(plan.candidate_id)}
                  disabled={isPending}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white text-[11px] font-mono font-bold transition-all shadow-md shadow-red-900/30"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>REJECT</span>
                </button>
              </div>
            )}
          </motion.div>
        ))}

        {plans.length === 0 && (
          <div className="col-span-full text-center text-slate-500 font-mono text-xs py-10">
            No candidate plans generated. Run coordinator reconciliation or advance pipeline to generate plans.
          </div>
        )}
      </div>
    </div>
  );
};
