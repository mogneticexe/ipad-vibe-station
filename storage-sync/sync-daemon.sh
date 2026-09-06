#!/usr/bin/env bash
# ==============================================================================
# VibeStation Google Drive Continuous Sync Daemon (Optimized Pro Edition)
# - Excludes node_modules, .git, and build caches to prevent Drive API rate-limiting
# - Single-instance PID locking to prevent race conditions
# - Bandwidth and memory tuning for low latency
# ==============================================================================

LOCAL_DIR="${HOME}/cloud-pc"
REMOTE_DIR="gdrive:cloud-pc"
LOCK_FILE="/tmp/vibestation_sync.pid"
INTERVAL_SECONDS=45

# Prevent multiple sync daemons from running
if [ -f "${LOCK_FILE}" ]; then
    OLD_PID=$(cat "${LOCK_FILE}" 2>/dev/null || true)
    if kill -0 "${OLD_PID}" 2>/dev/null; then
        echo "⚠️ Sync daemon already running (PID: ${OLD_PID}). Exiting duplicate."
        exit 0
    fi
fi
echo "$$" > "${LOCK_FILE}"
trap "rm -f '${LOCK_FILE}'" EXIT INT TERM

echo "☁ [VibeStation] Optimized Google Drive sync daemon active."
echo "Local:  ${LOCAL_DIR}"
echo "Remote: ${REMOTE_DIR}"

mkdir -p "${LOCAL_DIR}"

# Exclusion arguments to keep sync instantaneous
EXCLUDES=(
    --exclude "node_modules/**"
    --exclude ".git/**"
    --exclude "__pycache__/**"
    --exclude ".cache/**"
    --exclude ".next/**"
    --exclude "dist/**"
    --exclude "*.tmp"
)

while true; do
    if rclone listremotes 2>/dev/null | grep -q "^gdrive:"; then
        # 1. Sync Local to Remote
        rclone copy "${LOCAL_DIR}" "${REMOTE_DIR}" \
            "${EXCLUDES[@]}" \
            --update \
            --fast-list \
            --buffer-size 16M \
            --transfers 4 \
            --checkers 8 2>/dev/null || true

        # 2. Sync Remote to Local
        rclone copy "${REMOTE_DIR}" "${LOCAL_DIR}" \
            "${EXCLUDES[@]}" \
            --update \
            --fast-list \
            --buffer-size 16M \
            --transfers 4 \
            --checkers 8 2>/dev/null || true
    fi
    sleep "${INTERVAL_SECONDS}"
done
