// Bulletproof 60 FPS Video Recorder for HTML5 Canvas + Web Audio API
// Supports Native MP4 (H.264/AAC) and High-Fidelity WebM (VP9/Opus) with zero dropouts

export class VideoRecorder {
  constructor(canvas, soundEngine, onProgress, onComplete) {
    this.canvas = canvas;
    this.soundEngine = soundEngine;
    this.onProgress = onProgress;
    this.onComplete = onComplete;

    this.isRecording = false;
    this.recordStartTime = 0;
    this.recordDuration = 300; // Safe ceiling in seconds
    this.progressInterval = null;

    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.selectedMime = 'video/webm';
    this.selectedExt = 'webm';
    this.activeStream = null;
  }

  // Detect the best supported video container and codec
  detectSupportedFormat() {
    const candidates = [
      // 1. Native MP4 formats (Supported in modern Chrome 121+, Edge, Safari)
      { mime: 'video/mp4;codecs=avc1.42E01E,mp4a.40.2', ext: 'mp4', label: 'MP4 (H.264 / AAC)' },
      { mime: 'video/mp4;codecs=avc1,mp4a.40.2', ext: 'mp4', label: 'MP4 (H.264 / AAC)' },
      { mime: 'video/mp4;codecs=avc1', ext: 'mp4', label: 'MP4 (H.264)' },
      { mime: 'video/mp4', ext: 'mp4', label: 'MP4 Standard' },

      // 2. High-Performance WebM formats (VP9 / Opus)
      { mime: 'video/webm;codecs=vp9,opus', ext: 'webm', label: 'WebM (VP9 / Opus HD)' },
      { mime: 'video/webm;codecs=vp8,opus', ext: 'webm', label: 'WebM (VP8 / Opus)' },
      { mime: 'video/webm', ext: 'webm', label: 'WebM Standard' }
    ];

    if (typeof MediaRecorder !== 'undefined') {
      for (const cand of candidates) {
        if (MediaRecorder.isTypeSupported(cand.mime)) {
          return cand;
        }
      }
    }

    return { mime: 'video/webm', ext: 'webm', label: 'WebM Default' };
  }

  getFormatInfo() {
    return this.detectSupportedFormat();
  }

  async startRecording(durationSeconds = 300) {
    if (this.isRecording) return;

    // Ensure audio context is running and active
    if (this.soundEngine && typeof this.soundEngine.ensureAudio === 'function') {
      this.soundEngine.ensureAudio();
    }

    this.isRecording = true;
    this.recordDuration = durationSeconds;
    this.recordStartTime = performance.now();
    this.recordedChunks = [];

    const format = this.detectSupportedFormat();
    this.selectedMime = format.mime;
    this.selectedExt = format.ext;

    // Capture 60 FPS video stream from canvas
    const canvasStream = this.canvas.captureStream ? this.canvas.captureStream(60) : null;
    if (!canvasStream) {
      console.error('Canvas captureStream is not supported in this browser.');
      this.isRecording = false;
      return;
    }

    // Merge Audio track if sound engine provides one
    const streamTracks = [...canvasStream.getVideoTracks()];
    if (this.soundEngine && typeof this.soundEngine.getAudioStreamTrack === 'function') {
      const audioTrack = this.soundEngine.getAudioStreamTrack();
      if (audioTrack) {
        streamTracks.push(audioTrack);
      }
    }

    this.activeStream = new MediaStream(streamTracks);

    try {
      this.mediaRecorder = new MediaRecorder(this.activeStream, {
        mimeType: this.selectedMime,
        videoBitsPerSecond: 12000000 // 12 Mbps crystal-clear HD
      });
    } catch (e) {
      console.warn(`Failed to initialize MediaRecorder with ${this.selectedMime}, falling back to default:`, e);
      this.selectedMime = 'video/webm';
      this.selectedExt = 'webm';
      this.mediaRecorder = new MediaRecorder(this.activeStream);
    }

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.onerror = (err) => {
      console.error('MediaRecorder error event:', err);
    };

    this.mediaRecorder.onstop = () => {
      this.finalizeAndDownload();
    };

    // Request data in chunks every 200ms so data is continuously buffered
    this.mediaRecorder.start(200);
    this.startProgressTracker();
  }

  startProgressTracker() {
    clearInterval(this.progressInterval);
    this.progressInterval = setInterval(() => {
      if (!this.isRecording) {
        clearInterval(this.progressInterval);
        return;
      }

      const elapsed = (performance.now() - this.recordStartTime) / 1000;
      if (this.onProgress) {
        this.onProgress({
          elapsed: elapsed.toFixed(1),
          total: this.recordDuration.toFixed(1),
          format: this.selectedExt.toUpperCase()
        });
      }

      // Hard safety timeout
      if (elapsed >= this.recordDuration) {
        this.stopRecording();
      }
    }, 150);
  }

  stopRecording() {
    if (!this.isRecording) return;
    this.isRecording = false;
    clearInterval(this.progressInterval);

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.requestData();
      } catch (err) {
        // Ignored if inactive
      }
      this.mediaRecorder.stop();
    }
  }

  finalizeAndDownload() {
    clearInterval(this.progressInterval);

    if (this.recordedChunks.length === 0) {
      console.warn('No recorded chunks found upon stopping.');
      return;
    }

    const blob = new Blob(this.recordedChunks, { type: this.selectedMime });
    const now = new Date();
    const ts = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
    const filename = `ballzs_tiktok_${ts}.${this.selectedExt}`;

    const videoUrl = URL.createObjectURL(blob);
    const sizeMB = (blob.size / (1024 * 1024)).toFixed(2);

    // Trigger automatic browser download
    this.triggerDownloadLink(videoUrl, filename);

    // Stop all tracks in active stream to release camera/canvas buffers
    if (this.activeStream) {
      this.activeStream.getTracks().forEach((t) => t.stop());
      this.activeStream = null;
    }

    if (this.onComplete) {
      this.onComplete({
        url: videoUrl,
        filename,
        blob,
        sizeMB,
        ext: this.selectedExt,
        mime: this.selectedMime
      });
    }
  }

  triggerDownloadLink(url, filename) {
    try {
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.setAttribute('download', filename);
      a.download = filename;

      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
      }, 1500);
    } catch (err) {
      console.error('Automatic download trigger error:', err);
    }
  }
}
