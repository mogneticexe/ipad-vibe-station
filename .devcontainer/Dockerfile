FROM mcr.microsoft.com/devcontainers/universal:2-linux

USER root

# Avoid interactive dialogs during apt installs
ENV DEBIAN_FRONTEND=noninteractive

# Install XFCE4 desktop environment, noVNC, TigerVNC, Chromium browser, and performance tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    xfce4 \
    xfce4-terminal \
    xfce4-panel \
    xfce4-session \
    tigervnc-standalone-server \
    tigervnc-tools \
    novnc \
    websockify \
    chromium-browser \
    dbus-x11 \
    x11-xserver-utils \
    feh \
    tmux \
    rclone \
    htop \
    tree \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Optimize VNC & Desktop settings for low-latency touch & keyboard on iPad
RUN echo "set -g mouse on" >> /etc/tmux.conf && \
    echo "set -g history-limit 50000" >> /etc/tmux.conf

USER codespace
WORKDIR /workspaces
