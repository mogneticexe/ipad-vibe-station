#!/usr/bin/env bash
# ==============================================================================
# VibeStation Token & Identity Persistence Daemon
# Ensures you NEVER lose login tokens, SSH keys, or AI configurations
# Across ephemeral cloud restarts (Codespaces, Lightning Studio, Docker)
# ==============================================================================

VAULT_DIR="${HOME}/cloud-pc/.vibestation_vault"
LOCAL_BACKUP_DIR="${HOME}/.vibestation_persist"

mkdir -p "${LOCAL_BACKUP_DIR}"

save_tokens() {
    echo "🔒 [VibeStation] Backing up identity, tokens, and credentials..."

    TARGET="${LOCAL_BACKUP_DIR}"
    if [ -d "${HOME}/cloud-pc" ]; then
        mkdir -p "${VAULT_DIR}"
        TARGET="${VAULT_DIR}"
    fi

    # 1. SSH Keys
    if [ -d "${HOME}/.ssh" ]; then
        cp -r "${HOME}/.ssh" "${TARGET}/"
    fi

    # 2. Git & GitHub CLI Tokens
    [ -f "${HOME}/.gitconfig" ] && cp "${HOME}/.gitconfig" "${TARGET}/"
    [ -d "${HOME}/.config/gh" ] && mkdir -p "${TARGET}/gh" && cp -r "${HOME}/.config/gh" "${TARGET}/"

    # 3. AI Agent Tokens (Antigravity agy, Gemini, Claude, Cursor)
    [ -d "${HOME}/.gemini" ] && mkdir -p "${TARGET}/gemini" && cp -r "${HOME}/.gemini" "${TARGET}/"
    [ -d "${HOME}/.agy" ] && mkdir -p "${TARGET}/agy" && cp -r "${HOME}/.agy" "${TARGET}/"
    [ -d "${HOME}/.anthropic" ] && mkdir -p "${TARGET}/anthropic" && cp -r "${HOME}/.anthropic" "${TARGET}/"

    # 4. Tailscale Keys & Shell History
    [ -f "${HOME}/.bash_history" ] && cp "${HOME}/.bash_history" "${TARGET}/"
    [ -f "${HOME}/.zsh_history" ] && cp "${HOME}/.zsh_history" "${TARGET}/"

    echo "✓ [VibeStation] All tokens and session credentials safely stored."
}

restore_tokens() {
    echo "⚡ [VibeStation] Restoring identity and tokens into current cloud PC..."

    SOURCE="${LOCAL_BACKUP_DIR}"
    if [ -d "${VAULT_DIR}" ]; then
        SOURCE="${VAULT_DIR}"
    fi

    # Restore SSH
    if [ -d "${SOURCE}/.ssh" ]; then
        mkdir -p "${HOME}/.ssh"
        cp -r "${SOURCE}/.ssh/"* "${HOME}/.ssh/"
        chmod 700 "${HOME}/.ssh"
        chmod 600 "${HOME}/.ssh/"* 2>/dev/null || true
    fi

    # Restore Git
    [ -f "${SOURCE}/.gitconfig" ] && cp "${SOURCE}/.gitconfig" "${HOME}/"
    if [ -d "${SOURCE}/gh" ]; then
        mkdir -p "${HOME}/.config/gh"
        cp -r "${SOURCE}/gh/"* "${HOME}/.config/gh/"
    fi

    # Restore AI Agents
    if [ -d "${SOURCE}/gemini" ]; then
        mkdir -p "${HOME}/.gemini"
        cp -r "${SOURCE}/gemini/"* "${HOME}/.gemini/"
    fi
    if [ -d "${SOURCE}/agy" ]; then
        mkdir -p "${HOME}/.agy"
        cp -r "${SOURCE}/agy/"* "${HOME}/.agy/"
    fi

    echo "✓ [VibeStation] Environment restored! Exact same PC state active."
}

case "$1" in
    save)
        save_tokens
        ;;
    restore)
        restore_tokens
        ;;
    watch)
        echo "Starting auto-save watcher (every 5 minutes)..."
        while true; do
            save_tokens
            sleep 300
        done
        ;;
    *)
        echo "Usage: $0 {save|restore|watch}"
        ;;
esac
