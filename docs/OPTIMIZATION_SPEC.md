# FULFILL-X — OPTIMIZATION ENGINE & ALGORITHMIC SPECIFICATION

**Version:** 1.0.0 (Phase 08)  
**Status:** IMPLEMENTED  
**Scope:** Mathematical Foundations, Pareto Dominance, Metric Normalization, and Sensitivity Algorithms

---

## 1. Mathematical Formulation

The multi-objective optimization problem for FULFILL-X is formulated as:

$$\max_{p \in \mathcal{P}} \mathbf{U}(p) = \left( u_1(p), u_2(p), \dots, u_m(p) \right)$$

subject to:
$$g_k(p) \le 0, \quad k = 1, \dots, K \quad (\text{Hard Constraints})$$
$$h_l(p) \le 0, \quad l = 1, \dots, L \quad (\text{Soft Constraints})$$

where:
- $\mathcal{P} = \{\text{Plan A}, \text{Plan B}, \text{Plan C}\}$ is the set of candidate plans synthesized by the Coordinator.
- $u_i(p) \in [0.0, 1.0]$ is the normalized utility of plan $p$ for objective $i$.
- $m = 14$ total objectives (6 specialist operational objectives + 8 adversary stress resilience objectives).

---

## 2. Objective Normalization Algorithm

Raw metric values $x_i$ vary significantly in scale (e.g. costs in USD vs service levels in percentage). The `ObjectiveNormalizer` maps each metric $x_i$ to a normalized score $u_i \in [0.0, 1.0]$:

### Maximization Objectives (e.g., Service Level, Resilience)
$$u_i = \text{clamp}\left( \frac{x_i - x_{\min}}{x_{\max} - x_{\min}}, 0.0, 1.0 \right)$$

### Minimization Objectives (e.g., Cost Impact, Emissions, Supplier Risk)
$$u_i = \text{clamp}\left( 1.0 - \frac{x_i - x_{\min}}{x_{\max} - x_{\min}}, 0.0, 1.0 \right)$$

If $x_{\max} = x_{\min}$, $u_i = 1.0$.

---

## 3. Pareto Dominance Classification Algorithm

For any pair of plans $p_1, p_2 \in \mathcal{P}$:

1. **Strict Dominance Check**:
   $$\text{dominates}(p_1, p_2) \iff (\forall i, u_i(p_1) \ge u_i(p_2)) \land (\exists j, u_j(p_1) > u_j(p_2))$$

2. **Status Assignment**:
   - If $\exists p' \in \mathcal{P}$ such that $\text{dominates}(p', p)$, then $p$ is **DOMINATED**.
   - If $\forall p' \in \mathcal{P} \setminus \{p\}$, $\neg \text{dominates}(p', p)$, then $p$ is **PARETO_OPTIMAL** (Non-Dominated).
   - If $\forall p' \in \mathcal{P} \setminus \{p\}$, $u_i(p) = u_i(p')$ for all $i$, then $p$ is **EQUIVALENT**.

3. **Frontier Construction**:
   $$\text{Frontier} = \{ p \in \mathcal{P} \mid \text{status}(p) = \text{PARETO\_OPTIMAL} \}$$

---

## 4. Constraint Verification Algorithm

Each candidate plan is evaluated against the set of hard and soft constraints:

$$\text{Status}(p) = \begin{cases} 
\text{INFEASIBLE} & \text{if any hard constraint is violated} \\
\text{CONDITIONAL} & \text{if all hard constraints pass but } \ge 1 \text{ soft constraint fails} \\
\text{FEASIBLE} & \text{if all hard and soft constraints pass}
\end{cases}$$

---

## 5. Sensitivity Sweep Algorithm

For each candidate plan $p \in \mathcal{P}$ and sweep variable $v \in \{\text{cost\_scale}, \text{disruption\_scale}, \text{demand\_scale}\}$:

1. Vary factor $\alpha \in \{0.5, 0.75, 1.0, 1.25, 1.50\}$.
2. Calculate perturbed objective vector $\mathbf{U}(p, \alpha)$.
3. Compute objective volatility $\sigma(p, v) = \text{std\_dev}\left(\mathbf{U}(p, \alpha)\right)$.
4. Rank plans by stability metric $S(p) = 1.0 - \text{mean volatility}$.
