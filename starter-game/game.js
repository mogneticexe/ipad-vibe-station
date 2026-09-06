/**
 * CyberDash Core Engine - High Refresh Geometry Platformer (Optimized Pro Edition)
 * - Deterministic Fixed-Timestep Physics (Flawless on 60Hz, 120Hz ProMotion iPad screens)
 * - Retina / High-DPI Canvas Backing with zero blur
 * - Robust Web Audio Scheduler with drift prevention & overlap guards
 * - Cross-frame keyboard event bubbling for iPad Dashboard
 */

class SoundSynthesizer {
  constructor() {
    this.ctx = null;
    this.bpm = 135;
    this.isPlaying = false;
    this.step = 0;
    this.nextNoteTime = 0;
    this.timerId = null;
    this.unlocked = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.unlocked = true;
  }

  playJumpSound() {
    if (!this.ctx || !this.unlocked) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {}
  }

  playOrbSound() {
    if (!this.ctx || !this.unlocked) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.15);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  playDeathSound() {
    if (!this.ctx || !this.unlocked) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.3);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }

  startBGM() {
    this.init();
    this.stopBGM(); // Prevent overlapping BGM timers bug
    this.isPlaying = true;
    this.step = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.05;
    this.scheduler();
  }

  stopBGM() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  scheduler() {
    if (!this.isPlaying || !this.ctx) return;
    const secondsPerBeat = 60.0 / this.bpm;
    const secondsPer16th = secondsPerBeat / 4;

    while (this.nextNoteTime < this.ctx.currentTime + 0.15) {
      this.playBeat(this.step, this.nextNoteTime);
      this.nextNoteTime += secondsPer16th;
      this.step = (this.step + 1) % 32;
    }
    this.timerId = setTimeout(() => this.scheduler(), 25);
  }

  playBeat(step, time) {
    if (!this.ctx) return;
    try {
      // Four-on-the-floor kick
      if (step % 4 === 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(140, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.12);
        gain.gain.setValueAtTime(0.4, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + 0.12);
      }

      // Cyber synth notes
      const notes = [130.81, 146.83, 164.81, 174.61, 196.00];
      if (step % 2 === 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        const note = notes[(step / 2) % notes.length];
        osc.frequency.setValueAtTime(note, time);
        gain.gain.setValueAtTime(0.06, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + 0.1);
      }
    } catch (e) {}
  }
}

class CyberDashGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.synth = new SoundSynthesizer();

    this.progressBar = document.getElementById('progressBar');
    this.percentText = document.getElementById('percentText');
    this.attemptText = document.getElementById('attemptText');
    this.startOverlay = document.getElementById('startOverlay');
    this.playBtn = document.getElementById('playBtn');

    this.attempt = 1;
    this.gameState = 'MENU';

    // Physics constants calibrated to standard 60Hz baseline
    this.GRAVITY = 1.35;
    this.JUMP_FORCE = -17.5;
    this.PAD_FORCE = -22.0;
    this.SPEED = 8.5;

    // Viewport coordinates
    this.internalWidth = 1280;
    this.internalHeight = 720;
    this.groundY = 560;

    // Fixed timestep accumulator for 120Hz ProMotion & variable refresh displays
    this.fixedDeltaTime = 1000 / 60; // 16.66ms per update
    this.accumulator = 0;
    this.lastTime = performance.now();

    this.player = {
      x: 180,
      y: this.groundY - 48,
      w: 48,
      h: 48,
      vy: 0,
      rotation: 0,
      onGround: true,
      alive: true
    };

    this.input = {
      jumping: false,
      bufferTimer: 0
    };

    this.cameraX = 0;
    this.particles = [];
    this.obstacles = [];
    this.levelLength = 12000;

    this.setupLevel();
    this.bindEvents();
    this.resize();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.dpr = dpr;

    this.scale = Math.min(
      (this.canvas.width / dpr) / this.internalWidth,
      (this.canvas.height / dpr) / this.internalHeight
    );
  }

  setupLevel() {
    this.obstacles = [];
    for (let x = 600; x < this.levelLength; x += 320) {
      const type = Math.floor(Math.random() * 4);
      if (type === 0) {
        this.obstacles.push({ type: 'spike', x: x, y: this.groundY, w: 48, h: 48 });
      } else if (type === 1) {
        this.obstacles.push({ type: 'spike', x: x, y: this.groundY, w: 48, h: 48 });
        this.obstacles.push({ type: 'spike', x: x + 48, y: this.groundY, w: 48, h: 48 });
        x += 60;
      } else if (type === 2) {
        this.obstacles.push({ type: 'pad', x: x, y: this.groundY - 14, w: 56, h: 14 });
        this.obstacles.push({ type: 'block', x: x + 240, y: this.groundY - 120, w: 96, h: 48 });
        this.obstacles.push({ type: 'spike', x: x + 240, y: this.groundY, w: 48, h: 48 });
        x += 280;
      } else if (type === 3) {
        this.obstacles.push({ type: 'spike', x: x + 60, y: this.groundY, w: 48, h: 48 });
        this.obstacles.push({ type: 'spike', x: x + 108, y: this.groundY, w: 48, h: 48 });
        this.obstacles.push({ type: 'orb', x: x + 84, y: this.groundY - 140, r: 24, triggered: false });
        x += 180;
      }
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());

    const triggerJump = () => {
      this.synth.init();
      if (this.gameState === 'MENU') {
        this.startGame();
      } else if (this.gameState === 'PLAYING') {
        this.input.jumping = true;
        this.input.bufferTimer = 8;
      } else if (this.gameState === 'DEAD') {
        this.restartGame();
      }
    };

    const releaseJump = () => {
      this.input.jumping = false;
    };

    window.addEventListener('keydown', (e) => {
      // Forward Cmd+1 to Cmd+4 or Cmd+R to parent dashboard frame if embedded!
      if (e.metaKey || e.ctrlKey) {
        window.parent.postMessage({ type: 'VIBESTATION_FORWARD_KEY', key: e.key, metaKey: e.metaKey, ctrlKey: e.ctrlKey }, '*');
      }

      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        triggerJump();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        releaseJump();
      }
    });

    this.canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      triggerJump();
    });
    this.canvas.addEventListener('pointerup', releaseJump);
    this.playBtn.addEventListener('click', () => triggerJump());

    window.addEventListener('message', (e) => {
      if (e.data && e.data.type === 'VIBESTATION_JUMP') {
        triggerJump();
      } else if (e.data && e.data.type === 'VIBESTATION_RESUME') {
        this.synth.init();
      }
    });
  }

  startGame() {
    this.startOverlay.classList.add('hidden');
    this.gameState = 'PLAYING';
    this.synth.startBGM();
  }

  restartGame() {
    this.attempt++;
    this.attemptText.textContent = `ATTEMPT ${this.attempt}`;
    this.player.x = 180;
    this.player.y = this.groundY - 48;
    this.player.vy = 0;
    this.player.rotation = 0;
    this.player.onGround = true;
    this.player.alive = true;
    this.cameraX = 0;
    this.particles = [];
    this.setupLevel();
    this.gameState = 'PLAYING';
    this.synth.startBGM();
  }

  spawnDeathExplosion(x, y) {
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 3;
      this.particles.push({
        x: x + 24,
        y: y + 24,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 8 + 4,
        color: Math.random() > 0.5 ? '#00f0ff' : '#00ff88',
        alpha: 1.0,
        decay: Math.random() * 0.03 + 0.015
      });
    }
  }

  die() {
    if (!this.player.alive) return;
    this.player.alive = false;
    this.gameState = 'DEAD';
    this.synth.stopBGM();
    this.synth.playDeathSound();
    this.spawnDeathExplosion(this.player.x, this.player.y);
    setTimeout(() => {
      this.restartGame();
    }, 850);
  }

  // Pure Fixed-Timestep Physics Step (Deterministic across 60Hz & 120Hz displays)
  fixedUpdate() {
    if (this.gameState !== 'PLAYING') return;

    this.player.x += this.SPEED;
    this.cameraX = this.player.x - 200;

    if (this.input.bufferTimer > 0) {
      this.input.bufferTimer--;
    }

    // Mid-air Orb Interaction
    if (this.input.jumping) {
      for (const obs of this.obstacles) {
        if (obs.type === 'orb' && !obs.triggered) {
          const dx = (this.player.x + 24) - obs.x;
          const dy = (this.player.y + 24) - obs.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < obs.r + 34) {
            obs.triggered = true;
            this.player.vy = this.JUMP_FORCE * 1.05;
            this.player.onGround = false;
            this.synth.playOrbSound();
            break;
          }
        }
      }
    }

    // Jump
    if ((this.input.jumping || this.input.bufferTimer > 0) && this.player.onGround) {
      this.player.vy = this.JUMP_FORCE;
      this.player.onGround = false;
      this.input.bufferTimer = 0;
      this.synth.playJumpSound();
    }

    // Gravity
    this.player.vy += this.GRAVITY;
    this.player.y += this.player.vy;

    // Rotation
    if (!this.player.onGround) {
      this.player.rotation += 9.5;
    } else {
      this.player.rotation = Math.round(this.player.rotation / 90) * 90;
    }

    // Ground collision
    if (this.player.y >= this.groundY - this.player.h) {
      this.player.y = this.groundY - this.player.h;
      this.player.vy = 0;
      this.player.onGround = true;
    } else {
      this.player.onGround = false;
    }

    // Trail particles
    if (Math.random() > 0.35) {
      this.particles.push({
        x: this.player.x,
        y: this.player.y + this.player.h - 8,
        vx: -this.SPEED * 0.4 + (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 6 + 3,
        color: '#00f0ff',
        alpha: 0.8,
        decay: 0.04
      });
    }

    // Obstacle Collisions
    const pBox = {
      x: this.player.x + 8,
      y: this.player.y + 8,
      w: this.player.w - 16,
      h: this.player.h - 16
    };

    for (const obs of this.obstacles) {
      if (obs.x - this.cameraX > this.internalWidth + 200) continue;

      if (obs.type === 'spike') {
        if (
          pBox.x + pBox.w > obs.x + 10 &&
          pBox.x < obs.x + obs.w - 10 &&
          pBox.y + pBox.h > obs.y - obs.h + 8 &&
          pBox.y < obs.y
        ) {
          this.die();
          break;
        }
      } else if (obs.type === 'pad') {
        if (
          pBox.x + pBox.w > obs.x &&
          pBox.x < obs.x + obs.w &&
          pBox.y + pBox.h >= obs.y &&
          pBox.y < obs.y + obs.h
        ) {
          this.player.vy = this.PAD_FORCE;
          this.player.onGround = false;
          this.synth.playOrbSound();
        }
      } else if (obs.type === 'block') {
        if (
          pBox.x + pBox.w > obs.x &&
          pBox.x < obs.x + obs.w &&
          pBox.y + pBox.h > obs.y &&
          pBox.y < obs.y + obs.h
        ) {
          if (this.player.vy > 0 && this.player.y + this.player.h - this.player.vy <= obs.y + 12) {
            this.player.y = obs.y - this.player.h;
            this.player.vy = 0;
            this.player.onGround = true;
          } else {
            this.die();
            break;
          }
        }
      }
    }

    // Progress Bar
    const percent = Math.min(100, Math.floor((this.player.x / this.levelLength) * 100));
    this.progressBar.style.width = `${percent}%`;
    this.percentText.textContent = `${percent}%`;
  }

  draw() {
    this.ctx.save();
    this.ctx.scale(this.dpr, this.dpr);
    this.ctx.fillStyle = '#050608';
    this.ctx.fillRect(0, 0, this.canvas.width / this.dpr, this.canvas.height / this.dpr);

    const screenW = this.canvas.width / this.dpr;
    const screenH = this.canvas.height / this.dpr;
    const offsetX = (screenW - this.internalWidth * this.scale) / 2;
    const offsetY = (screenH - this.internalHeight * this.scale) / 2;
    this.ctx.translate(offsetX, offsetY);
    this.ctx.scale(this.scale, this.scale);

    // Parallax Grid
    this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
    this.ctx.lineWidth = 1;
    const gridOffset = -(this.cameraX * 0.3) % 60;
    for (let x = gridOffset; x < this.internalWidth; x += 60) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.groundY);
      this.ctx.stroke();
    }

    // Ground line
    this.ctx.strokeStyle = '#00f0ff';
    this.ctx.lineWidth = 3;
    this.ctx.shadowColor = '#00f0ff';
    this.ctx.shadowBlur = 12;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.groundY);
    this.ctx.lineTo(this.internalWidth, this.groundY);
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;

    // Ground fill
    this.ctx.fillStyle = '#0b0e14';
    this.ctx.fillRect(0, this.groundY, this.internalWidth, this.internalHeight - this.groundY);

    this.ctx.save();
    this.ctx.translate(-this.cameraX, 0);

    // Obstacles
    for (const obs of this.obstacles) {
      if (obs.x + 120 < this.cameraX || obs.x - this.cameraX > this.internalWidth + 120) continue;

      if (obs.type === 'spike') {
        this.ctx.fillStyle = '#ff3366';
        this.ctx.shadowColor = '#ff3366';
        this.ctx.shadowBlur = 10;
        this.ctx.beginPath();
        this.ctx.moveTo(obs.x + obs.w / 2, obs.y - obs.h);
        this.ctx.lineTo(obs.x + obs.w, obs.y);
        this.ctx.lineTo(obs.x, obs.y);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      } else if (obs.type === 'pad') {
        this.ctx.fillStyle = '#ffea00';
        this.ctx.shadowColor = '#ffea00';
        this.ctx.shadowBlur = 14;
        this.ctx.beginPath();
        this.ctx.ellipse(obs.x + obs.w / 2, obs.y + obs.h / 2, obs.w / 2, obs.h / 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      } else if (obs.type === 'orb') {
        this.ctx.strokeStyle = obs.triggered ? '#555' : '#ffea00';
        this.ctx.shadowColor = obs.triggered ? 'transparent' : '#ffea00';
        this.ctx.shadowBlur = 16;
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.arc(obs.x, obs.y, obs.r, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.fillStyle = obs.triggered ? '#333' : 'rgba(255, 234, 0, 0.4)';
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      } else if (obs.type === 'block') {
        this.ctx.fillStyle = '#141a29';
        this.ctx.strokeStyle = '#00f0ff';
        this.ctx.lineWidth = 2;
        this.ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        this.ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
      }
    }

    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    this.ctx.globalAlpha = 1.0;

    // Player Cube
    if (this.player.alive) {
      this.ctx.save();
      this.ctx.translate(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2);
      this.ctx.rotate((this.player.rotation * Math.PI) / 180);

      this.ctx.shadowColor = '#00f0ff';
      this.ctx.shadowBlur = 18;
      this.ctx.fillStyle = '#00f0ff';
      this.ctx.fillRect(-this.player.w / 2, -this.player.h / 2, this.player.w, this.player.h);

      this.ctx.fillStyle = '#050608';
      this.ctx.fillRect(-this.player.w / 2 + 6, -this.player.h / 2 + 6, this.player.w - 12, this.player.h - 12);

      this.ctx.fillStyle = '#00ff88';
      this.ctx.fillRect(-6, -6, 12, 12);
      this.ctx.restore();
    }

    this.ctx.restore();
    this.ctx.restore();
  }

  loop(timestamp) {
    const frameTime = Math.min(timestamp - this.lastTime, 100); // Clamp to 100ms max to prevent spiral of death
    this.lastTime = timestamp;
    this.accumulator += frameTime;

    while (this.accumulator >= this.fixedDeltaTime) {
      this.fixedUpdate();
      this.accumulator -= this.fixedDeltaTime;
    }

    this.draw();
    requestAnimationFrame(this.loop);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.game = new CyberDashGame();
});
