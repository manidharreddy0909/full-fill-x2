# FULFILL-X — Diagram Index

> All Mermaid diagram source files are in the `diagrams/` directory.
> Render with any Mermaid-compatible viewer or the Mermaid CLI.

## Rendering

```bash
# Install Mermaid CLI
npm install -g @mermaid-js/mermaid-cli

# Render all diagrams to SVG
mmdc -i diagrams/system-architecture.mmd -o diagrams/out/system-architecture.svg
mmdc -i diagrams/end-to-end-flow.mmd -o diagrams/out/end-to-end-flow.svg
# ... etc
```

## Diagram Inventory

| File | Type | Description |
|------|------|-------------|
| [system-architecture.mmd](../diagrams/system-architecture.mmd) | `graph TB` | Full system topology: client, backend, data, AI, AWS |
| [end-to-end-flow.mmd](../diagrams/end-to-end-flow.mmd) | `sequenceDiagram` | Request lifecycle from signal to plan |
| [data-flow.mmd](../diagrams/data-flow.mmd) | `flowchart LR` | Data movement between all layers |
| [agent-flow.mmd](../diagrams/agent-flow.mmd) | `sequenceDiagram` | Agent orchestration and proposal flow |
| [risk-propagation.mmd](../diagrams/risk-propagation.mmd) | `graph TD` | Risk propagation through the supply network |
| [adversarial-loop.mmd](../diagrams/adversarial-loop.mmd) | `sequenceDiagram` | Adversary agent attack and feedback loop |
| [frontend-architecture.mmd](../diagrams/frontend-architecture.mmd) | `graph TD` | Frontend component hierarchy and state flow |
| [aws-architecture.mmd](../diagrams/aws-architecture.mmd) | `graph TB` | AWS service topology and networking |
| [deployment-flow.mmd](../diagrams/deployment-flow.mmd) | `graph LR` | CI/CD pipeline and deployment steps |

## Update Policy

Diagrams must be updated whenever:
- A new service is added to the architecture
- An agent's orchestration flow changes
- AWS infrastructure changes
- Frontend component hierarchy changes significantly

Record diagram updates in `tasks/CHANGELOG.md`.
