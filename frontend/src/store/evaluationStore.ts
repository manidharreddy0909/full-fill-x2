import { useState, useEffect } from 'react';
import { evaluationApi } from '../api/evaluation';
import {
  BenchmarkComparison,
  BenchmarkScenario,
  EvaluationReport,
  EvaluationRun,
  EvaluationStatusResponse,
} from '../types/evaluation';

export interface EvaluationStoreState {
  evaluationStatus: EvaluationStatusResponse | null;
  scenarios: BenchmarkScenario[];
  activeRun: EvaluationRun | null;
  runs: EvaluationRun[];
  report: EvaluationReport | null;
  comparison: BenchmarkComparison | null;
  loading: boolean;
  error: string | null;
}

class EvaluationStore {
  private state: EvaluationStoreState = {
    evaluationStatus: null,
    scenarios: [],
    activeRun: null,
    runs: [],
    report: null,
    comparison: null,
    loading: false,
    error: null,
  };

  private listeners: Set<() => void> = new Set();

  public getState(): EvaluationStoreState {
    return this.state;
  }

  private setState(partial: Partial<EvaluationStoreState>): void {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  public async fetchScenarios(): Promise<void> {
    this.setState({ loading: true, error: null });
    try {
      const scenarios = await evaluationApi.getScenarios();
      const status = await evaluationApi.getStatus();
      this.setState({ scenarios, evaluationStatus: status, loading: false });
    } catch (err: any) {
      this.setState({ error: err.message || 'Failed to fetch scenarios', loading: false });
    }
  }

  public async runScenario(scenarioId: string, seed?: number): Promise<EvaluationRun | null> {
    this.setState({ loading: true, error: null });
    try {
      const run = await evaluationApi.runScenario(scenarioId, seed);
      const runs = await evaluationApi.getRuns();
      this.setState({ activeRun: run, runs, loading: false });
      return run;
    } catch (err: any) {
      this.setState({ error: err.message || 'Failed to run scenario', loading: false });
      return null;
    }
  }

  public async runAll(benchmarkId: string = 'BENCHMARK-V1'): Promise<EvaluationReport | null> {
    this.setState({ loading: true, error: null });
    try {
      const report = await evaluationApi.runAll(benchmarkId);
      const runs = await evaluationApi.getRuns();
      this.setState({ report, runs, loading: false });
      return report;
    } catch (err: any) {
      this.setState({ error: err.message || 'Failed to run benchmark suite', loading: false });
      return null;
    }
  }

  public async fetchRuns(): Promise<void> {
    this.setState({ loading: true, error: null });
    try {
      const runs = await evaluationApi.getRuns();
      this.setState({ runs, loading: false });
    } catch (err: any) {
      this.setState({ error: err.message || 'Failed to fetch evaluation runs', loading: false });
    }
  }

  public async fetchReport(): Promise<void> {
    this.setState({ loading: true, error: null });
    try {
      const report = await evaluationApi.getReport();
      this.setState({ report, loading: false });
    } catch (err: any) {
      this.setState({ error: err.message || 'Failed to fetch evaluation report', loading: false });
    }
  }

  public async compareRuns(baselineRunId: string, targetRunId: string): Promise<BenchmarkComparison | null> {
    this.setState({ loading: true, error: null });
    try {
      const comparison = await evaluationApi.compareRuns(baselineRunId, targetRunId);
      this.setState({ comparison, loading: false });
      return comparison;
    } catch (err: any) {
      this.setState({ error: err.message || 'Failed to compare runs', loading: false });
      return null;
    }
  }
}

export const evaluationStore = new EvaluationStore();

export function useEvaluationStore(): EvaluationStoreState & {
  fetchScenarios: () => Promise<void>;
  runScenario: (scenarioId: string, seed?: number) => Promise<EvaluationRun | null>;
  runAll: (benchmarkId?: string) => Promise<EvaluationReport | null>;
  fetchRuns: () => Promise<void>;
  fetchReport: () => Promise<void>;
  compareRuns: (baselineRunId: string, targetRunId: string) => Promise<BenchmarkComparison | null>;
} {
  const [state, setState] = useState<EvaluationStoreState>(evaluationStore.getState());

  useEffect(() => {
    const unsubscribe = evaluationStore.subscribe(() => {
      setState(evaluationStore.getState());
    });
    return unsubscribe;
  }, []);

  return {
    ...state,
    fetchScenarios: () => evaluationStore.fetchScenarios(),
    runScenario: (scenarioId: string, seed?: number) => evaluationStore.runScenario(scenarioId, seed),
    runAll: (benchmarkId?: string) => evaluationStore.runAll(benchmarkId),
    fetchRuns: () => evaluationStore.fetchRuns(),
    fetchReport: () => evaluationStore.fetchReport(),
    compareRuns: (baselineRunId: string, targetRunId: string) =>
      evaluationStore.compareRuns(baselineRunId, targetRunId),
  };
}
