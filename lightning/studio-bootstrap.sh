#!/usr/bin/env bash
# ==============================================================================
# Lightning AI Studio 1-Click Bootstrap (Optimized Pro Edition)
# Maximize persistent storage and run the VibeStation iPad environment
# ==============================================================================

set -e

STUDIO_ROOT="/teamspace/studios/this_studio"

echo "⚡ [VibeStation] Bootstrapping on Lightning AI Studio..."

# 1. Install prerequisites if missing
if ! command -v tmux &> /dev/null; then
    sudo apt-get update && sudo apt-get install -y tmux
fi

if ! command -v rclone &> /dev/null; then
    curl https://rclone.org/install.sh | sudo bash
fi

# 2. Make scripts executable
chmod +x storage-sync/*.sh .devcontainer/*.sh 2>/dev/null || true

# 3. Restore persisted credentials
./storage-sync/persist-tokens.sh restore || true
nohup ./storage-sync/persist-tokens.sh watch > /tmp/persist_watch.log 2>&1 &

# 4. Launch persistent tmux session
if ! tmux has-session -t vibestation 2>/dev/null; then
    tmux new-session -d -s vibestation
fi

# 5. Free port 3000 if previously occupied
fuser -k 3000/tcp 2>/dev/null || true

# 6. Serve iPad Web Dashboard on Port 3000
echo "Serving VibeStation iPad UI on port 3000..."
nohup python3 -u -m http.server 3000 --directory ./dashboard > /tmp/vibestation-web.log 2>&1 &

# 7. Add alias for convenience
grep -qxF "alias vibe='tmux attach -t vibestation'" ~/.bashrc || echo "alias vibe='tmux attach -t vibestation'" >> ~/.bashrc

echo "=========================================================="
echo "  ✓ Lightning Studio VibeStation Ready!"
echo "  - Persistent directory: ${STUDIO_ROOT}"
echo "  - Port 3000 exposed for iPad browser / PWA"
echo "  - Type 'vibe' anytime to attach to persistent terminal"
echo "=========================================================="
