// Main Application Controller — Ballzs Studio
// Supports 22 Patterns, 22 Themes, Solo/Duo/Trio/Quad/Chaos, Live Ball Scoreboard & 65s Monetization Export

import { SoundEngine } from './audio.js';
import { PhysicsEngine } from './physics.js';
import { VideoRecorder } from './recorder.js';

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const canvas = document.getElementById('simCanvas');

  // Top header actions
  const btnRandomizeTop = document.getElementById('btnRandomizeTop');
  const btnAutoExport = document.getElementById('btnAutoExport');
  const btnMuteToggle = document.getElementById('btnMuteToggle');
  const soundIcon = document.getElementById('soundIcon');
  const btnSafeZoneToggle = document.getElementById('btnSafeZoneToggle');
  const modePills = document.querySelectorAll('.mode-pill');

  // Playback controls
  const btnPlayPause = document.getElementById('btnPlayPause');
  const playIcon = document.getElementById('playIcon');
  const btnReset = document.getElementById('btnReset');
  const btnFullscreen = document.getElementById('btnFullscreen');
  const statFps = document.getElementById('statFps');
  const statBricks = document.getElementById('statBricks');
  const statBalls = document.getElementById('statBalls');

  // Recording Banner
  const recordingBanner = document.getElementById('recordingBanner');
  const recProgressText = document.getElementById('recProgressText');
  const recProgressBar = document.getElementById('recProgressBar');

  // Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  // Patterns
  const patternCards = document.querySelectorAll('.pattern-card');
  const btnRegeneratePattern = document.getElementById('btnRegeneratePattern');

  // Ball inputs
  const inputBallCount = document.getElementById('inputBallCount');
  const valBallCount = document.getElementById('valBallCount');
  const inputBallSpeed = document.getElementById('inputBallSpeed');
  const valBallSpeed = document.getElementById('valBallSpeed');
  const inputBallRadius = document.getElementById('inputBallRadius');
  const valBallRadius = document.getElementById('valBallRadius');
  const inputGravity = document.getElementById('inputGravity');
  const valGravity = document.getElementById('valGravity');
  const inputSpeedUp = document.getElementById('inputSpeedUp');
  const valSpeedUp = document.getElementById('valSpeedUp');

  // Audio inputs
  const selectInstrument = document.getElementById('selectInstrument');
  const selectScale = document.getElementById('selectScale');
  const selectProgression = document.getElementById('selectProgression');
  const inputVolume = document.getElementById('inputVolume');
  const valVolume = document.getElementById('valVolume');
  const btnTestSound = document.getElementById('btnTestSound');

  // Hook & Duration inputs
  const inputHookText = document.getElementById('inputHookText');
  const hookChips = document.querySelectorAll('.hook-chip');
  const inputTimerDuration = document.getElementById('inputTimerDuration');
  const valTimerDuration = document.getElementById('valTimerDuration');
  const presetBtns = document.querySelectorAll('.preset-btn');
  const chkShowTimer = document.getElementById('chkShowTimer');
  const chkShowScoreboard = document.getElementById('chkShowScoreboard');
  const chkSafeZone = document.getElementById('chkSafeZone');

  // Themes
  const themeCards = document.querySelectorAll('.theme-card');

  // Export
  const btnStartAutoRecord = document.getElementById('btnStartAutoRecord');
  const btnManualRecord = document.getElementById('btnManualRecord');
  const manualRecLabel = document.getElementById('manualRecLabel');
  const exportDurationBadge = document.getElementById('exportDurationBadge');
  const exportStatusBox = document.getElementById('exportStatusBox');
  const statusTitle = document.getElementById('statusTitle');
  const statusDesc = document.getElementById('statusDesc');

  // Elements for video preview
  const previewVideo = document.getElementById('previewRecordedVideo');
  const btnDownloadVideoDirect = document.getElementById('btnDownloadVideoDirect');

  // Initialize Engines
  const sound = new SoundEngine();
  const physics = new PhysicsEngine(canvas, sound);

  // Initialize Bulletproof Recorder
  const recorder = new VideoRecorder(
    canvas,
    sound,
    (progress) => {
      recordingBanner.classList.remove('hidden');
      const bricksLeft = physics.bricks.length;
      const initial = physics.totalInitialBricks;
      const cleared = initial - bricksLeft;
      const pct = initial > 0 ? Math.round((cleared / initial) * 100) : 100;
      recProgressText.textContent = `${progress.elapsed}s • Briques : ${cleared}/${initial} détruites (${pct}%) • Format : ${progress.format}`;
      recProgressBar.style.width = `${pct}%`;
    },
    (result) => {
      recordingBanner.classList.add('hidden');
      recProgressBar.style.width = '0%';
      exportStatusBox.classList.remove('hidden');
      statusTitle.textContent = `Vidéo prête : ${result.filename}`;
      statusDesc.textContent = `Poids : ${result.sizeMB} Mo • Enregistrement ${result.ext.toUpperCase()} 60 FPS avec audio terminé avec succès !`;
      manualRecLabel.textContent = 'Enregistrement Manuel';

      // Load into in-app preview player
      if (previewVideo) {
        previewVideo.src = result.url;
        previewVideo.load();
      }

      // Configure direct download button
      if (btnDownloadVideoDirect) {
        btnDownloadVideoDirect.href = result.url;
        btnDownloadVideoDirect.download = result.filename;
      }
    }
  );

  // When 5-second victory screen finishes, automatically stop recorder and download!
  physics.onSimulationEnd = () => {
    if (recorder.isRecording) {
      recorder.stopRecording();
    }
  };

  // Password Access Gate (NAELA)
  const AUTH_KEY = 'ballzs_studio_auth';
  const PASSWORD = 'NAELA';
  const gateOverlay = document.getElementById('passwordGateOverlay');
  const gateForm = document.getElementById('gateForm');
  const gateInput = document.getElementById('gatePasswordInput');
  const gateError = document.getElementById('gateErrorMessage');
  const btnToggleGatePwd = document.getElementById('btnToggleGatePwd');

  const isAuth = sessionStorage.getItem(AUTH_KEY) === 'granted';

  function unlockStudio() {
    if (gateOverlay) gateOverlay.classList.add('unlocked');
    sessionStorage.setItem(AUTH_KEY, 'granted');
    sound.ensureAudio();
    physics.resume();
  }

  if (isAuth) {
    if (gateOverlay) gateOverlay.classList.add('unlocked');
  } else {
    physics.pause();
    setTimeout(() => gateInput && gateInput.focus(), 250);
  }

  if (gateForm) {
    gateForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = (gateInput.value || '').trim().toUpperCase();
      if (val === PASSWORD) {
        if (gateError) gateError.classList.add('hidden');
        unlockStudio();
      } else {
        if (gateError) gateError.classList.remove('hidden');
        const card = document.querySelector('.gate-card');
        if (card) {
          card.classList.remove('shake');
          void card.offsetWidth;
          card.classList.add('shake');
        }
        if (gateInput) {
          gateInput.value = '';
          gateInput.focus();
        }
      }
    });
  }

  if (btnToggleGatePwd && gateInput) {
    btnToggleGatePwd.addEventListener('click', () => {
      gateInput.type = gateInput.type === 'password' ? 'text' : 'password';
    });
  }

  // Start simulation
  physics.start();

  // Audio unlock on user pointer
  const unlockAudio = () => {
    sound.ensureAudio();
    window.removeEventListener('pointerdown', unlockAudio);
  };
  window.addEventListener('pointerdown', unlockAudio);

  // Stats & FPS Monitor
  let frameCount = 0;
  let lastFpsTime = performance.now();
  setInterval(() => {
    const now = performance.now();
    const fps = Math.round((frameCount * 1000) / (now - lastFpsTime));
    statFps.textContent = Math.min(60, fps || 60);
    frameCount = 0;
    lastFpsTime = now;
    statBricks.textContent = physics.bricks.length;
    statBalls.textContent = physics.balls.length;
  }, 500);

  const originalDraw = physics.draw.bind(physics);
  physics.draw = () => {
    frameCount++;
    originalDraw();
  };

  // Sync UI from Physics State
  function syncUiFromState() {
    inputBallCount.value = physics.ballCount;
    valBallCount.textContent = `${physics.ballCount} ${physics.ballCount > 1 ? 'Billes' : 'Bille'}`;

    inputBallSpeed.value = Math.round(physics.ballBaseSpeed);
    valBallSpeed.textContent = Math.round(physics.ballBaseSpeed);

    inputBallRadius.value = physics.ballRadius;
    valBallRadius.textContent = `${physics.ballRadius} px`;

    inputGravity.value = physics.gravity;
    valGravity.textContent = physics.gravity === 0 ? '0.00 (Zéro-G)' : physics.gravity.toFixed(2);

    inputSpeedUp.value = physics.speedUpOnHit;
    valSpeedUp.textContent = `+${(physics.speedUpOnHit * 100).toFixed(1)}%`;

    inputHookText.value = physics.hookTitle;

    if (inputTimerDuration) inputTimerDuration.value = physics.timerDuration;
    if (valTimerDuration) valTimerDuration.textContent = "Destruction 100%";
    if (exportDurationBadge) {
      exportDurationBadge.textContent = "Destruction 100%";
    }

    selectInstrument.value = sound.instrument;
    selectScale.value = sound.scaleType;
    selectProgression.value = sound.progressionMode;

    // Pattern cards active
    patternCards.forEach(card => {
      card.classList.toggle('active', card.dataset.pattern === physics.patternType);
    });

    // Theme cards active
    themeCards.forEach(card => {
      card.classList.toggle('active', card.dataset.theme === physics.theme);
    });

    // Preset time buttons
    presetBtns.forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.time) === physics.timerDuration);
    });

    // Mode pills
    modePills.forEach(pill => {
      pill.classList.toggle('active', pill.dataset.mode === physics.gameMode);
    });
  }

  syncUiFromState();

  // Mode Pills (Solo, Duo, Trio, Quad, Chaos)
  modePills.forEach(pill => {
    pill.addEventListener('click', () => {
      sound.ensureAudio();
      const mode = pill.dataset.mode;
      physics.setGameMode(mode);
      syncUiFromState();
    });
  });

  // Randomize Action (1-Click Viral Generator)
  function handleRandomize() {
    sound.ensureAudio();
    physics.randomize();
    syncUiFromState();
  }
  btnRandomizeTop.addEventListener('click', handleRandomize);

  // Play / Pause / Reset
  btnPlayPause.addEventListener('click', () => {
    sound.ensureAudio();
    if (physics.isRunning) {
      physics.pause();
      playIcon.textContent = '▶️';
    } else {
      physics.resume();
      playIcon.textContent = '⏸️';
    }
  });

  btnReset.addEventListener('click', () => {
    sound.ensureAudio();
    physics.reset();
    physics.resume();
    playIcon.textContent = '⏸️';
  });

  // Canvas click to pause / resume / restart
  canvas.addEventListener('click', () => {
    sound.ensureAudio();
    if (physics.isFinished) {
      physics.reset();
      physics.resume();
      playIcon.textContent = '⏸️';
    } else {
      if (physics.isRunning) {
        physics.pause();
        playIcon.textContent = '▶️';
      } else {
        physics.resume();
        playIcon.textContent = '⏸️';
      }
    }
  });

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    if (e.code === 'Space') {
      e.preventDefault();
      btnPlayPause.click();
    } else if (e.code === 'KeyR') {
      e.preventDefault();
      btnReset.click();
    }
  });

  // Sound Mute Toggle
  btnMuteToggle.addEventListener('click', () => {
    sound.ensureAudio();
    sound.setMute(sound.enabled);
    soundIcon.textContent = sound.enabled ? '🔊' : '🔇';
    btnMuteToggle.classList.toggle('active', !sound.enabled);
  });

  // Safe Zone Toggle
  function toggleSafeZone() {
    physics.showTikTokSafeZone = !physics.showTikTokSafeZone;
    chkSafeZone.checked = physics.showTikTokSafeZone;
    btnSafeZoneToggle.classList.toggle('active', physics.showTikTokSafeZone);
  }
  btnSafeZoneToggle.addEventListener('click', toggleSafeZone);
  chkSafeZone.addEventListener('change', (e) => {
    physics.showTikTokSafeZone = e.target.checked;
    btnSafeZoneToggle.classList.toggle('active', physics.showTikTokSafeZone);
  });

  // Fullscreen
  btnFullscreen.addEventListener('click', () => {
    const frame = document.querySelector('.phone-frame');
    if (!document.fullscreenElement) {
      frame.requestFullscreen().catch(err => console.log(err));
    } else {
      document.exitFullscreen();
    }
  });

  // Tabs switching
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(targetId)?.classList.add('active');
    });
  });

  // 22 Pattern cards
  patternCards.forEach(card => {
    card.addEventListener('click', () => {
      patternCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      physics.patternType = card.dataset.pattern;
      physics.reset();
      physics.resume();
      playIcon.textContent = '⏸️';
    });
  });

  btnRegeneratePattern.addEventListener('click', () => {
    physics.reset();
    physics.resume();
  });

  // Ball inputs
  inputBallCount.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    valBallCount.textContent = `${val} ${val > 1 ? 'Billes' : 'Bille'}`;
    physics.ballCount = val;
    physics.spawnBalls();
    statBalls.textContent = val;
  });

  inputBallSpeed.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    valBallSpeed.textContent = val;
    physics.ballBaseSpeed = val;
    for (const b of physics.balls) {
      const curSpeed = Math.hypot(b.vx, b.vy) || 1;
      b.vx = (b.vx / curSpeed) * val;
      b.vy = (b.vy / curSpeed) * val;
    }
  });

  inputBallRadius.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    valBallRadius.textContent = `${val} px`;
    physics.ballRadius = val;
    physics.balls.forEach(b => b.radius = val);
  });

  inputGravity.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    valGravity.textContent = val === 0 ? '0.00 (Zéro-G)' : val.toFixed(2);
    physics.gravity = val;
  });

  inputSpeedUp.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    valSpeedUp.textContent = `+${(val * 100).toFixed(1)}%`;
    physics.speedUpOnHit = val;
  });

  // Audio inputs
  selectInstrument.addEventListener('change', (e) => {
    sound.instrument = e.target.value;
    sound.playBounce(1.0, false);
  });

  selectScale.addEventListener('change', (e) => {
    sound.scaleType = e.target.value;
    sound.resetNoteIndex();
    sound.playBounce(1.0, false);
  });

  selectProgression.addEventListener('change', (e) => {
    sound.progressionMode = e.target.value;
    sound.resetNoteIndex();
  });

  inputVolume.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    valVolume.textContent = `${Math.round(val * 100)}%`;
    sound.setVolume(val);
  });

  btnTestSound.addEventListener('click', () => {
    sound.ensureAudio();
    sound.playBounce(1.0, true);
  });

  // Hook inputs
  inputHookText.addEventListener('input', (e) => {
    physics.hookTitle = e.target.value;
  });

  hookChips.forEach(chip => {
    chip.addEventListener('click', () => {
      inputHookText.value = chip.textContent;
      physics.hookTitle = chip.textContent;
    });
  });

  if (inputTimerDuration) {
    inputTimerDuration.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      if (valTimerDuration) valTimerDuration.textContent = `${val} s`;
      physics.timerDuration = val;
      if (exportDurationBadge) exportDurationBadge.textContent = "Destruction 100%";
      presetBtns.forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.time) === val);
      });
      physics.reset();
    });
  }

  if (presetBtns) {
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.dataset.time);
        presetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (inputTimerDuration) inputTimerDuration.value = val;
        if (valTimerDuration) valTimerDuration.textContent = `${val} s`;
        physics.timerDuration = val;
        if (exportDurationBadge) exportDurationBadge.textContent = "Destruction 100%";
        physics.reset();
      });
    });
  }

  if (chkShowTimer) {
    chkShowTimer.addEventListener('change', (e) => {
      physics.showTimer = e.target.checked;
    });
  }

  chkShowScoreboard.addEventListener('change', (e) => {
    physics.showScoreboard = e.target.checked;
  });

  // 22 Theme cards
  themeCards.forEach(card => {
    card.addEventListener('click', () => {
      themeCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      physics.theme = card.dataset.theme;
      physics.reset();
    });
  });

  // Video Export (Records until all bricks are destroyed + 5s celebration)
  function startAutoExport() {
    sound.ensureAudio();
    exportStatusBox.classList.add('hidden');

    physics.reset();
    physics.resume();
    playIcon.textContent = '⏸️';

    // Start video recorder until all bricks are destroyed (+ 5s victory podium)
    recorder.startRecording(300, 'mp4');
  }

  btnAutoExport.addEventListener('click', startAutoExport);
  btnStartAutoRecord.addEventListener('click', startAutoExport);

  btnManualRecord.addEventListener('click', () => {
    sound.ensureAudio();
    if (!recorder.isRecording) {
      exportStatusBox.classList.add('hidden');
      recorder.startRecording(300, 'mp4');
      manualRecLabel.textContent = 'Arrêter l\'Enregistrement';
    } else {
      recorder.stopRecording();
      manualRecLabel.textContent = 'Enregistrement Manuel';
    }
  });
});
