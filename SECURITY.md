# FULFILL-X Security Policy & Vulnerability Reporting

The FULFILL-X project takes repository security, API credential safety, and data protection seriously.

---

## Reporting Vulnerabilities

If you discover a potential security vulnerability or credential exposure within FULFILL-X:

1. **Do NOT publicly disclose the issue** in public GitHub issues, discussions, or social media.
2. **Use GitHub Private Vulnerability Reporting**: Submit a report via the **Security** tab of the [FULFILL-X GitHub Repository](https://github.com/manidharreddy0909/fulfill-x/security/advisories/new).
3. **Include Technical Context**: Provide step-by-step reproduction details, affected components or endpoints, and potential security impact without attaching sensitive live production data.

---

## Secret & Credential Safety Guidelines

- **Zero In-Repo Credentials**: AWS access keys, API tokens, JWT private keys, database passwords, or `.env` files containing credentials must **NEVER** be committed to the repository.
- **Environment Variables & Secrets Managers**: In production or cloud deployments, all sensitive runtime parameters must be injected via secure environment variables or AWS Secrets Manager / SSM Parameter Store.
- **AWS Credentials**: AWS authentication must be managed via standard AWS credential chains (AWS IAM Roles for ECS Fargate, AWS STS, or localized `aws configure` profiles stored outside version control).

---

## Dependency & Supply Chain Security

- All third-party Python packages and Node.js npm packages undergo automated vulnerability scanning (`pip-audit` / `npm audit`).
- Dependabot security updates are enabled to alert maintainers to vulnerable dependencies.

---

## Responsible Disclosure Policy

Maintainers will acknowledge reports within 48 hours and work to validate and remediate verified vulnerabilities promptly.
