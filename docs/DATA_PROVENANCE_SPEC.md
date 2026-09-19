# FULFILL-X — DATA PROVENANCE & LINEAGE SPECIFICATION (Phase 2)

## 1. PROVENANCE RECORDING

Every external or synthetic dataset ingested into FULFILL-X is tracked in `data_provenance`:

```json
{
  "entity_id": "world-snapshot-seed-42",
  "entity_type": "WorldStateSnapshot",
  "source_type": "synthetic",
  "source_url": null,
  "collector": "FULFILL-X Generator (seed=42)",
  "ingested_at": "2026-09-19T23:59:00Z",
  "observed_at": "2026-09-19T23:59:00Z",
  "license": "MIT",
  "parser_version": "v1.0",
  "schema_version": "v1.0",
  "content_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```

## 2. SHA256 INTEGRITY HASHING

Content hashes are calculated deterministically across canonical JSON representations using sorted keys:
`sha256(json.dumps(payload, sort_keys=True))`
