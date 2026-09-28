/**
 * Reusable Intelligence Cards & Timelines
 */
import React from 'react';
import { Brain, GitBranch, Target, Zap, Clock, Shield, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import type { Experience, ResilienceGenome, StrategyCandidate, ResilienceSkill } from '../../types/intelligence';
import { TransferabilityBadge, EvidenceBadge, ConfidenceIndicator, GovernanceGate } from './BadgesAndGates';
import { SuccessCondition, FailureBoundary, ChallengeResult } from './ConditionsAndBoundaries';

export const ExperienceMemoryCard: React.FC<{
  experience: Experience;
  onSelect?: (id: string) => void;
  selected?: boolean;
}> = ({ experience, onSelect, selected }) => {
  const isSuccess = experience.actualOutcome.status === 'SUCCESS';
  return (
    <div
      onClick={() => onSelect?.(experience.id)}
      className="exp-memory-card"
      style={{
        cursor: onSelect ? 'pointer' : 'default',
        borderColor: selected ? 'rgba(56,189,248,0.4)' : undefined,
        background: selected ? 'rgba(10,22,40,0.95)' : undefined,
        marginBottom: '10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <EvidenceBadge count={experience.evidence.telemetryPointsCount} provenance={experience.provenance} />
          <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#3d5168' }}>{experience.freshness}</span>
        </div>
        <span style={{
          fontSize: '9px',
          fontFamily: 'var(--font-mono)',
          fontWeight: 800,
          color: isSuccess ? '#34c77b' : '#e8503a',
          background: isSuccess ? 'rgba(52,199,123,0.1)' : 'rgba(232,80,58,0.1)',
          padding: '2px 6px',
          borderRadius: '3px',
          border: `1px solid ${isSuccess ? 'rgba(52,199,123,0.3)' : 'rgba(232,80,58,0.3)'}`,
        }}>
          {experience.actualOutcome.status}
        </span>
      </div>

      <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#c8daea', marginBottom: '4px' }}>
        {experience.incidentType}
      </div>
      <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#7a90aa', marginBottom: '8px', lineHeight: 1.4 }}>
        {experience.decision}
      </div>

      <ConfidenceIndicator value={experience.confidence} label="Verification Confidence" />
    </div>
  );
};

export const ExperienceTimeline: React.FC<{
  experiences: Experience[];
  onSelectExperience?: (id: string) => void;
}> = ({ experiences, onSelectExperience }) => (
  <div style={{ position: 'relative', paddingLeft: '20px' }}>
    <div style={{ position: 'absolute', top: 0, bottom: 0, left: '6px', width: '2px', background: 'rgba(255,255,255,0.08)' }} />
    {experiences.map((exp, idx) => (
      <div key={exp.id} style={{ position: 'relative', marginBottom: '16px' }}>
        <div style={{
          position: 'absolute',
          left: '-18px',
          top: '4px',
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: exp.actualOutcome.status === 'SUCCESS' ? '#34c77b' : '#e8503a',
          border: '2px solid #040810',
        }} />
        <ExperienceMemoryCard experience={exp} onSelect={onSelectExperience} />
      </div>
    ))}
  </div>
);

export const ResilienceGenomeCard: React.FC<{
  genome: ResilienceGenome;
  onSelect?: (id: string) => void;
  selected?: boolean;
}> = ({ genome, onSelect, selected }) => (
  <div
    onClick={() => onSelect?.(genome.id)}
    className="genome-card"
    style={{
      cursor: onSelect ? 'pointer' : 'default',
      borderColor: selected ? 'rgba(167,139,250,0.5)' : undefined,
      marginBottom: '12px',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
      <div>
        <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#c8daea' }}>
          {genome.strategy}
        </div>
        <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#4a5c72', marginTop: '2px' }}>
          {genome.purpose}
        </div>
      </div>
      <span style={{
        fontSize: '8px',
        fontFamily: 'var(--font-mono)',
        fontWeight: 800,
        color: genome.status === 'VALIDATED' ? '#34c77b' : '#f5a623',
        background: genome.status === 'VALIDATED' ? 'rgba(52,199,123,0.1)' : 'rgba(245,166,35,0.1)',
        padding: '2px 6px',
        borderRadius: '3px',
      }}>
        {genome.status}
      </span>
    </div>

    <div style={{ marginBottom: '8px' }}>
      <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#34c77b', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase' }}>
        Success Conditions ({genome.successConditions.length})
      </div>
      {genome.successConditions.slice(0, 2).map((sc, i) => (
        <SuccessCondition key={i} text={sc.text} verified={sc.verified} />
      ))}
    </div>

    <div style={{ marginBottom: '10px' }}>
      <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#e8503a', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase' }}>
        Failure Boundaries ({genome.failureBoundaries.length})
      </div>
      {genome.failureBoundaries.slice(0, 2).map((fb, i) => (
        <FailureBoundary key={i} text={fb.text} verified={fb.verified} />
      ))}
    </div>

    <ConfidenceIndicator value={genome.confidence} label="Genome Verification Confidence" color="#a78bfa" />
  </div>
);

export const StrategyCard: React.FC<{
  strategy: StrategyCandidate;
  selected?: boolean;
  onSelect?: (id: string) => void;
}> = ({ strategy, selected, onSelect }) => (
  <div
    onClick={() => onSelect?.(strategy.id)}
    className={`strategy-card ${selected ? 'selected' : ''}`}
    style={{
      padding: '16px',
      borderRadius: '10px',
      background: selected ? 'rgba(56,189,248,0.06)' : 'rgba(7,14,26,0.85)',
      border: `1px solid ${selected ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.08)'}`,
      cursor: onSelect ? 'pointer' : 'default',
      marginBottom: '10px',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
      <div>
        <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#c8daea' }}>
          {strategy.name}
        </div>
        <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#7a90aa', marginTop: '2px' }}>
          {strategy.description}
        </div>
      </div>
      {strategy.recommended && (
        <span style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#34c77b', background: 'rgba(52,199,123,0.15)', border: '1px solid rgba(52,199,123,0.3)', padding: '2px 6px', borderRadius: '3px' }}>
          ★ RECOMMENDED
        </span>
      )}
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', margin: '10px 0' }}>
      <div style={{ padding: '6px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', textAlign: 'center' }}>
        <div style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', color: '#4a5c72' }}>RECOVERY</div>
        <div style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#34c77b' }}>{strategy.recovery}%</div>
      </div>
      <div style={{ padding: '6px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', textAlign: 'center' }}>
        <div style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', color: '#4a5c72' }}>EST. TIME</div>
        <div style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#38bdf8' }}>{strategy.recoveryTime}</div>
      </div>
      <div style={{ padding: '6px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', textAlign: 'center' }}>
        <div style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', color: '#4a5c72' }}>EST. COST</div>
        <div style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#f5a623' }}>{strategy.costLabel}</div>
      </div>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
      <TransferabilityBadge state={strategy.transferability} />
      <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#4a5c72' }}>
        {strategy.evidence} experiences · {(strategy.confidence * 100).toFixed(0)}% conf
      </span>
    </div>
  </div>
);

export const SkillEvolutionCard: React.FC<{
  skill: ResilienceSkill;
  onSelect?: (id: string) => void;
}> = ({ skill, onSelect }) => (
  <div
    onClick={() => onSelect?.(skill.id)}
    style={{
      padding: '14px',
      borderRadius: '8px',
      background: 'rgba(7,14,26,0.85)',
      border: '1px solid rgba(255,255,255,0.08)',
      marginBottom: '10px',
      cursor: onSelect ? 'pointer' : 'default',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Zap size={12} color="#38bdf8" />
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#c8daea' }}>
          {skill.purpose}
        </span>
      </div>
      <span style={{
        fontSize: '8px',
        fontFamily: 'var(--font-mono)',
        fontWeight: 700,
        color: skill.lifecycleStatus === 'ACTIVE' ? '#34c77b' : '#38bdf8',
        background: skill.lifecycleStatus === 'ACTIVE' ? 'rgba(52,199,123,0.1)' : 'rgba(56,189,248,0.1)',
        padding: '2px 5px',
        borderRadius: '3px',
      }}>
        {skill.lifecycleStatus}
      </span>
    </div>

    <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#7a90aa', marginBottom: '8px' }}>
      {skill.steps.length} sequential steps · {skill.executionCount} executions · {(skill.successRate * 100).toFixed(0)}% success
    </div>

    <ConfidenceIndicator value={skill.confidence} label="Skill Reliability" />
  </div>
);
