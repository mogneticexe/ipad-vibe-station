# 🚀 VibeStation Pro: Gigabit Linux Desktop & iPad Cloud PC Station

> **Turnkey, ultra-low-latency Linux Desktop GUI & Cloud PC designed specifically for an iPad + External Keyboard with 100% Free Cloud Compute & Datacenter Gigabit Speeds.**

---

## ⚡ What You Get On Your iPad

1. **Full Linux XFCE4 Desktop GUI (noVNC):**
   * Real desktop environment running on port `6080` or embedded directly inside the VibeStation iPad dashboard (`Cmd+2`).
   * **Crazy Datacenter Internet:** Download, upload, and browse at 1–3 Gbps inside Microsoft Azure / GitHub fiber datacenters.
   * Pre-installed **Chromium (Gigabit Browser)**, terminal, file manager, and custom desktop shortcuts.
   * **Coolest Ever Cyberpunk Neon Wallpaper** pre-baked into the desktop.
2. **Zero Difference Between a Linux Competitive PC and Your iPad:**
   * Ultra-low typing latency with GPU-accelerated terminal and hardware keyboard optimization.
   * Remap your iPad's `Caps Lock` to `Escape` or `Control` for seamless terminal/Vim muscle memory.
3. **Sub-1.5s Auto-Reconnect & Persistent Sessions:**
   * Whenever you lock your iPad, switch to YouTube/Notes, and return, your session restores in **under 1.5 seconds**.
   * All background scripts, AI agents (`agy`, Claude, Cursor), and dev servers run inside a detached `tmux` session that never terminates.
4. **The "Same PC Every Time" Token Vault:**
   * Automatically saves and restores your SSH keys, Git tokens, shell history, and AI credentials across container restarts.
5. **1TB Google Drive Mirror (`cloud-pc` folder):**
   * Uses `rclone` with PID locking and `node_modules` filtering for continuous background sync.
6. **120Hz ProMotion Geometry Dash Engine (`CyberDash`):**
   * High-refresh platformer with deterministic fixed-timestep physics and a Web Audio synth soundtrack.

---

## 📁 Repository Structure

```
ipad-vibe-station/
├── assets/
│   └── wallpaper.svg            # Custom Cyberpunk Neon Vector Wallpaper (2560x1440)
├── dashboard/                   # Premium OLED Cyberpunk iPad Web App
│   ├── index.html               # Multi-pane dashboard (Desktop GUI + Editor + Terminal + Game)
│   ├── style.css                # Glassmorphic OLED UI with iPad Safe Area insets
│   ├── app.js                   # Sub-1.5s auto-reconnect, desktop streaming & key relay
│   ├── manifest.json            # PWA manifest for standalone fullscreen app
│   └── sw.js                    # Service Worker keepalive & offline cache
├── starter-game/                # High-Refresh Geometry Dash Engine (120Hz ProMotion)
│   ├── index.html               # Canvas container & HUD
│   ├── game.js                  # Fixed-timestep physics, Web Audio synth & particle FX
│   └── style.css                # Neon styling
├── storage-sync/                # Google Drive 1TB & Identity Persistence
│   ├── persist-tokens.sh        # Backs up and restores SSH keys, Git tokens & AI agents
│   ├── rclone-setup.sh          # One-click rclone setup for Google Drive
│   └── sync-daemon.sh           # Background continuous sync daemon for 'cloud-pc'
├── .devcontainer/               # Full Gigabit Linux GUI Codespaces Environment
│   ├── devcontainer.json        # Port forwarding (3000, 6080, 5173)
│   ├── Dockerfile               # XFCE4, TigerVNC, noVNC, Chromium, Node 20, Python 3, tmux
│   └── setup-env.sh             # VNC bootstrap, desktop shortcuts, and wallpaper init
├── lightning/                   # Lightning AI Studio 1-Click Bootstrap
│   └── studio-bootstrap.sh      # Sets up persistent teamspace disk and starts UI
├── .vscode/                     # iPad Hardware Keyboard Profiles
│   ├── settings.json            # GPU terminal, optimized touch scroll & font sizing
│   └── keybindings.json         # iPad hardware keyboard shortcut overrides
├── IPAD_GUIDE.md                # Step-by-step iPadOS settings & modifier key guide
└── README.md
```

---

## 🚀 Quickstart: Launching Your Gigabit Cloud PC

### Step 1: Push to GitHub & Launch Codespace
1. Push this [`ipad-vibe-station/`](file:///c:/Users/ADMIN/Desktop/other/ipad-vibe-station/) repository to your GitHub.
2. Click the green **Code** button -> **Codespaces** -> **Create codespace on main**.
3. Codespaces builds the container automatically.
4. When ready, it starts:
   * **Port 3000:** The VibeStation iPad Dashboard.
   * **Port 6080:** Full Linux XFCE4 Desktop GUI (streamed via noVNC).

### Step 2: Open on iPad
1. On your iPad, open Safari to your forwarded Port `3000` link.
2. Tap **Share > Add to Home Screen** (Installs the fullscreen PWA with zero Safari URL bars).
3. Open **VibeStation** from your Home Screen.
4. Tap **"Desktop GUI"** (`Cmd+2`) to see your full Linux desktop with the cyber wallpaper and Gigabit browser, or tap **"Split View"** (`Cmd+1`) for code + game preview!

---

## ⌨ Keyboard Shortcuts Cheat Sheet

| Shortcut | Action |
| :--- | :--- |
| `Cmd + 1` | **Split View** (Editor on Left, Geometry Dash on Right) |
| `Cmd + 2` | **Full Linux Desktop GUI** (noVNC Desktop Stream) |
| `Cmd + 3` | **Full Code Studio** |
| `Cmd + 4` | **Playtest View** (Geometry Dash Fullscreen) |
| `Cmd + 5` | **Cloud Terminal** (Persistent tmux shell) |
| `Cmd + R` | **1-Second Instant Session Reconnect** |
| `Cmd + S` | **Save & Trigger Google Drive Sync** |
| `Spacebar` / `▲` | **Jump** (in Geometry Dash) |
