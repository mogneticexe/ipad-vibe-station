#!/usr/bin/env bash
# ==============================================================================
# Codespace Post-Create Initialization (Pure Gigabit Linux Desktop RDP for iPad)
# ==============================================================================

echo "🚀 [VibeStation] Bootstrapping Gigabit Linux Desktop RDP..."

# 1. Ensure permissions
chmod +x .devcontainer/*.sh storage-sync/*.sh lightning/*.sh 2>/dev/null || true

# 2. Setup VNC directories & passwordless local access
mkdir -p "${HOME}/.vnc"
mkdir -p "${HOME}/Desktop"
cat << 'EOF' > "${HOME}/.vnc/xstartup"
#!/bin/sh
unset SESSION_MANAGER
unset DBUS_SESSION_BUS_ADDRESS
export XKL_XMODMAP_DISABLE=1
[ -x /etc/vnc/xstartup ] && exec /etc/vnc/xstartup
[ -r $HOME/.Xresources ] && xrdb $HOME/.Xresources
xsetroot -solid "#070812"

# Set Cyberpunk Wallpaper
if [ -f "/workspaces/ipad-vibe-station/assets/wallpaper.svg" ]; then
    feh --bg-fill "/workspaces/ipad-vibe-station/assets/wallpaper.svg" 2>/dev/null || true
fi

# Launch XFCE4 Desktop
exec dbus-launch --exit-with-session startxfce4
EOF
chmod +x "${HOME}/.vnc/xstartup"

# 3. Create Clean Desktop Shortcuts for Work & Browsing
cat << 'EOF' > "${HOME}/Desktop/Chromium.desktop"
[Desktop Entry]
Version=1.0
Type=Application
Name=Gigabit Browser (Chromium)
Comment=Browse the web with 1-3 Gbps datacenter fiber speed
Exec=chromium-browser --no-sandbox %U
Icon=chromium-browser
Terminal=false
StartupNotify=true
EOF
chmod +x "${HOME}/Desktop/Chromium.desktop"

cat << 'EOF' > "${HOME}/Desktop/Terminal.desktop"
[Desktop Entry]
Version=1.0
Type=Application
Name=Linux Terminal (tmux)
Comment=Full root shell with persistence
Exec=xfce4-terminal
Icon=utilities-terminal
Terminal=false
StartupNotify=true
EOF
chmod +x "${HOME}/Desktop/Terminal.desktop"

cat << 'EOF' > "${HOME}/Desktop/GoogleDrive-Sync.desktop"
[Desktop Entry]
Version=1.0
Type=Application
Name=Sync Google Drive (cloud-pc)
Comment=One-click mirror to your 1TB Drive
Exec=bash /workspaces/ipad-vibe-station/storage-sync/rclone-setup.sh
Icon=folder-remote
Terminal=true
StartupNotify=true
EOF
chmod +x "${HOME}/Desktop/GoogleDrive-Sync.desktop"

# 4. Clean up any stale VNC or Web servers
vncserver -kill :1 2>/dev/null || true
fuser -k 5901/tcp 2>/dev/null || true
fuser -k 6080/tcp 2>/dev/null || true
fuser -k 3000/tcp 2>/dev/null || true

# 5. Start TigerVNC Server (1920x1080 24-bit color)
echo "Starting TigerVNC server on :1..."
vncserver :1 -geometry 1920x1080 -depth 24 -SecurityTypes None > /tmp/vncserver.log 2>&1

# 6. Start noVNC WebSocket Bridge on Port 6080 (Direct iPad RDP)
echo "Starting noVNC web streaming bridge on port 6080..."
nohup websockify --web /usr/share/novnc 6080 localhost:5901 > /tmp/novnc.log 2>&1 &

# 7. Start VibeStation Control Center on Port 3000
echo "Launching VibeStation Control Center on port 3000..."
nohup python3 -u -m http.server 3000 --directory ./dashboard > /tmp/dashboard.log 2>&1 &

# 8. Start persistent tmux session
if ! tmux has-session -t vibestation 2>/dev/null; then
    tmux new-session -d -s vibestation
fi

# 9. Restore persistent tokens
if [ -f "./storage-sync/persist-tokens.sh" ]; then
    ./storage-sync/persist-tokens.sh restore || true
    nohup ./storage-sync/persist-tokens.sh watch > /tmp/persist_watch.log 2>&1 &
fi

echo "=========================================================="
echo "  ✓ Pure Gigabit Linux Desktop RDP is LIVE!"
echo "  Port 6080: Full XFCE Desktop Stream (noVNC)"
echo "  Port 3000: VibeStation Control Center"
echo "  Datacenter Gigabit speeds active!"
echo "=========================================================="
