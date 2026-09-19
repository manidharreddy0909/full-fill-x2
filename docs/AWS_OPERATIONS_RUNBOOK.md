# FULFILL-X — AWS OPERATIONS & RUNBOOK

## 1. HEALTH MONITORING & OBSERVABILITY

### Liveness & Readiness Endpoints
- **HTTP Liveness**: `GET /health` (Returns `{"status": "healthy", "service": "FULFILL-X Engine", "version": "0.13.0"}`)
- **API Readiness**: `GET /api/health`
- **AI Provider Health**: `GET /api/ai/providers`

### CloudWatch Monitoring & Metrics
- **Log Group**: `/ecs/fulfillx-backend`
- **Key Log Indicators**:
  - `fulfillx.realtime.event_bus`: Event bus dispatch and sequence numbers.
  - `fulfillx.providers`: AI provider initialization and Bedrock fallback events.
  - `fulfillx.cockpit`: Decision stage execution and state boundary assertions.

---

## 2. INCIDENT RESPONSE PROCEDURES

### Scenario A: ECS Task Unhealthy / Crash Loop
1. Inspect CloudWatch logs:
   ```bash
   aws logs tail /ecs/fulfillx-backend --follow --region us-east-1
   ```
2. Check ECS task stopped reason:
   ```bash
   aws ecs list-tasks --cluster fulfillx-cluster --desired-status STOPPED
   aws ecs describe-tasks --cluster fulfillx-cluster --tasks <TASK_ARN>
   ```
3. Trigger rolling task restart:
   ```bash
   aws ecs update-service --cluster fulfillx-cluster --service fulfillx-backend-service --force-new-deployment
   ```

### Scenario B: AWS Bedrock Rate Limit / Access Denied
1. FULFILL-X automatically falls back to `MockAIProvider` when Bedrock returns `NOT_CONFIGURED` or `PROVIDER_ERROR`.
2. Inspect provider status via `/api/ai/providers`.
3. To manually enforce fallback:
   ```bash
   aws ecs update-service --cluster fulfillx-cluster --service fulfillx-backend-service \
     --task-definition fulfillx-backend:latest
   ```

### Scenario C: WebSocket Disconnection / ALB Timeout
1. ALB target group has `idle_timeout = 86400` seconds (24 hours).
2. Frontend `useWebSocket` hook automatically re-establishes connections with exponential backoff and replay catch-up (`since_sequence`).

---

## 3. ROLLBACK & DISASTER RECOVERY

### Reverting Backend Container Deployment
```bash
aws ecs update-service --cluster fulfillx-cluster --service fulfillx-backend-service \
  --task-definition fulfillx-backend:<PREVIOUS_REVISION>
```

### Reverting Frontend Static Assets
```bash
aws s3 sync s3://fulfillx-frontend-backups/v1.0.0/ s3://fulfillx-frontend-production/ --delete
aws cloudfront create-invalidation --distribution-id <DISTRIBUTION_ID> --paths "/*"
```
