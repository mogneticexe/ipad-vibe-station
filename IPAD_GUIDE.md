# VibeStation: The Ultimate iPad + External Keyboard Linux RDP Guide

This guide ensures your iPad Pro / iPad Air with external keyboard (Magic Keyboard, Logitech Combo Touch, or Bluetooth keyboard) works with **zero friction, zero latency, and desktop-grade Linux keybindings**.

---

## 1. Eliminate the Safari URL Bar (Fullscreen PWA Mode)

Standard Safari steals vertical space and intercepts keyboard shortcuts like `Cmd+W` (closes your tab) or `Cmd+R` (refreshes your page).

**How to Install the Standalone Web App:**
1. Open Safari on your iPad and navigate to your port `6080` (noVNC Desktop) or port `3000` (VibeStation Dashboard) link.
2. Tap the **Share** button (the square with an arrow pointing up) in Safari.
3. Scroll down and tap **"Add to Home Screen"**.
4. Name it **Linux PC** and tap **Add**.
5. Open the app directly from your iPad Home Screen!
   - *Result:* 100% full screen with zero Safari navigation bars.
   - *Keybindings:* Full keyboard capture enabled; iPadOS won't trap your shortcuts.

---

## 2. Fix the Missing Escape Key & iPadOS Shortcuts

Most iPad keyboards lack an `Esc` key or place a globe key in its place.

**The Pro Fix (iPadOS Native Remapping):**
1. On your iPad, open **Settings**.
2. Go to **General** > **Keyboard** > **Hardware Keyboard**.
3. Tap **Modifier Keys**.
4. Change **Caps Lock** to **Escape** (or **Control**).
   - Now, hitting `Caps Lock` triggers instant `Esc` across Linux XFCE terminal, Vim, and code editors!

---

## 3. Sub-1.5s Background Reconnection

* **The Problem:** When you lock your iPad or switch to another app, iPadOS puts background tabs to sleep.
* **The Solution:** 
  - VibeStation uses the **Page Lifecycle API** + `visibilitychange` listener.
  - The moment you unlock your iPad or switch back, VibeStation performs an ultra-fast handshake in **under 1.5 seconds**.
  - All processes on the cloud PC run inside **tmux**, meaning long AI runs, agent commands, or compilation jobs never stop.

---

## 4. Google Drive 1TB Sync (`cloud-pc` Folder)

* VibeStation integrates with **`rclone`** to sync or mount your 1TB Google Drive `cloud-pc` folder.
* Any code, models, or assets saved in `~/cloud-pc` are mirrored in real time to your Google Drive.
* You can share this folder with collaborators or access it from any phone, laptop, or browser.

---

## 5. Keyboard Cheat Sheet

| Shortcut | Action |
| :--- | :--- |
| `Cmd + 1` | **Full Linux Desktop GUI** (noVNC Desktop Stream) |
| `Cmd + 2` | **Full Code Studio** |
| `Cmd + 3` | **Cloud Terminal** (tmux shell) |
| `Cmd + R` | **1-Second Instant Session Reconnect** |
| `Cmd + S` | **Save & Force Google Drive Sync** |
| `Caps Lock` | **Escape** (when remapped in iPadOS) |
