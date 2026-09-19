# FULFILL-X — SESSION SECURITY & TOKEN LIFECYCLE (PHASE 3)

## 1. Session Lifecycle
- **Login**: Issues `access_token` (60m) and `refresh_token` (30d).
- **Refresh**: Validates refresh token signature and status, issuing a new token pair.
- **Logout**: Instantly revokes current access token and refresh token via in-memory blacklist.
