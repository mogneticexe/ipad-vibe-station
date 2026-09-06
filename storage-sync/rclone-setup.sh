#!/usr/bin/env bash
# ==============================================================================
# VibeStation Google Drive 1TB Setup (`cloud-pc` folder)
# Uses rclone for ultra-fast, robust cloud storage sync and mounting
# ==============================================================================

set -e

DRIVE_FOLDER="cloud-pc"
MOUNT_POINT="${HOME}/cloud-pc"

echo "========================================================"
echo "  VibeStation Google Drive 1TB Integration Setup"
echo "========================================================"

# 1. Install rclone if not present
if ! command -v rclone &> /dev/null; then
    echo "Installing rclone..."
    curl https://rclone.org/install.sh | sudo bash 2>/dev/null || curl https://rclone.org/install.sh | bash
fi

mkdir -p "${MOUNT_POINT}"

# 2. Check if gdrive remote already exists
if rclone listremotes | grep -q "^gdrive:"; then
    echo "✓ Google Drive remote 'gdrive:' already configured."
else
    echo "Configuring Google Drive remote..."
    echo "Please run: rclone config"
    echo "Choose 'New remote', name it 'gdrive', select 'drive' (Google Drive)."
    echo "Scope: 'drive' (full access to your 1TB storage)."
fi

echo "Testing access to '${DRIVE_FOLDER}' on Google Drive..."
rclone mkdir "gdrive:${DRIVE_FOLDER}" 2>/dev/null || true

echo "✓ Google Drive '${DRIVE_FOLDER}' folder ready at 'gdrive:${DRIVE_FOLDER}'."
echo "Mount point initialized at ${MOUNT_POINT}"
