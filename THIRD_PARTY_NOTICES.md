# FULFILL-X — Open-Source Notices & Third-Party Attributions

This document contains open-source notices, software licensing information, and copyright attributions for third-party software components and libraries utilized by **FULFILL-X — Agentic Fulfillment Resilience Intelligence**.

---

## 1. Governance & Licensing Policy

FULFILL-X adheres to strict open-source governance:
- **No Code Clones**: FULFILL-X does not copy, rename, or clone upstream open-source repositories into its codebase. All external dependencies are imported as standard, version-pinned package dependencies via standard registries (`npm` for TypeScript/React, `PyPI` for Python).
- **Compatible Licensing**: All third-party software used within FULFILL-X is licensed under commercially compatible open-source licenses, including **MIT**, **Apache-2.0**, **BSD-3-Clause**, **ISC**, and **SIL Open Font License 1.1**.
- **Notice Preservation**: All copyright notices, license texts, and attribution headers are preserved in accordance with respective open-source licenses.

---

## 2. Python Backend Dependencies

The FULFILL-X backend (`/backend`) utilizes the following open-source software libraries:

| Component | Source Registry | Version | License | Usage | Modification Status | Attribution Requirement |
|-----------|-----------------|---------|---------|-------|---------------------|------------------------|
| **FastAPI** | PyPI (`fastapi`) | 0.110.0 | MIT | Web framework & REST API engine | Unmodified | Include MIT license & copyright notice |
| **Uvicorn** | PyPI (`uvicorn`) | 0.28.0 | BSD-3-Clause | Async ASGI server | Unmodified | Include BSD-3-Clause notice |
| **Pydantic** | PyPI (`pydantic`) | 2.6.0 | MIT | Schema definition & data validation | Unmodified | Include MIT license & copyright notice |
| **Pydantic Settings** | PyPI (`pydantic-settings`) | 2.2.0 | MIT | Environment-driven settings management | Unmodified | Include MIT license & copyright notice |
| **HTTPX** | PyPI (`httpx`) | 0.27.0 | BSD-3-Clause | Async HTTP client for AI providers | Unmodified | Include BSD-3-Clause notice |
| **WebSockets** | PyPI (`websockets`) | 12.0 | BSD-3-Clause | WebSocket protocol implementation | Unmodified | Include BSD-3-Clause notice |
| **pytest** | PyPI (`pytest`) | 8.3.2 | MIT | Automated test framework | Unmodified | Include MIT license & copyright notice |
| **pytest-asyncio** | PyPI (`pytest-asyncio`) | 0.23.8 | Apache-2.0 | Asyncio support for pytest | Unmodified | Include Apache-2.0 license notice |

---

## 3. TypeScript & React Frontend Dependencies

The FULFILL-X frontend (`/frontend`) utilizes the following open-source software libraries:

| Component | Source Registry | Version | License | Usage | Modification Status | Attribution Requirement |
|-----------|-----------------|---------|---------|-------|---------------------|------------------------|
| **React** | npm (`react`) | 18.2.0 | MIT | Frontend UI rendering framework | Unmodified | Include MIT license & copyright notice |
| **React DOM** | npm (`react-dom`) | 18.2.0 | MIT | DOM rendering engine for React | Unmodified | Include MIT license & copyright notice |
| **Three.js** | npm (`three`) | 0.162.0 | MIT | 3D WebGL graphics engine | Unmodified | Include MIT license & copyright notice |
| **React Three Fiber** | npm (`@react-three/fiber`) | 8.16.0 | MIT | React declarator for Three.js | Unmodified | Include MIT license & copyright notice |
| **Drei** | npm (`@react-three/drei`) | 9.100.0 | MIT | Helper library for React Three Fiber | Unmodified | Include MIT license & copyright notice |
| **Lucide React** | npm (`lucide-react`) | 0.350.0 | ISC | Vector icon components | Unmodified | Include ISC license & copyright notice |
| **Vite** | npm (`vite`) | 5.4.14 | MIT | Frontend build tool & HMR server | Unmodified | Include MIT license & copyright notice |
| **TypeScript** | npm (`typescript`) | 5.2.2 | Apache-2.0 | Type safety & compilation | Unmodified | Include Apache-2.0 license notice |

---

## 4. Infrastructure & Container Dependencies

| Component | Source / Registry | Version | License | Usage | Modification Status | Attribution Requirement |
|-----------|-------------------|---------|---------|-------|---------------------|------------------------|
| **Python Alpine / Slim Base Image** | Docker Hub (`python:3.12-slim`) | 3.12.3 | PSF License | Backend container base image | Unmodified | Python Software Foundation License |
| **Nginx Alpine Base Image** | Docker Hub (`nginx:1.25-alpine`) | 1.25 | BSD-2-Clause | Frontend web server & SPA proxy | Unmodified | Include BSD-2-Clause notice |
| **Terraform AWS Provider** | HashiCorp Registry (`hashicorp/aws`) | ~> 5.0 | MPL-2.0 | Infrastructure-as-Code provisioning | Unmodified | Mozilla Public License 2.0 |

---

## 5. Third-Party Assets & Typography

| Asset | Source | License | Usage | Modification Status |
|-------|--------|---------|-------|---------------------|
| **Inter Font** | Google Fonts | SIL Open Font License 1.1 (OFL) | Primary UI Typography | Unmodified |
| **JetBrains Mono Font** | Google Fonts | SIL Open Font License 1.1 (OFL) | Code & Terminal Typography | Unmodified |
| **Lucide Icons** | Lucide Project | ISC License | System UI Icons | Unmodified |

---

## 6. Original Engineering & Source Repository Attribution

FULFILL-X is an original supply chain resilience intelligence application developed for **Agentic Fulfillment Resilience Intelligence**.
- **Original Source Code**: 100% of application logic in `backend/app/`, `frontend/src/`, `infra/terraform/`, `scripts/`, and `backend/tests/` was custom-designed and authored specifically for FULFILL-X.
- **No Adapted Upstream Repositories**: FULFILL-X did not fork, copy, or adapt code from third-party application repositories.

---

## 7. License Text Summaries

### MIT License
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software.

### Apache License 2.0
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at `http://www.apache.org/licenses/LICENSE-2.0`.

### BSD 3-Clause License
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the copyright notice and list of conditions are met.

---

*Document compiled as part of Phase 15 Security Audit & Attribution Hardening.*
