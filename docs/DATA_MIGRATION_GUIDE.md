# FULFILL-X — DATA MIGRATION GUIDE (Phase 2)

## 1. ALEMBIC MIGRATION WORKFLOW

### Upgrade Database Schema to Latest Revision
```bash
cd backend
alembic upgrade head
```

### Downgrade Database Schema by One Revision
```bash
cd backend
alembic downgrade -1
```

### Create a New Schema Migration Script
```bash
cd backend
alembic revision -m "add_new_feature_table"
```
