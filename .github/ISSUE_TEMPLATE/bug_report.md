name: Bug Report
description: Create a report to help us fix a bug in FULFILL-X
title: '[BUG]: '
labels: ['bug']
assignees: ''

body:
  - type: textarea
    id: description
    attributes:
      label: Bug Description
      description: A clear description of what the bug is.
    validations:
      required: true
  - type: textarea
    id: reproduction
    attributes:
      label: Steps to Reproduce
      description: Steps to reproduce the behavior.
      placeholder: |
        1. Go to '/intelligence/gnn'
        2. Click 'Run GNN Risk Prediction'
        3. See error
    validations:
      required: true
  - type: textarea
    id: expected
    attributes:
      label: Expected Behavior
      description: What you expected to happen.
    validations:
      required: true
  - type: textarea
    id: environment
    attributes:
      label: Environment & Runtime
      description: Node version, Python version, Browser, OS.
      placeholder: "Python 3.12, Node 20, Chrome 128, Windows 11"
