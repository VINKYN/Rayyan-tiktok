// Physics, Patterns, and Canvas Renderer for Satisfying Ball Videos
// Featuring: Safe Spawns (No overlap), Emoji & Varied Bricks, Stable Camera (No shake),
// Large Lower HUD with Ball Colors, 5s Victory Countdown, and 22 Viral Patterns

export class PhysicsEngine {
  constructor(canvas, soundEngine) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.sound = soundEngine;

    // Simulation dimensions (Fixed 1080x1920 standard 9:16 for full TikTok HD)
    this.width = 1080;
    this.height = 1920;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Simulation states
    this.isRunning = true;
    this.animationId = null;
    this.lastTime = performance.now();

    // Time & TikTok Monetization (Default 65 seconds)
    this.timerDuration = 65;
    this.timeRemaining = 65;
    this.elapsedTime = 0;
    this.isFinished = false;
    this.finishStatus = 'playing'; // 'playing', 'escaped', 'cleared', 'timeout'

    // 5-second post-victory reading countdown
    this.victoryTimer = 5.0;
    this.victoryTriggered = false;
    this.onSimulationEnd = null; // callback when 5s victory countdown finishes

    // Game Mode & Ball Bets
    this.gameMode = 'duo'; // 'solo', 'duo', 'trio', 'quad', 'chaos'
    this.ballCount = 2;

    // Player Ball Colors & Names (English)
    this.playerConfigs = [
      { name: 'BLUE', color: '#00f0ff' },
      { name: 'RED', color: '#ff0055' },
      { name: 'YELLOW', color: '#ffe600' },
      { name: 'GREEN', color: '#00ff88' },
      { name: 'PURPLE', color: '#b967ff' },
      { name: 'ORANGE', color: '#ff7700' }
    ];

    // Hook & Stakes Overlays (English)
    this.hookTitle = "RED vs BLUE: WHICH BALL WILL WIN?";
    this.showTimer = false;
    this.showScoreboard = true;
    this.showProgressBar = true;
    this.showTikTokSafeZone = false;

    // Simulation Parameters
    this.patternType = 'concentric_rings';
    this.ballBaseSpeed = 16;
    this.ballRadius = 18;
    this.gravity = 0;
    this.speedUpOnHit = 0.015;
    this.maxSpeed = 36;

    // 22 Curated Visual Themes
    this.theme = 'cyberpunk';
    this.themes = {
      cyberpunk: { name: 'Cyberpunk Néon', bg: '#0a0a14', arenaBorder: '#2a2a44', palette: ['#ff007f', '#a000ff', '#00f0ff', '#00ff66', '#ffea00', '#ff5500'] },
      sunset_vapor: { name: 'Sunset Synthwave', bg: '#120d24', arenaBorder: '#3b2554', palette: ['#ff71ce', '#b967ff', '#01cdfe', '#05ffa1', '#fffb96'] },
      neon_matrix: { name: 'Matrix Émeraude', bg: '#050f08', arenaBorder: '#0d381e', palette: ['#00ff66', '#39ff14', '#76ff03', '#aeea00', '#64dd17'] },
      bubblegum: { name: 'Bubblegum Pop', bg: '#140c1b', arenaBorder: '#3f1f4d', palette: ['#ff2a85', '#f15bb5', '#fee440', '#00f5d4', '#9b5de5'] },
      deep_galaxy: { name: 'Galaxie Profonde', bg: '#070814', arenaBorder: '#232850', palette: ['#f72585', '#b5179e', '#7209b7', '#3f37c9', '#4cc9f0'] },
      lava_magma: { name: 'Lave & Magma', bg: '#160805', arenaBorder: '#4a150b', palette: ['#ff1e00', '#ff5500', '#ff8800', '#ffbb00', '#ffe600'] },
      ice_arctic: { name: 'Glace Arctique', bg: '#06101a', arenaBorder: '#163852', palette: ['#00f0ff', '#70e000', '#90e0ef', '#caf0f8', '#ffffff'] },
      royal_amethyst: { name: 'Améthyste Royale', bg: '#10081a', arenaBorder: '#321950', palette: ['#7b2cbf', '#9d4edd', '#c77dff', '#e0aaff', '#ffe600'] },
      tokyo_night: { name: 'Tokyo Night', bg: '#070a19', arenaBorder: '#1c2653', palette: ['#ff007f', '#7000ff', '#00e5ff', '#00ffaa', '#ffe600'] },
      enchanted_forest: { name: 'Forêt Enchantée', bg: '#05140d', arenaBorder: '#103d27', palette: ['#2ec4b6', '#cbf3f0', '#ff9f1c', '#2a9d8f', '#e76f51'] },
      pastel_dream: { name: 'Pêche & Pastel', bg: '#151320', arenaBorder: '#393355', palette: ['#f72585', '#7209b7', '#3a0ca3', '#4361ee', '#4cc9f0'] },
      luxury_gold: { name: 'Or Noir Luxe', bg: '#0c0a06', arenaBorder: '#3d3215', palette: ['#ffe600', '#d4af37', '#ffbe0b', '#fb5607', '#ffeedd'] },
      acid_lime: { name: 'Acid Toxic', bg: '#090f05', arenaBorder: '#273f10', palette: ['#ccff00', '#39ff14', '#00ffcc', '#ffff00', '#76ff03'] },
      miami_vice: { name: 'Miami Vice', bg: '#140c1b', arenaBorder: '#3b1c4b', palette: ['#f72585', '#7209b7', '#4cc9f0', '#f15bb5', '#fee440'] },
      ruby_crimson: { name: 'Rubis & Sangria', bg: '#16050a', arenaBorder: '#4a1020', palette: ['#e63946', '#f1faee', '#a8dadc', '#457b9d', '#1d3557'] },
      retro_arcade: { name: 'Rétro 80s Arcade', bg: '#0d0d18', arenaBorder: '#2d2d48', palette: ['#ff0055', '#00f0ff', '#ffe600', '#00ff66', '#ff00ff'] },
      aurora_borealis: { name: 'Aurore Boréale', bg: '#051016', arenaBorder: '#12384a', palette: ['#00f5d4', '#7b2cbf', '#00bbf9', '#fee440', '#f15bb5'] },
      minimal_mono: { name: 'Minimaliste Titanium', bg: '#0a0a0f', arenaBorder: '#30303f', palette: ['#ffffff', '#cbd5e1', '#94a3b8', '#64748b', '#00f0ff'] },
      cotton_candy: { name: 'Barbe à Papa', bg: '#130d1d', arenaBorder: '#3d2657', palette: ['#ffb7b2', '#ffdac1', '#e2f0cb', '#b5ead7', '#c7ceea'] },
      hyper_drive: { name: 'Hyper Vitesse', bg: '#080812', arenaBorder: '#262648', palette: ['#ff0055', '#ff9900', '#00f0ff', '#ffffff', '#7928ca'] },
      deep_abyss: { name: 'Abysses Océaniques', bg: '#040b14', arenaBorder: '#0e2b46', palette: ['#0077b6', '#0096c7', '#00b4d8', '#48cae4', '#90e0ef'] },
      desert_dusk: { name: 'Crépuscule Désertique', bg: '#160b08', arenaBorder: '#4d2417', palette: ['#f39a59', '#e76f51', '#f4a261', '#e9c46a', '#2a9d8f'] }
    };

    // Entities
    this.balls = [];
    this.bricks = [];
    this.particles = [];
    this.shockwaves = [];
    this.totalInitialBricks = 0;

    // Rotation angle
    this.rotationAngle = 0;
    this.rotationSpeed = 0.008;

    this.initSimulation();
  }

  setGameMode(mode) {
    this.gameMode = mode;
    switch (mode) {
      case 'solo':
        this.ballCount = 1;
        this.hookTitle = "CAN IT DESTROY 100% OF THE BRICKS?";
        break;
      case 'duo':
        this.ballCount = 2;
        this.hookTitle = "RED vs BLUE: WHICH BALL WILL WIN?";
        break;
      case 'trio':
        this.ballCount = 3;
        this.hookTitle = "BLUE vs RED vs YELLOW: WHO WILL WIN?";
        break;
      case 'quad':
        this.ballCount = 4;
        this.hookTitle = "4-WAY BATTLE: WHO WILL BE THE CHAMPION?";
        break;
      case 'chaos':
        this.ballCount = 6;
        this.hookTitle = "TOTAL CHAOS: WHICH BALL DESTROYS THE MOST?";
        break;
    }
    this.reset();
  }

  initSimulation() {
    this.timeRemaining = this.timerDuration;
    this.elapsedTime = 0;
    this.isFinished = false;
    this.victoryTriggered = false;
    this.victoryTimer = 5.0;
    this.finishStatus = 'playing';
    this.particles = [];
    this.shockwaves = [];
    this.rotationAngle = 0;

    // Configure gravity based on pattern
    const gravityPatterns = ['pachinko_drop', 'plinko_pyramid', 'gravity_well', 'hourglass'];
    if (gravityPatterns.includes(this.patternType)) {
      this.gravity = 0.16;
    } else {
      this.gravity = 0;
    }

    this.spawnBalls();
    this.buildPattern();
    this.clearSpawnZones();
  }

  // Define Safe Ball Spawn Locations (Never overlapping bricks!)
  spawnBalls() {
    this.balls = [];
    const centerX = this.width / 2;
    const centerY = this.height / 2 + 55;
    const isGravityMode = this.gravity > 0;

    for (let i = 0; i < this.ballCount; i++) {
      const cfg = this.playerConfigs[i % this.playerConfigs.length];
      let spawnX = centerX;
      let spawnY = centerY;
      let vx = 0;
      let vy = 0;
      const speed = this.ballBaseSpeed;

      if (isGravityMode) {
        // Gravity patterns: spawn at top in clear air
        const spread = (i - (this.ballCount - 1) / 2) * 80;
        spawnX = centerX + spread;
        spawnY = 270;
        vx = (Math.random() - 0.5) * 5;
        vy = speed * 0.7;
      } else if (this.patternType === 'concentric_rings') {
        // Concentric Rings: All balls spawn inside the completely empty center chamber (radius < 100)
        const angle = (i * Math.PI * 2) / this.ballCount + 0.4;
        const dist = this.ballCount > 1 ? 40 : 0;
        spawnX = centerX + Math.cos(angle) * dist;
        spawnY = centerY + Math.sin(angle) * dist;
        vx = Math.cos(angle + 0.6) * speed;
        vy = Math.sin(angle + 0.6) * speed;
      } else {
        if (this.ballCount === 1) {
          spawnX = centerX;
          spawnY = centerY;
          const angle = Math.random() * Math.PI * 2;
          vx = Math.cos(angle) * speed;
          vy = Math.sin(angle) * speed;
        } else if (this.ballCount === 2) {
          // Duo: Ball 1 starts top-center, Ball 2 starts bottom-center
          spawnX = centerX;
          spawnY = i === 0 ? 330 : this.height - 290;
          const angle = i === 0 ? 0.75 : -0.75;
          vx = (i === 0 ? 1 : -1) * Math.cos(angle) * speed;
          vy = Math.sin(angle) * speed;
        } else if (this.ballCount === 3) {
          if (i === 0) {
            spawnX = centerX;
            spawnY = 320;
            vx = speed * 0.7;
            vy = speed * 0.7;
          } else if (i === 1) {
            spawnX = centerX - 260;
            spawnY = this.height - 290;
            vx = speed * 0.8;
            vy = -speed * 0.6;
          } else {
            spawnX = centerX + 260;
            spawnY = this.height - 290;
            vx = -speed * 0.8;
            vy = -speed * 0.6;
          }
        } else if (this.ballCount === 4) {
          const margin = 160;
          const corners = [
            { x: margin, y: 340, vx: speed * 0.7, vy: speed * 0.7 },
            { x: this.width - margin, y: 340, vx: -speed * 0.7, vy: speed * 0.7 },
            { x: margin, y: this.height - 300, vx: speed * 0.7, vy: -speed * 0.7 },
            { x: this.width - margin, y: this.height - 300, vx: -speed * 0.7, vy: -speed * 0.7 }
          ];
          const c = corners[i];
          spawnX = c.x;
          spawnY = c.y;
          vx = c.vx;
          vy = c.vy;
        } else {
          const angle = (i * Math.PI * 2) / this.ballCount;
          spawnX = centerX + Math.cos(angle) * 160;
          spawnY = centerY + Math.sin(angle) * 160;
          vx = Math.cos(angle + 0.5) * speed;
          vy = Math.sin(angle + 0.5) * speed;
        }
      }

      this.balls.push({
        id: i,
        name: cfg.name,
        color: cfg.color,
        x: spawnX,
        y: spawnY,
        vx,
        vy,
        radius: this.ballRadius,
        trail: [],
        score: 0,
        escaped: false
      });
    }
  }

  // Clear 85px safe radius around all ball spawns to NEVER spawn on a brick!
  clearSpawnZones() {
    const safeRadius = 85;
    this.bricks = this.bricks.filter(brick => {
      for (const ball of this.balls) {
        let bx = brick.x;
        let by = brick.y;
        if (brick.type === 'arc') {
          // Arc center to ball
          const dx = ball.x - brick.centerX;
          const dy = ball.y - brick.centerY;
          const dist = Math.hypot(dx, dy);
          if (Math.abs(dist - brick.radius) < safeRadius) {
            let angle = Math.atan2(dy, dx);
            if (angle < 0) angle += Math.PI * 2;
            if (angle >= brick.startAngle - 0.2 && angle <= brick.endAngle + 0.2) {
              return false;
            }
          }
        } else {
          if (Math.hypot(bx - ball.x, by - ball.y) < safeRadius) {
            return false;
          }
        }
      }
      return true;
    });
    this.totalInitialBricks = this.bricks.length;
  }

  buildPattern() {
    this.bricks = [];
    const centerX = this.width / 2;
    const centerY = this.height / 2 + 55;
    const colors = this.themes[this.theme].palette;

    switch (this.patternType) {
      // 1. Concentric Rings
      case 'concentric_rings': {
        const ringCount = 5;
        const baseRadius = 140;
        const ringStep = 75;
        const brickHeight = 24;

        for (let r = 0; r < ringCount; r++) {
          const radius = baseRadius + r * ringStep;
          const segments = 14 + r * 6;
          const angleStep = (Math.PI * 2) / segments;
          const color = colors[r % colors.length];

          for (let s = 0; s < segments; s++) {
            const startAngle = s * angleStep + 0.04;
            const endAngle = (s + 1) * angleStep - 0.04;

            this.bricks.push({
              type: 'arc',
              centerX,
              centerY,
              radius,
              thickness: brickHeight,
              startAngle,
              endAngle,
              color,
              hp: 1,
              id: `arc-${r}-${s}`
            });
          }
        }
        break;
      }

      // 2. Neon Matrix with Emojis & Rounded Gems
      case 'brick_matrix': {
        const cols = 11;
        const rows = 14;
        const brickW = 72;
        const brickH = 36;
        const gap = 12;
        const totalW = cols * (brickW + gap) - gap;
        const totalH = rows * (brickH + gap) - gap;
        const startX = centerX - totalW / 2;
        const startY = centerY - totalH / 2;

        for (let r = 0; r < rows; r++) {
          const color = colors[r % colors.length];
          for (let c = 0; c < cols; c++) {
            const dx = Math.abs(c - (cols - 1) / 2) / (cols / 2);
            const dy = Math.abs(r - (rows - 1) / 2) / (rows / 2);
            if (dx * dx + dy * dy > 0.92 && (r === 0 || r === rows - 1)) continue;

            const bx = startX + c * (brickW + gap);
            const by = startY + r * (brickH + gap);
            this.bricks.push({
              type: 'rect',
              x: bx,
              y: by,
              w: brickW,
              h: brickH,
              color,
              hp: 1,
              id: `rect-${r}-${c}`
            });
          }
        }
        break;
      }

      // 3. Pachinko Drop (Gravity drop with pegs)
      case 'pachinko_drop': {
        const rows = 12;
        const spacingX = 78;
        const spacingY = 74;
        const startY = 410;

        for (let r = 0; r < rows; r++) {
          const cols = r % 2 === 0 ? 10 : 9;
          const rowW = cols * spacingX;
          const startX = centerX - rowW / 2 + spacingX / 2;
          const color = colors[r % colors.length];

          for (let c = 0; c < cols; c++) {
            this.bricks.push({
              type: 'circle',
              x: startX + c * spacingX,
              y: startY + r * spacingY,
              radius: 18,
              color,
              hp: 1,
              id: `pachinko-${r}-${c}`
            });
          }
        }
        break;
      }

      // 4. Hourglass (Le Sablier du Destin)
      case 'hourglass': {
        const layers = 10;
        for (let l = 0; l < layers; l++) {
          const t = l / (layers - 1);
          const widthFactor = Math.abs(t - 0.5) * 2;
          const count = Math.max(3, Math.round(widthFactor * 10));
          const y = centerY - 360 + l * 78;
          const color = colors[l % colors.length];

          for (let i = 0; i < count; i++) {
            const span = 420 * Math.max(0.28, widthFactor);
            const x = centerX - span / 2 + (i / (count - 1 || 1)) * span;
            this.bricks.push({
              type: 'rect',
              x: x - 28,
              y: y - 16,
              w: 56,
              h: 30,
              color,
              hp: 1,
              id: `hg-${l}-${i}`
            });
          }
        }
        break;
      }

      // 5. Rotating Hexagon
      case 'rotating_hexagon': {
        const layers = 4;
        const baseSize = 160;
        const stepSize = 85;
        const sides = 6;

        for (let l = 0; l < layers; l++) {
          const size = baseSize + l * stepSize;
          const color = colors[l % colors.length];
          const segmentsPerSide = 3 + l;

          for (let side = 0; side < sides; side++) {
            const angle1 = (side * Math.PI * 2) / sides;
            const angle2 = ((side + 1) * Math.PI * 2) / sides;

            const p1 = { x: Math.cos(angle1) * size, y: Math.sin(angle1) * size };
            const p2 = { x: Math.cos(angle2) * size, y: Math.sin(angle2) * size };

            for (let seg = 0; seg < segmentsPerSide; seg++) {
              const t1 = seg / segmentsPerSide;
              const t2 = (seg + 0.9) / segmentsPerSide;

              const ax = p1.x + (p2.x - p1.x) * t1;
              const ay = p1.y + (p2.y - p1.y) * t1;
              const bx = p1.x + (p2.x - p1.x) * t2;
              const by = p1.y + (p2.y - p1.y) * t2;

              this.bricks.push({
                type: 'segment',
                centerX,
                centerY,
                p1: { x: ax, y: ay },
                p2: { x: bx, y: by },
                thickness: 18,
                color,
                hp: 1,
                id: `poly-${l}-${side}-${seg}`
              });
            }
          }
        }
        break;
      }

      // 6. Cosmic Spiral with Stars
      case 'cosmic_spiral': {
        const totalBlocks = 90;
        const a = 100;
        const b = 5.5;
        for (let i = 0; i < totalBlocks; i++) {
          const theta = 0.2 * i;
          const r = a + b * theta * 5;
          const bx = centerX + Math.cos(theta) * r;
          const by = centerY + Math.sin(theta) * r;
          const color = colors[Math.floor(i / 12) % colors.length];
          this.bricks.push({
            type: 'circle',
            x: bx,
            y: by,
            radius: 18,
            color,
            hp: 1,
            id: `spiral-${i}`
          });
        }
        break;
      }

      // 7. Bullseye Target
      case 'bullseye_target': {
        const rings = [110, 190, 270, 350, 430];
        rings.forEach((r, idx) => {
          const count = 8 + idx * 6;
          const step = (Math.PI * 2) / count;
          const color = colors[idx % colors.length];
          for (let s = 0; s < count; s++) {
            this.bricks.push({
              type: 'arc',
              centerX,
              centerY,
              radius: r,
              thickness: 22,
              startAngle: s * step + 0.05,
              endAngle: (s + 1) * step - 0.05,
              color,
              hp: 1,
              id: `target-${idx}-${s}`
            });
          }
        });
        break;
      }

      // 8. Heart Breaker
      case 'heart_breaker': {
        const scale = 24;
        const steps = 54;
        for (let i = 0; i < steps; i++) {
          const t = (i / steps) * Math.PI * 2;
          const hx = 16 * Math.pow(Math.sin(t), 3);
          const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

          [1.0, 0.65].forEach((mult, mIdx) => {
            const bx = centerX + hx * scale * mult;
            const by = centerY + hy * scale * mult;
            const color = colors[(i + mIdx * 2) % colors.length];
            this.bricks.push({
              type: 'circle',
              x: bx,
              y: by,
              radius: 17,
              color,
              hp: 1,
              id: `heart-${mIdx}-${i}`
            });
          });
        }
        break;
      }

      // 9. Diamond Arena (Losange)
      case 'diamond_arena': {
        const rings = 4;
        for (let ring = 1; ring <= rings; ring++) {
          const size = ring * 105;
          const countPerSide = 3 + ring;
          const color = colors[ring % colors.length];
          const corners = [
            { x: 0, y: -size },
            { x: size, y: 0 },
            { x: 0, y: size },
            { x: -size, y: 0 }
          ];

          for (let c = 0; c < 4; c++) {
            const p1 = corners[c];
            const p2 = corners[(c + 1) % 4];
            for (let k = 0; k < countPerSide; k++) {
              const u = k / countPerSide;
              const bx = centerX + p1.x + (p2.x - p1.x) * u;
              const by = centerY + p1.y + (p2.y - p1.y) * u;
              this.bricks.push({
                type: 'rect',
                x: bx - 24,
                y: by - 14,
                w: 48,
                h: 26,
                color,
                hp: 1,
                id: `diam-${ring}-${c}-${k}`
              });
            }
          }
        }
        break;
      }

      // 10. Pyramid & Chute
      case 'pyramid_chute': {
        const tiers = 11;
        const brickW = 60;
        const brickH = 30;
        const gap = 12;
        const startY = centerY - 320;

        for (let t = 0; t < tiers; t++) {
          const count = t + 2;
          const rowW = count * (brickW + gap) - gap;
          const startX = centerX - rowW / 2;
          const color = colors[t % colors.length];

          for (let b = 0; b < count; b++) {
            this.bricks.push({
              type: 'rect',
              x: startX + b * (brickW + gap),
              y: startY + t * (brickH + gap),
              w: brickW,
              h: brickH,
              color,
              hp: 1,
              id: `pyr-${t}-${b}`
            });
          }
        }
        break;
      }

      // 11. Yin Yang Arena
      case 'yin_yang': {
        const R = 380;
        const halfR = R / 2;
        for (let i = 0; i < 32; i++) {
          const a = (i / 32) * Math.PI * 2;
          this.bricks.push({
            type: 'circle',
            x: centerX + Math.cos(a) * R,
            y: centerY + Math.sin(a) * R,
            radius: 17,
            color: colors[i % colors.length],
            hp: 1,
            id: `yy-rim-${i}`
          });
        }
        for (let i = 0; i < 20; i++) {
          const a = (i / 20) * Math.PI;
          this.bricks.push({
            type: 'circle',
            x: centerX + Math.cos(a) * halfR,
            y: centerY - halfR + Math.sin(a) * halfR,
            radius: 15,
            color: colors[0],
            hp: 1,
            id: `yy-top-${i}`
          });
          this.bricks.push({
            type: 'circle',
            x: centerX - Math.cos(a) * halfR,
            y: centerY + halfR - Math.sin(a) * halfR,
            radius: 15,
            color: colors[1 % colors.length],
            hp: 1,
            id: `yy-bot-${i}`
          });
        }
        break;
      }

      // 12. Castle Fortress with Fire
      case 'castle_fortress': {
        const rows = 12;
        const cols = 10;
        const brickW = 72;
        const brickH = 34;
        const gap = 12;
        const startX = centerX - (cols * (brickW + gap)) / 2;
        const startY = centerY - 320;

        for (let r = 0; r < rows; r++) {
          const color = colors[r % colors.length];
          for (let c = 0; c < cols; c++) {
            if (r > 6 && (c === 4 || c === 5)) continue;
            if (r === 0 && c % 2 === 1) continue;

            this.bricks.push({
              type: 'rect',
              x: startX + c * (brickW + gap),
              y: startY + r * (brickH + gap),
              w: brickW,
              h: brickH,
              color,
              hp: 1,
              id: `castle-${r}-${c}`
            });
          }
        }
        break;
      }

      // 13. Cross Roads (4 Piliers)
      case 'cross_roads': {
        const armLen = 8;
        const brickW = 58;
        const brickH = 32;
        const gap = 10;

        for (let i = -armLen; i <= armLen; i++) {
          const color = colors[Math.abs(i) % colors.length];
          [-1, 0, 1].forEach(row => {
            this.bricks.push({
              type: 'rect',
              x: centerX + i * (brickW + gap) - brickW / 2,
              y: centerY + row * (brickH + gap) - brickH / 2,
              w: brickW,
              h: brickH,
              color,
              hp: 1,
              id: `cross-h-${i}-${row}`
            });
          });
        }
        for (let j = -armLen; j <= armLen; j++) {
          if (Math.abs(j) <= 1) continue;
          const color = colors[Math.abs(j) % colors.length];
          [-1, 0, 1].forEach(col => {
            this.bricks.push({
              type: 'rect',
              x: centerX + col * (brickW + gap) - brickW / 2,
              y: centerY + j * (brickH + gap) - brickH / 2,
              w: brickW,
              h: brickH,
              color,
              hp: 1,
              id: `cross-v-${j}-${col}`
            });
          });
        }
        break;
      }

      // 14. Plinko Pyramid with Lucky Clovers
      case 'plinko_pyramid': {
        const rows = 11;
        const startY = 380;
        const gapY = 72;
        const gapX = 74;

        for (let r = 0; r < rows; r++) {
          const count = r + 2;
          const rowW = (count - 1) * gapX;
          const startX = centerX - rowW / 2;
          const color = colors[r % colors.length];

          for (let c = 0; c < count; c++) {
            this.bricks.push({
              type: 'circle',
              x: startX + c * gapX,
              y: startY + r * gapY,
              radius: 17,
              color,
              hp: 1,
              id: `plinko-${r}-${c}`
            });
          }
        }
        break;
      }

      // 15. Gravity Well (Chute Gravitationnelle)
      case 'gravity_well': {
        const platforms = 9;
        const platH = 28;
        const startY = 400;
        const stepY = 85;

        for (let p = 0; p < platforms; p++) {
          const isLeft = p % 2 === 0;
          const x = isLeft ? centerX - 240 : centerX - 40;
          const y = startY + p * stepY;
          const color = colors[p % colors.length];

          for (let b = 0; b < 4; b++) {
            this.bricks.push({
              type: 'rect',
              x: x + b * 70,
              y,
              w: 62,
              h: platH,
              color,
              hp: 1,
              id: `gw-${p}-${b}`
            });
          }
        }
        break;
      }

      // 16. Double Vortex
      case 'double_vortex': {
        const centers = [
          { x: centerX, y: centerY - 180 },
          { x: centerX, y: centerY + 180 }
        ];
        centers.forEach((c, cIdx) => {
          [100, 180, 240].forEach((rad, rIdx) => {
            const count = 12 + rIdx * 6;
            const step = (Math.PI * 2) / count;
            const color = colors[(cIdx * 3 + rIdx) % colors.length];
            for (let s = 0; s < count; s++) {
              this.bricks.push({
                type: 'arc',
                centerX: c.x,
                centerY: c.y,
                radius: rad,
                thickness: 20,
                startAngle: s * step + 0.05,
                endAngle: (s + 1) * step - 0.05,
                color,
                hp: 1,
                id: `vortex-${cIdx}-${rIdx}-${s}`
              });
            }
          });
        });
        break;
      }

      // 17. Star Galaxy (8-Pointed Star)
      case 'star_galaxy': {
        const points = 8;
        const rOuter = 400;
        const rInner = 180;
        for (let p = 0; p < points * 2; p++) {
          const angle = (p * Math.PI) / points;
          const r = p % 2 === 0 ? rOuter : rInner;
          const nextAngle = ((p + 1) * Math.PI) / points;
          const nextR = (p + 1) % 2 === 0 ? rOuter : rInner;

          const p1x = Math.cos(angle) * r;
          const p1y = Math.sin(angle) * r;
          const p2x = Math.cos(nextAngle) * nextR;
          const p2y = Math.sin(nextAngle) * nextR;

          for (let seg = 0; seg < 4; seg++) {
            const u = seg / 4;
            const bx = centerX + p1x + (p2x - p1x) * u;
            const by = centerY + p1y + (p2y - p1y) * u;
            const color = colors[p % colors.length];
            this.bricks.push({
              type: 'circle',
              x: bx,
              y: by,
              radius: 16,
              color,
              hp: 1,
              id: `star-${p}-${seg}`
            });
          }
        }
        break;
      }

      // 18. Ocean Waves
      case 'ocean_waves': {
        const waveRows = 8;
        const blocksPerRow = 14;
        const startY = centerY - 320;

        for (let w = 0; w < waveRows; w++) {
          const color = colors[w % colors.length];
          const rowY = startY + w * 85;

          for (let b = 0; b < blocksPerRow; b++) {
            const u = (b / (blocksPerRow - 1)) * Math.PI * 2;
            const bx = 120 + (b * (this.width - 240)) / (blocksPerRow - 1);
            const by = rowY + Math.sin(u + w * 0.8) * 45;

            this.bricks.push({
              type: 'rect',
              x: bx - 26,
              y: by - 14,
              w: 52,
              h: 28,
              color,
              hp: 1,
              id: `wave-${w}-${b}`
            });
          }
        }
        break;
      }

      // 19. Donut Torus
      case 'donut_torus': {
        const radii = [200, 280, 360];
        radii.forEach((rad, rIdx) => {
          const count = 18 + rIdx * 8;
          const step = (Math.PI * 2) / count;
          const color = colors[rIdx % colors.length];
          for (let i = 0; i < count; i++) {
            this.bricks.push({
              type: 'circle',
              x: centerX + Math.cos(i * step) * rad,
              y: centerY + Math.sin(i * step) * rad,
              radius: 17,
              color,
              hp: 1,
              id: `donut-${rIdx}-${i}`
            });
          }
        });
        break;
      }

      // 20. Floating Islands
      case 'floating_islands': {
        const islands = [
          { x: centerX - 220, y: centerY - 200, r: 85 },
          { x: centerX + 220, y: centerY - 200, r: 85 },
          { x: centerX, y: centerY, r: 120 },
          { x: centerX - 220, y: centerY + 200, r: 85 },
          { x: centerX + 220, y: centerY + 200, r: 85 }
        ];

        islands.forEach((isl, iIdx) => {
          const count = iIdx === 2 ? 18 : 12;
          const color = colors[iIdx % colors.length];
          for (let k = 0; k < count; k++) {
            const a = (k / count) * Math.PI * 2;
            this.bricks.push({
              type: 'circle',
              x: isl.x + Math.cos(a) * isl.r,
              y: isl.y + Math.sin(a) * isl.r,
              radius: 18,
              color,
              hp: 1,
              id: `island-${iIdx}-${k}`
            });
          }
        });
        break;
      }

      // 21. Pinball Bumpers
      case 'pinball_bumper': {
        const bumpers = [
          { x: centerX - 180, y: centerY - 140 },
          { x: centerX + 180, y: centerY - 140 },
          { x: centerX, y: centerY + 80 },
          { x: centerX - 200, y: centerY + 240 },
          { x: centerX + 200, y: centerY + 240 }
        ];
        bumpers.forEach((b, idx) => {
          const color = colors[idx % colors.length];
          for (let s = 0; s < 10; s++) {
            const a = (s / 10) * Math.PI * 2;
            this.bricks.push({
              type: 'circle',
              x: b.x + Math.cos(a) * 60,
              y: b.y + Math.sin(a) * 60,
              radius: 16,
              color,
              hp: 1,
              id: `pinball-${idx}-${s}`
            });
          }
        });
        break;
      }

      // 22. Octagon Cage
      case 'octagon_cage':
      default: {
        const layers = 3;
        const baseSize = 220;
        const stepSize = 95;
        const sides = 8;

        for (let l = 0; l < layers; l++) {
          const size = baseSize + l * stepSize;
          const color = colors[l % colors.length];
          const segCount = 4 + l;

          for (let side = 0; side < sides; side++) {
            const angle1 = (side * Math.PI * 2) / sides;
            const angle2 = ((side + 1) * Math.PI * 2) / sides;

            const p1 = { x: Math.cos(angle1) * size, y: Math.sin(angle1) * size };
            const p2 = { x: Math.cos(angle2) * size, y: Math.sin(angle2) * size };

            for (let seg = 0; seg < segCount; seg++) {
              const t1 = seg / segCount;
              const t2 = (seg + 0.9) / segCount;
              const ax = p1.x + (p2.x - p1.x) * t1;
              const ay = p1.y + (p2.y - p1.y) * t1;
              const bx = p1.x + (p2.x - p1.x) * t2;
              const by = p1.y + (p2.y - p1.y) * t2;

              this.bricks.push({
                type: 'segment',
                centerX,
                centerY,
                p1: { x: ax, y: ay },
                p2: { x: bx, y: by },
                thickness: 18,
                color,
                hp: 1,
                id: `octo-${l}-${side}-${seg}`
              });
            }
          }
        }
        break;
      }
    }

    this.totalInitialBricks = this.bricks.length;
  }

  update(dt) {
    if (!this.isRunning) return;

    // Post-Victory 5-second countdown!
    if (this.victoryTriggered) {
      this.victoryTimer -= dt;

      // Animate celebration fireworks
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx * 60 * dt;
        p.y += p.vy * 60 * dt;
        p.vy += 0.25 * 60 * dt;
        p.life -= dt * 1.2;
        p.size = Math.max(0, p.size - dt * 2.0);
        if (p.life <= 0 || p.size <= 0) {
          this.particles.splice(i, 1);
        }
      }

      // If 5 seconds finished, officially end simulation and stop recording!
      if (this.victoryTimer <= 0) {
        this.victoryTimer = 0;
        this.isRunning = false;
        if (this.onSimulationEnd) {
          this.onSimulationEnd();
        }
      }
      return;
    }

    // Track elapsed simulation time
    this.elapsedTime += dt;

    // Rotating patterns rotation update
    this.rotationAngle += this.rotationSpeed;

    // Arena Bounds
    const arenaMargin = 30;
    const arenaTop = 250;
    const arenaBottom = this.height - 180;
    const arenaLeft = arenaMargin;
    const arenaRight = this.width - arenaMargin;

    // Update Balls
    for (const ball of this.balls) {
      ball.vy += this.gravity * 60 * dt;
      ball.x += ball.vx * 60 * dt;
      ball.y += ball.vy * 60 * dt;

      ball.trail.push({ x: ball.x, y: ball.y });
      if (ball.trail.length > 18) {
        ball.trail.shift();
      }

      // Arena Wall Collisions (with slight anti-deadlock perturbation)
      if (ball.x - ball.radius < arenaLeft) {
        ball.x = arenaLeft + ball.radius;
        ball.vx = -ball.vx;
        ball.vy += (Math.random() - 0.5) * 0.2;
        this.onWallHit(ball.x, ball.y, ball.color);
      } else if (ball.x + ball.radius > arenaRight) {
        ball.x = arenaRight - ball.radius;
        ball.vx = -ball.vx;
        ball.vy += (Math.random() - 0.5) * 0.2;
        this.onWallHit(ball.x, ball.y, ball.color);
      }

      if (ball.y - ball.radius < arenaTop) {
        ball.y = arenaTop + ball.radius;
        ball.vy = -ball.vy;
        ball.vx += (Math.random() - 0.5) * 0.2;
        this.onWallHit(ball.x, ball.y, ball.color);
      } else if (ball.y + ball.radius > arenaBottom) {
        ball.y = arenaBottom - ball.radius;
        if (this.gravity > 0) {
          ball.vy = -Math.abs(ball.vy) * 0.95 - 4;
        } else {
          ball.vy = -ball.vy;
        }
        ball.vx += (Math.random() - 0.5) * 0.2;
        this.onWallHit(ball.x, ball.y, ball.color);
      }

      // Check Brick Collisions
      this.checkBrickCollisions(ball);
    }

    // Check if all bricks cleared -> Immediate winner decided! (Video ends only when all bricks are broken!)
    if (this.bricks.length === 0 && !this.victoryTriggered) {
      this.triggerVictory('cleared');
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * 60 * dt;
      p.y += p.vy * 60 * dt;
      p.vy += 0.2 * 60 * dt;
      p.life -= dt * 2.2;
      p.size = Math.max(0, p.size - dt * 4);
      if (p.life <= 0 || p.size <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += sw.speed * 60 * dt;
      sw.alpha -= dt * 2.5;
      if (sw.alpha <= 0) {
        this.shockwaves.splice(i, 1);
      }
    }
  }

  checkBrickCollisions(ball) {
    for (let i = this.bricks.length - 1; i >= 0; i--) {
      const brick = this.bricks[i];
      let collided = false;
      let normal = { x: 0, y: 0 };
      let hitX = ball.x;
      let hitY = ball.y;

      if (brick.type === 'arc') {
        const dx = ball.x - brick.centerX;
        const dy = ball.y - brick.centerY;
        const dist = Math.hypot(dx, dy);
        const halfThick = brick.thickness / 2;

        if (dist >= brick.radius - halfThick - ball.radius && dist <= brick.radius + halfThick + ball.radius) {
          let angle = Math.atan2(dy, dx);
          if (angle < 0) angle += Math.PI * 2;

          let inArc = false;
          if (brick.startAngle <= brick.endAngle) {
            inArc = angle >= brick.startAngle && angle <= brick.endAngle;
          } else {
            inArc = angle >= brick.startAngle || angle <= brick.endAngle;
          }

          if (inArc) {
            collided = true;
            const distToInner = Math.abs(dist - (brick.radius - halfThick));
            const distToOuter = Math.abs(dist - (brick.radius + halfThick));
            if (distToInner < distToOuter) {
              normal = { x: -dx / dist, y: -dy / dist };
            } else {
              normal = { x: dx / dist, y: dy / dist };
            }
            hitX = brick.centerX + Math.cos(angle) * brick.radius;
            hitY = brick.centerY + Math.sin(angle) * brick.radius;
          }
        }
      } else if (brick.type === 'rect') {
        const nearestX = Math.max(brick.x, Math.min(ball.x, brick.x + brick.w));
        const nearestY = Math.max(brick.y, Math.min(ball.y, brick.y + brick.h));
        const deltaX = ball.x - nearestX;
        const deltaY = ball.y - nearestY;
        const distSq = deltaX * deltaX + deltaY * deltaY;

        if (distSq < ball.radius * ball.radius) {
          collided = true;
          const dist = Math.sqrt(distSq) || 0.001;
          normal = { x: deltaX / dist, y: deltaY / dist };
          hitX = nearestX;
          hitY = nearestY;
        }
      } else if (brick.type === 'segment') {
        const cosR = Math.cos(this.rotationAngle);
        const sinR = Math.sin(this.rotationAngle);

        const p1x = brick.centerX + (brick.p1.x * cosR - brick.p1.y * sinR);
        const p1y = brick.centerY + (brick.p1.x * sinR + brick.p1.y * cosR);
        const p2x = brick.centerX + (brick.p2.x * cosR - brick.p2.y * sinR);
        const p2y = brick.centerY + (brick.p2.x * sinR + brick.p2.y * cosR);

        const lineLenSq = (p2x - p1x) ** 2 + (p2y - p1y) ** 2;
        let t = ((ball.x - p1x) * (p2x - p1x) + (ball.y - p1y) * (p2y - p1y)) / (lineLenSq || 1);
        t = Math.max(0, Math.min(1, t));

        const projX = p1x + t * (p2x - p1x);
        const projY = p1y + t * (p2y - p1y);
        const dist = Math.hypot(ball.x - projX, ball.y - projY);

        if (dist < ball.radius + brick.thickness / 2) {
          collided = true;
          const normDist = dist || 0.001;
          normal = { x: (ball.x - projX) / normDist, y: (ball.y - projY) / normDist };
          hitX = projX;
          hitY = projY;
        }
      } else if (brick.type === 'circle') {
        const bRad = brick.radius || 20;
        const dx = ball.x - brick.x;
        const dy = ball.y - brick.y;
        const dist = Math.hypot(dx, dy);
        if (dist < ball.radius + bRad) {
          collided = true;
          const normDist = dist || 0.001;
          normal = { x: dx / normDist, y: dy / normDist };
          hitX = brick.x;
          hitY = brick.y;
        }
      }

      if (collided) {
        const dot = ball.vx * normal.x + ball.vy * normal.y;
        if (dot < 0) {
          ball.vx = ball.vx - 2 * dot * normal.x;
          ball.vy = ball.vy - 2 * dot * normal.y;

          const currentSpeed = Math.hypot(ball.vx, ball.vy);
          const newSpeed = Math.min(this.maxSpeed, currentSpeed * (1 + this.speedUpOnHit));
          const factor = newSpeed / (currentSpeed || 1);
          ball.vx *= factor;
          ball.vy *= factor;
        }

        brick.hp -= 1;
        const destroyed = brick.hp <= 0;

        if (destroyed) {
          ball.score += 1;
          this.bricks.splice(i, 1);
        }

        this.onBrickHit(hitX, hitY, brick.color, destroyed);
        break;
      }
    }
  }

  onWallHit(x, y, color) {
    this.sound.playBounce(0.8, false);
    this.createShockwave(x, y, color, 25);
  }

  // NO SCREEN SHAKE! Perfectly stable camera
  onBrickHit(x, y, color, destroyed) {
    this.sound.playBounce(destroyed ? 1.0 : 0.7, destroyed);
    this.createParticles(x, y, color, destroyed ? 14 : 6);
    this.createShockwave(x, y, color, destroyed ? 40 : 20);
  }

  createParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 7 + 4,
        color,
        life: 1.0
      });
    }
  }

  createShockwave(x, y, color, maxRadius) {
    this.shockwaves.push({
      x,
      y,
      radius: 4,
      maxRadius,
      speed: 4,
      color,
      alpha: 0.9
    });
  }

  // Trigger victory state and start 5-second reading timer
  triggerVictory(status) {
    if (this.victoryTriggered) return;
    this.victoryTriggered = true;
    this.isFinished = true;
    this.victoryTimer = 5.0; // Wait exactly 5 seconds for viewers to read who won!
    this.finishStatus = status;
    this.sound.playVictory();

    const cx = this.width / 2;
    const cy = this.height / 2;
    const colors = this.themes[this.theme].palette;
    for (let i = 0; i < 90; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 18 + 5;
      this.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        size: Math.random() * 10 + 5,
        color: colors[i % colors.length],
        life: 3.5
      });
    }
  }

  draw() {
    const ctx = this.ctx;
    const theme = this.themes[this.theme];

    // NO Screen Shake: 100% stable camera
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, this.width, this.height);

    this.drawBackgroundGrid(ctx);
    this.drawArenaFrame(ctx, theme);
    this.drawShockwaves(ctx);
    this.drawBricks(ctx);
    this.drawParticles(ctx);
    this.drawBalls(ctx);

    // HUD Overlays
    this.drawOverlays(ctx, theme);
  }

  drawBackgroundGrid(ctx) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
    ctx.lineWidth = 1;
    const step = 60;
    for (let x = 0; x < this.width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawArenaFrame(ctx, theme) {
    ctx.save();
    const margin = 30;
    const top = 250; // Clean top margin
    const bottom = this.height - 180;
    const w = this.width - margin * 2;
    const h = bottom - top;

    ctx.strokeStyle = theme.arenaBorder;
    ctx.lineWidth = 4;
    ctx.shadowColor = theme.arenaBorder;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.roundRect(margin, top, w, h, 28);
    ctx.stroke();
    ctx.restore();
  }

  drawBricks(ctx) {
    ctx.save();
    for (const brick of this.bricks) {
      ctx.fillStyle = brick.color;
      ctx.strokeStyle = '#ffffff';
      ctx.shadowColor = brick.color;
      ctx.shadowBlur = 14;

      if (brick.type === 'arc') {
        ctx.beginPath();
        const halfThick = brick.thickness / 2;
        ctx.arc(brick.centerX, brick.centerY, brick.radius + halfThick, brick.startAngle, brick.endAngle, false);
        ctx.arc(brick.centerX, brick.centerY, brick.radius - halfThick, brick.endAngle, brick.startAngle, true);
        ctx.closePath();
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (brick.type === 'rect') {
        ctx.beginPath();
        ctx.roundRect(brick.x, brick.y, brick.w, brick.h, 8);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (brick.type === 'segment') {
        const cosR = Math.cos(this.rotationAngle);
        const sinR = Math.sin(this.rotationAngle);

        const p1x = brick.centerX + (brick.p1.x * cosR - brick.p1.y * sinR);
        const p1y = brick.centerY + (brick.p1.x * sinR + brick.p1.y * cosR);
        const p2x = brick.centerX + (brick.p2.x * cosR - brick.p2.y * sinR);
        const p2y = brick.centerY + (brick.p2.x * sinR + brick.p2.y * cosR);

        ctx.lineWidth = brick.thickness;
        ctx.lineCap = 'round';
        ctx.strokeStyle = brick.color;
        ctx.beginPath();
        ctx.moveTo(p1x, p1y);
        ctx.lineTo(p2x, p2y);
        ctx.stroke();
      } else if (brick.type === 'circle') {
        ctx.beginPath();
        ctx.arc(brick.x, brick.y, brick.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  drawBalls(ctx) {
    ctx.save();
    for (const ball of this.balls) {
      if (ball.trail.length > 1) {
        for (let i = 0; i < ball.trail.length - 1; i++) {
          const p1 = ball.trail[i];
          const p2 = ball.trail[i + 1];
          const ratio = (i + 1) / ball.trail.length;

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = ball.color;
          ctx.lineWidth = ball.radius * 1.6 * ratio;
          ctx.globalAlpha = ratio * 0.45;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1.0;
      ctx.shadowColor = ball.color;
      ctx.shadowBlur = 24;

      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = ball.color;
      ctx.fill();

      // Shiny highlight
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(ball.x - ball.radius * 0.3, ball.y - ball.radius * 0.3, ball.radius * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.fill();
    }
    ctx.restore();
  }

  drawParticles(ctx) {
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawShockwaves(ctx) {
    ctx.save();
    for (const sw of this.shockwaves) {
      ctx.globalAlpha = Math.max(0, sw.alpha);
      ctx.strokeStyle = sw.color;
      ctx.shadowColor = sw.color;
      ctx.shadowBlur = 15;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawOverlays(ctx, theme) {
    ctx.save();

    // 1. Scoreboard HUD — Large, positioned lower down, with glowing ball colors
    if (this.showScoreboard && this.balls.length > 0) {
      this.drawScoreboardHUD(ctx);
    }

    // 2. Brick Counter & Progress Bar at Bottom (English)
    const footerY = this.height - 110;
    const remaining = this.bricks.length;
    const cleared = this.totalInitialBricks - remaining;

    ctx.font = '800 28px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#e2e8f0';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 8;
    ctx.fillText(`BRICKS DESTROYED: ${cleared} / ${this.totalInitialBricks}`, this.width / 2, footerY - 25);

    if (this.showProgressBar) {
      const barW = 880;
      const barH = 14;
      const barX = (this.width - barW) / 2;
      const barY = footerY + 15;
      const progress = this.totalInitialBricks > 0 ? cleared / this.totalInitialBricks : 1.0;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW, barH, 7);
      ctx.fill();

      if (progress > 0) {
        const fillGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
        fillGrad.addColorStop(0, '#00f0ff');
        fillGrad.addColorStop(0.5, '#b967ff');
        fillGrad.addColorStop(1, '#ff007f');

        ctx.fillStyle = fillGrad;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.roundRect(barX, barY, Math.max(14, barW * progress), barH, 7);
        ctx.fill();
      }
    }

    // 3. Game End Splash / Winner Podium (Displays for 5 full seconds!)
    if (this.isFinished) {
      this.drawFinishCard(ctx);
    }

    // 4. TikTok Safe Zone Overlay
    if (this.showTikTokSafeZone) {
      this.drawTikTokMockUI(ctx);
    }

    ctx.restore();
  }

  // Draw Real-time Ball Leaderboard (HUD): Positioned lower down and noticeably larger!
  drawScoreboardHUD(ctx) {
    ctx.save();
    const hudY = 145; // Placed lower down, well clear of the mobile notch
    const count = this.balls.length;
    const sorted = [...this.balls].sort((a, b) => b.score - a.score);
    const maxScore = sorted[0] ? sorted[0].score : 0;

    const pillH = count <= 2 ? 72 : (count <= 4 ? 66 : 58);
    const gap = count <= 2 ? 22 : 14;
    const pillW = count === 1 ? 320 : Math.min(count === 2 ? 280 : 210, (960 - (count - 1) * gap) / count);
    const totalW = count * pillW + (count - 1) * gap;
    const startX = (this.width - totalW) / 2;

    this.balls.forEach((ball, idx) => {
      const bx = startX + idx * (pillW + gap);
      const isLeader = count > 1 && ball.score > 0 && ball.score === maxScore;

      // Card Background with Glowing Ball Border
      ctx.fillStyle = isLeader ? 'rgba(255, 255, 255, 0.16)' : 'rgba(12, 15, 26, 0.90)';
      ctx.strokeStyle = ball.color;
      ctx.lineWidth = isLeader ? 4 : 2.5;
      ctx.shadowColor = ball.color;
      ctx.shadowBlur = isLeader ? 22 : 12;

      ctx.beginPath();
      ctx.roundRect(bx, hudY - pillH / 2, pillW, pillH, pillH / 2);
      ctx.fill();
      ctx.stroke();

      // Glowing 3D Ball Sphere (Clean, no emoji!)
      const dotR = count <= 2 ? 15 : 12;
      const dotX = bx + 24 + dotR;
      const dotY = hudY;

      ctx.save();
      ctx.shadowColor = ball.color;
      ctx.shadowBlur = 18;
      ctx.fillStyle = ball.color;
      ctx.beginPath();
      ctx.arc(dotX, dotY, dotR, 0, Math.PI * 2);
      ctx.fill();

      // Shiny 3D highlight
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(dotX - dotR * 0.35, dotY - dotR * 0.35, dotR * 0.38, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Large, bold, readable score
      const fontSize = count <= 2 ? 38 : (count <= 4 ? 30 : 24);
      ctx.font = `900 ${fontSize}px "Outfit", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';

      const textCenterX = dotX + dotR + (bx + pillW - (dotX + dotR)) / 2;
      const crown = isLeader ? ' 👑' : '';
      const displayScore = count === 1 ? `${ball.score} / ${this.totalInitialBricks}` : `${ball.score}${crown}`;
      ctx.fillText(displayScore, textCenterX, hudY + 2);
    });

    ctx.restore();
  }

  drawFinishCard(ctx) {
    ctx.save();
    const cx = this.width / 2;
    const cy = this.height / 2 + 50;

    ctx.fillStyle = 'rgba(8, 10, 18, 0.95)';
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 32;

    const cardW = 860;
    const cardH = 380;
    ctx.beginPath();
    ctx.roundRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 34);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (this.balls.length > 1) {
      const sorted = [...this.balls].sort((a, b) => b.score - a.score);
      const winner = sorted[0];

      ctx.font = '900 50px "Outfit", sans-serif';
      ctx.fillStyle = winner.color;
      ctx.shadowColor = winner.color;
      ctx.shadowBlur = 24;
      ctx.fillText(`🏆 ${winner.name} BALL WINS!`, cx, cy - 90);

      ctx.font = '700 32px "Outfit", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 0;
      ctx.fillText(`Final Score: ${winner.score} bricks destroyed`, cx, cy - 25);

      ctx.font = '600 24px "JetBrains Mono", monospace';
      ctx.fillStyle = '#cbd5e1';
      const second = sorted[1];
      const third = sorted[2];
      let podiumStr = `2nd: ${second.name} (${second.score})`;
      if (third) podiumStr += ` • 3rd: ${third.name} (${third.score})`;
      ctx.fillText(podiumStr, cx, cy + 35);

      ctx.font = '800 28px "Outfit", sans-serif';
      ctx.fillStyle = '#ffe600';
      ctx.fillText("Did you bet on the winning ball? Comment below!", cx, cy + 105);
    } else {
      let headline = "ALL BRICKS DESTROYED!";
      let sub = "100% of bricks cleared!";
      let color = "#00ff88";

      ctx.font = '900 52px "Outfit", sans-serif';
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 20;
      ctx.fillText(headline, cx, cy - 70);

      ctx.font = '600 34px "Outfit", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 0;
      ctx.fillText(sub, cx, cy);

      ctx.font = '800 28px "Outfit", sans-serif';
      ctx.fillStyle = '#00f0ff';
      ctx.fillText("Could you do better? Tell us in the comments!", cx, cy + 80);
    }

    ctx.restore();
  }

  drawTikTokMockUI(ctx) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.setLineDash([8, 8]);

    const rightX = this.width - 130;
    const startY = this.height / 2;
    for (let i = 0; i < 4; i++) {
      const iy = startY + i * 110;
      ctx.beginPath();
      ctx.arc(rightX, iy, 32, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(rightX, this.height - 210, 36, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillRect(40, this.height - 260, this.width - 220, 100);

    ctx.font = '600 22px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.setLineDash([]);
    ctx.fillText("TikTok UI Safe Zone", 50, this.height - 230);

    ctx.restore();
  }

  start() {
    this.isRunning = true;
    this.lastTime = performance.now();
    const loop = (currentTime) => {
      const dt = Math.min(0.06, (currentTime - this.lastTime) / 1000);
      this.lastTime = currentTime;

      this.update(dt);
      this.draw();

      this.animationId = requestAnimationFrame(loop);
    };
    this.animationId = requestAnimationFrame(loop);
  }

  pause() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  resume() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      this.start();
    }
  }

  reset() {
    this.pause();
    this.initSimulation();
    this.draw();
  }

  randomize() {
    const patterns = [
      'concentric_rings', 'brick_matrix', 'pachinko_drop', 'hourglass',
      'rotating_hexagon', 'cosmic_spiral', 'bullseye_target', 'heart_breaker',
      'diamond_arena', 'pyramid_chute', 'yin_yang', 'castle_fortress',
      'cross_roads', 'plinko_pyramid', 'gravity_well', 'double_vortex',
      'star_galaxy', 'ocean_waves', 'donut_torus', 'floating_islands',
      'pinball_bumper', 'octagon_cage'
    ];
    const themeKeys = Object.keys(this.themes);
    const instruments = ['marimba', 'kalimba', 'synth', 'chime', 'vibraphone', 'musicbox', 'waterdrop', 'pluck', 'arcade', 'basspluck'];
    const scales = ['pentatonic_major', 'pentatonic_minor', 'hirajoshi', 'dreamy_lydian', 'cyber_bass', 'dorian_vibes', 'blues_scale'];

    this.patternType = patterns[Math.floor(Math.random() * patterns.length)];
    this.theme = themeKeys[Math.floor(Math.random() * themeKeys.length)];

    const modes = ['solo', 'duo', 'trio', 'quad'];
    const chosenMode = modes[Math.floor(Math.random() * modes.length)];
    this.gameMode = chosenMode;

    switch (chosenMode) {
      case 'solo':
        this.ballCount = 1;
        this.hookTitle = "CAN IT DESTROY 100% OF THE BRICKS?";
        break;
      case 'duo':
        this.ballCount = 2;
        this.hookTitle = "RED vs BLUE: WHICH BALL WILL WIN?";
        break;
      case 'trio':
        this.ballCount = 3;
        this.hookTitle = "BLUE vs RED vs YELLOW: WHO WILL WIN?";
        break;
      case 'quad':
        this.ballCount = 4;
        this.hookTitle = "4-WAY BATTLE: WHO WILL BE THE CHAMPION?";
        break;
    }

    this.ballBaseSpeed = 15 + Math.random() * 5;

    this.sound.instrument = instruments[Math.floor(Math.random() * instruments.length)];
    this.sound.scaleType = scales[Math.floor(Math.random() * scales.length)];
    this.sound.resetNoteIndex();

    this.reset();
  }
}
