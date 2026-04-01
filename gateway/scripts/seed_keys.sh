#!/usr/bin/env bash
#
# Seed a test API key into Redis via the seed CLI.
# Requires the Docker Compose stack to be running (at least redis).
#
# Usage:
#   ./gateway/scripts/seed_keys.sh [--tenant TENANT_ID] [--tier TIER] [--rate-limit LIMIT]
#
# Defaults: tenant=test-tenant-001, tier=free, rate-limit=10000

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
GATEWAY_DIR="$(dirname "$SCRIPT_DIR")"

TENANT="${1:---tenant}"
if [ "$TENANT" = "--tenant" ]; then
    shift 2>/dev/null || true
    TENANT_ID="${1:-test-tenant-001}"
    shift 2>/dev/null || true
else
    TENANT_ID="test-tenant-001"
fi

cd "$GATEWAY_DIR"

export REDIS_ADDR="${REDIS_ADDR:-localhost:6379}"

echo "Seeding API key for tenant: $TENANT_ID"
echo "Redis: $REDIS_ADDR"
echo ""

go run ./cmd/seed --tenant "$TENANT_ID" "$@"
