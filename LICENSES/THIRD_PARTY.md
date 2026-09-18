# LICENSES / Third-Party Attributions

> Maintained per AGENTS.md Rule 15. Every external dependency must be
> reviewed and documented here before use.

---

## Policy

FULFILL-X does not clone or rename open-source projects. External code
is used only under compatible licenses (MIT, Apache-2.0, BSD) and is
properly attributed here.

---

## Runtime Dependencies (Planned)

### Frontend

| Package | License | Version | Purpose |
|---------|---------|---------|---------|
| react | MIT | ^18.x | UI framework |
| react-dom | MIT | ^18.x | DOM rendering |
| typescript | Apache-2.0 | ^5.x | Type safety |
| vite | MIT | ^5.x | Build tool |
| tailwindcss | MIT | ^3.x | Utility CSS |
| @radix-ui/* | MIT | ^1.x | Accessible primitives (shadcn/ui) |
| three | MIT | ^0.165.x | 3D rendering |
| @react-three/fiber | MIT | ^8.x | React bindings for Three.js |
| @react-three/drei | MIT | ^9.x | Three.js helpers |
| framer-motion | MIT | ^11.x | Animation library |
| gsap | Standard (free tier) | ^3.x | Advanced animation |
| recharts | MIT | ^2.x | Chart library |
| reactflow | MIT | ^11.x | Flow diagram library |
| zustand | MIT | ^4.x | State management |
| @tanstack/react-query | MIT | ^5.x | Server state management |
| lucide-react | ISC | ^0.400.x | Icon library |

### Backend

| Package | License | Version | Purpose |
|---------|---------|---------|---------|
| fastapi | MIT | ^0.111.x | API framework |
| uvicorn | BSD | ^0.30.x | ASGI server |
| pydantic | MIT | ^2.x | Data validation |
| sqlalchemy | MIT | ^2.x | ORM |
| alembic | MIT | ^1.x | DB migrations |
| redis | MIT | ^5.x | Cache client |
| psycopg2-binary | LGPL | ^2.x | PostgreSQL driver |
| httpx | BSD | ^0.27.x | HTTP client |
| google-generativeai | Apache-2.0 | ^0.7.x | Gemini AI provider |
| boto3 | Apache-2.0 | ^1.x | AWS SDK |
| pytest | MIT | ^8.x | Test framework |
| ruff | MIT | ^0.5.x | Linter |

---

## Development Tools

| Tool | License | Purpose |
|------|---------|---------|
| docker | Apache-2.0 | Containerization |
| docker-compose | Apache-2.0 | Local orchestration |
| git | GPL-2.0 | Version control |
| aws-cdk | Apache-2.0 | Infrastructure as code |

---

## AI Model Usage

| Provider | Terms | Notes |
|----------|-------|-------|
| Google Gemini | Google AI Terms of Service | Primary LLM provider |
| Ollama | MIT | Local inference, no data leaves machine |
| AWS Bedrock | AWS Service Terms | Optional cloud inference |

---

## Assets & Fonts

| Asset | License | Source |
|-------|---------|--------|
| Inter font | SIL Open Font License 1.1 | Google Fonts |
| JetBrains Mono | SIL Open Font License 1.1 | Google Fonts |

---

*All licenses reviewed as of Phase 00. Update this file when adding
any new dependency.*
