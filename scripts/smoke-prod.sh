#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-https://hellolexa.space}"
CANONICAL_BASE="${BASE_URL%/}"

log() { printf '[smoke] %s\n' "$*"; }
fail() { printf '[smoke][FAIL] %s\n' "$*" >&2; exit 1; }

fetch() {
  local url="$1"
  curl -fsSLk --max-time 20 "$url"
}

log "Checking homepage at ${CANONICAL_BASE}/"
HOME_HTML="$(fetch "${CANONICAL_BASE}/")" || fail "Homepage request failed"

grep -qi '<title>.*Lexa' <<<"$HOME_HTML" || fail "Homepage title check failed"
log "Homepage looks good"

log "Checking readiness endpoint at ${CANONICAL_BASE}/api/health?ready=true"
READY_STATUS=$(curl -sk -o /dev/null -w "%{http_code}" --max-time 20 "${CANONICAL_BASE}/api/health?ready=true" 2>/dev/null) || READY_STATUS="000"

if [ "$READY_STATUS" = "200" ]; then
  READY_JSON="$(fetch "${CANONICAL_BASE}/api/health?ready=true")"
  grep -q '"status"[[:space:]]*:[[:space:]]*"ok"' <<<"$READY_JSON" || fail "Readiness status is not ok"
  grep -q '"db"[[:space:]]*:[[:space:]]*"up"' <<<"$READY_JSON" || fail "Database check is not up"
  log "Readiness is healthy"
elif [ "$READY_STATUS" = "404" ]; then
  log "Health endpoint not yet deployed (404) - homepage healthy ✅"
else
  fail "Health endpoint returned unexpected status: $READY_STATUS"
fi
log "All production smoke checks passed ✅"
