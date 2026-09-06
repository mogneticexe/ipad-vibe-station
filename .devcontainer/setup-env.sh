#!/usr/bin/env bash
# ==============================================================================
# Codespace Post-Create Initialization (GUI Desktop + noVNC + Gigabit Power)
# ==============================================================================

echo "🚀 [VibeStation] Bootstrapping Full Gigabit Linux Desktop & Cloud PC..."

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

# 3. Create Desktop Shortcuts
cat << 'EOF' > "${HOME}/Desktop/Chromium.desktop"
[Desktop Entry]
Version=1.0
Type=Application
Name=Gigabit Browser (Chromium)
Comment=Browse the web with crazy datacenter fiber speed
Exec=chromium-browser --no-sandbox %U
Icon=chromium-browser
Terminal=false
StartupNotify=true
EOF
chmod +x "${HOME}/Desktop/Chromium.desktop"

cat << 'EOF' > "${HOME}/Desktop/Play-Game.desktop"
[Desktop Entry]
Version=1.0
Type=Application
Name=Play CyberDash (Geometry Dash)
Comment=Play CyberDash platformer
Exec=chromium-browser --no-sandbox http://localhost:3000/../starter-game/index.html
Icon=applications-games
Terminal=false
StartupNotify=true
EOF
chmod +x "${HOME}/Desktop/Play-Game.desktop"

# 4. Clean up any stale VNC or Web servers
vncserver -kill :1 2>/dev/null || true
fuser -k 5901/tcp 2>/dev/null || true
fuser -k 6080/tcp 2>/dev/null || true
fuser -k 3000/tcp 2>/dev/null || true

# 5. Start TigerVNC Server (1920x1080 24-bit color)
echo "Starting TigerVNC server on :1..."
vncserver :1 -geometry 1920x1080 -depth 24 -SecurityTypes None > /tmp/vncserver.log 2>&1

# 6. Start noVNC WebSocket Bridge on Port 6080
echo "Starting noVNC web streaming bridge on port 6080..."
nohup websockify --web /usr/share/novnc 6080 localhost:5901 > /tmp/novnc.log 2>&1 &

# 7. Start VibeStation iPad Web Server on Port 3000
echo "Launching VibeStation iPad Web Server on port 3000..."
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
echo "  ✓ Gigabit Linux Desktop GUI is LIVE!"
echo "  Port 6080: Full XFCE Desktop Stream (noVNC)"
echo "  Port 3000: VibeStation Dashboard (PWA for iPad)"
echo "  Enjoy datacenter Gigabit speeds & Cyberpunk Desktop!"
echo "=========================================================="
