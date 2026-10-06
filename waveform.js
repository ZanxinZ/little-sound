'use strict';

// Each bin retains real PCM minimum, maximum and RMS. Seconds are never stretched.
function summarizeWave(samples, sampleRate) {
  const size = Math.max(1, Math.round(sampleRate / 100));
  const points = [];
  let peak = 0, rmsPeak = 0;
  for (let i = 0; i < samples.length; i += size) {
    let low = 0, high = 0, sum = 0;
    const end = Math.min(samples.length, i + size);
    for (let j = i; j < end; j++) {
      const x = Number.isFinite(samples[j]) ? samples[j] : 0;
      low = Math.min(low, x); high = Math.max(high, x); sum += x * x;
    }
    const rms = Math.sqrt(sum / (end - i));
    peak = Math.max(peak, -low, high); rmsPeak = Math.max(rmsPeak, rms);
    points.push([low, high, rms].map(x => Math.round(x * 100000) / 100000));
  }
  const step = size / sampleRate, duration = samples.length / sampleRate;
  const threshold = Math.max(.003, rmsPeak * .06);
  let first = points.findIndex(p => p[2] > threshold), last = points.length - 1;
  while (last >= 0 && points[last][2] <= threshold) last--;
  const quiet = first < 0 || peak < .015;
  return {
    points, step, duration, peak, quiet,
    start: quiet ? 0 : Math.max(0, first * step - .05),
    end: quiet ? duration : Math.min(duration, (last + 1) * step + .08)
  };
}
function comparisonSpan(reference, own) {
  const lengths = [reference, own].filter(Boolean).map(w => w.end - w.start);
  return Math.max(.5, Math.ceil(Math.max(...lengths, .5) * 2) / 2);
}
function waveComparisonMarkup(text, isWord, kind = isWord ? 'word' : 'sentence') {
  const playData = 'data-reference-audio="1"', slowData = 'data-reference-audio=".75"';
  const cue=kind==='phoneme'?`跟读音标：/${text}/`:isWord?`跟读单词：${text}`:'跟读上面的整句话';
  const label=kind==='phoneme'?'▷ 听音标':isWord?'▷ 听单词':'▷ 听示范';
  return `<section class="wave-compare" id="wave-comparison" aria-label="示范与我的录音波形对比">
    <div class="wave-heading"><h3>录一录，比波形</h3><span>${cue}</span></div>
    <div class="wave-row reference"><div class="wave-label"><strong><i></i>示范声音</strong><span id="wave-ref-time"></span><div><button class="wave-play" id="wave-ref-play" ${playData}>${label}</button><button class="wave-play" ${slowData}>慢一点</button></div></div><canvas id="wave-ref" role="img" aria-label="示范音频波形"></canvas></div>
    <div class="wave-row mine"><div class="wave-label"><strong><i></i>我的声音</strong><span id="wave-own-time"></span><button class="wave-play" id="wave-own-play" disabled>▷ 听自己</button></div><canvas id="wave-own" role="img" aria-label="录音后显示我的声音波形"></canvas><span class="wave-empty" id="wave-empty">录一录，你的波形就会出现</span></div>
    <div class="wave-scale-note">同一秒刻度 · 高度各自放大</div><div class="wave-controls"><button class="btn" id="wave-record">● 录下我的声音</button><button class="btn light" id="wave-together" disabled>⇄ 轮流听</button></div>
    <p class="wave-status" id="wave-status" role="status" aria-live="polite">先听示范，再跟着读。</p>
    <div class="wave-footnote"><span>波形看长短和停顿，发音要回听。</span><button class="text-link" id="wave-import">导入录音</button><input type="file" accept="audio/*,.webm,.m4a,.wav,.mp3" id="wave-file" aria-label="导入一段录音" hidden></div>
  </section>`;
}
let waveAudioContext;
function analysisContext() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) throw new Error('audio-context-unavailable');
  if (!waveAudioContext || waveAudioContext.state === 'closed') waveAudioContext = new AudioCtx();
  return waveAudioContext;
}

class WaveComparison {
  constructor(root, options) {
    this.root = root; this.options = options; this.reference = options.reference;
    this.own = null; this.recordURL = null; this.live = false; this.busy = false;
    this.dead = false; this.playToken = 0; this.job = 0;
    this.q = selector => root.querySelector(selector);
    this.q('#wave-record').onclick = () => this.record();
    this.q('#wave-own-play').onclick = () => this.play('own');
    this.q('#wave-together').onclick = () => this.listenTogether();
    this.q('#wave-import').onclick = () => { if (!this.live && !this.busy) this.q('#wave-file').click(); };
    this.q('#wave-file').onchange = async e => {
      const file = e.target.files?.[0]; e.target.value = '';
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) { this.status('录音太大啦，选 30 秒以内的一段。'); return; }
      await this.loadRecording(file);
    };
    this.resize = () => this.draw();
    if (typeof ResizeObserver !== 'undefined') { this.observer = new ResizeObserver(this.resize); this.observer.observe(root); }
    else window.addEventListener('resize', this.resize);
    this.draw();
  }
  status(text) { if (!this.dead) this.q('#wave-status').textContent = text; }
  bindPlay(button, rate = 1) { button.onclick = () => this.play('reference', rate); }
  resetControls() {
    if (this.dead) return;
    const ready = Boolean(this.recordURL), blocked = this.live || this.busy;
    this.q('#wave-record').disabled = this.busy;
    this.q('#wave-record').textContent = this.live ? '■ 读完了' : ready ? '● 再录一次' : '● 录下我的声音';
    this.q('#wave-record').classList.toggle('recording', this.live);
    this.q('#wave-own-play').disabled = !ready || blocked;
    this.q('#wave-together').disabled = !ready || !this.own || blocked;
    this.q('#wave-import').disabled = blocked;
    this.root.querySelectorAll('[data-reference-audio]').forEach(b => b.disabled = blocked);
    this.q('#wave-empty').hidden = this.live || Boolean(this.own);
    this.draw();
  }
  async record() {
    if (this.recorder?.state === 'recording') { this.finishRecord(); return; }
    if (this.busy || this.dead) return;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      this.status('这里暂时不能录音，也可以导入一段录音。'); return;
    }
    this.stop(); this.options.stopOther(); this.busy = true; this.resetControls();
    const job = ++this.job;
    try {
      const ctx = analysisContext();
      if (ctx.state === 'suspended') await ctx.resume();
      if (this.dead || job !== this.job) return;
      const stream = await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});
      if (this.dead || job !== this.job) { stream.getTracks().forEach(t => t.stop()); return; }
      this.stream = stream;
      const mime = ['audio/webm;codecs=opus','audio/mp4'].find(t => MediaRecorder.isTypeSupported(t));
      const recorder = new MediaRecorder(stream, mime ? {mimeType:mime} : {});
      this.recorder = recorder;
      const chunks = [];
      recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      recorder.onstop = async () => {
        this.stopCapture(); this.live = false; this.recorder = null;
        if (this.dead) return;
        const blob = new Blob(chunks, {type:recorder.mimeType});
        if (!blob.size) { this.busy = false; this.resetControls(); this.status('没有录到声音，再试一次吧。'); return; }
        await this.loadRecording(blob);
      };
      recorder.onerror = () => {
        recorder.onstop=null;this.stopCapture(); this.live = false; this.busy = false;
        if (recorder.state === 'recording') recorder.stop();
        this.status('录音中断了，再试一次吧。'); this.resetControls();
      };
      this.input = ctx.createMediaStreamSource(stream); this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 2048; this.input.connect(this.analyser);
      this.livePoints = []; this.liveStart = performance.now();
      recorder.start(); this.live = true; this.busy = false; this.resetControls();
      this.q('#wave-empty').hidden = true;
      this.status('正在录音……读完就点“读完了”。');
      this.liveTimer = setInterval(() => {
        if (!this.live || this.dead) return;
        const data = new Float32Array(this.analyser.fftSize); this.analyser.getFloatTimeDomainData(data);
        let low = 0, high = 0; for (const x of data) { low = Math.min(low,x); high = Math.max(high,x); }
        this.livePoints.push([low,high,0]); this.draw();
      }, 40);
      this.limit = setTimeout(() => this.finishRecord(), 30000);
    } catch (e) {
      this.stopCapture(); this.live = false; this.busy = false; this.resetControls();
      this.status(e.name === 'NotAllowedError' ? '需要允许麦克风，也可以导入录音。' : '麦克风暂时不可用，请检查后再试。');
    }
  }
  finishRecord() {
    if (this.recorder?.state !== 'recording') return;
    this.busy = true; this.resetControls(); this.status('正在画你的波形……');
    clearInterval(this.liveTimer); clearTimeout(this.limit);
    this.recorder.stop(); this.stream?.getTracks().forEach(t => t.stop());
  }
  stopCapture() {
    clearInterval(this.liveTimer); clearTimeout(this.limit);
    this.stream?.getTracks().forEach(t => t.stop()); this.stream = null;
    try { this.input?.disconnect(); } catch {} this.input = null; this.analyser = null;
  }
  async loadRecording(blob) {
    if (this.dead) return;
    this.stop(); this.options.stopOther(); this.busy = true; this.resetControls();
    const job = ++this.job;
    try {
      const buffer = await analysisContext().decodeAudioData(await blob.arrayBuffer());
      if (this.dead || job !== this.job) return;
      if (buffer.duration > 30.5) { this.status('选 30 秒以内的录音吧。'); return; }
      const pcm = new Float32Array(buffer.length);
      for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const values = buffer.getChannelData(channel);
        for (let i = 0; i < pcm.length; i++) pcm[i] += values[i] / buffer.numberOfChannels;
      }
      const wave = summarizeWave(pcm, buffer.sampleRate);
      if (this.recordURL) URL.revokeObjectURL(this.recordURL);
      this.recordURL = URL.createObjectURL(blob); this.own = wave;
      this.q('#wave-empty').hidden = true; this.draw();
      this.status(wave.quiet ? '声音有点轻，靠近麦克风再试试。' : '录好了！点“轮流听”，比一比长短和停顿。');
    } catch {
      if (!this.dead) this.status('这段音频暂时读不了，试试重新录音或导入 MP3、WAV。');
    } finally { if (!this.dead && job === this.job) { this.busy = false; this.resetControls(); } }
  }
  stop() {
    this.playToken++; if (this.audio) { this.audio.pause(); this.audio = null; }
    cancelAnimationFrame(this.playFrame);
    if (this.cancelPlay) { this.cancelPlay(false); this.cancelPlay = null; }
    this.cursor = null; if (!this.dead) this.draw();
  }
  async play(which, rate = 1) {
    if (this.dead || this.live || this.busy) return false;
    const wave = which === 'own' ? this.own : this.reference;
    const src = which === 'own' ? this.recordURL : this.options.source();
    if (!src || !wave) return false;
    this.stop(); this.options.stopOther();
    const token = this.playToken, audio = new Audio(src); this.audio = audio; audio.playbackRate = rate;
    return new Promise(resolve => {
      let finished = false;
      const finish = result => {
        if (finished) return; finished = true;
        audio.pause(); cancelAnimationFrame(this.playFrame);
        if (this.audio === audio) { this.audio = null; this.cursor = null; this.cancelPlay = null; if (!this.dead) this.draw(); }
        resolve(result);
      };
      this.cancelPlay = finish;
      audio.onloadedmetadata = () => { if (token === this.playToken) audio.currentTime = Math.min(wave.start,audio.duration || wave.start); };
      audio.onended = () => finish(true);
      audio.onerror = () => { this.status('音频暂时不可用，请再试一次。'); finish(false); };
      audio.onplaying = () => {
        if (which === 'reference') this.options.onReference?.();
        const frame = () => {
          if (this.dead || token !== this.playToken) { finish(false); return; }
          this.cursor = {which,time:Math.max(0,audio.currentTime - wave.start)};
          this.draw();
          if (audio.currentTime >= wave.end) finish(true);
          else this.playFrame = requestAnimationFrame(frame);
        }; frame();
      };
      audio.play().catch(() => { this.status('点一下播放按钮，再试试。'); finish(false); });
    });
  }
  async listenTogether() {
    const result = await this.play('reference');
    const token = this.playToken;
    if (result && !this.dead && token === this.playToken) await this.play('own');
  }
  draw() {
    if (this.dead) return;
    const liveWave = this.live ? {points:this.livePoints || [],step:.04,start:0,end:(performance.now()-this.liveStart)/1000,peak:Math.max(.05,...(this.livePoints||[]).map(p=>Math.max(-p[0],p[1])))} : null;
    const own = liveWave || this.own, span = comparisonSpan(this.reference, own);
    this.drawCanvas(this.q('#wave-ref'),this.reference,span,'#32765d','reference');
    this.drawCanvas(this.q('#wave-own'),own,span,'#9181b8','own');
    this.q('#wave-ref-time').textContent = this.reference ? `${(this.reference.end-this.reference.start).toFixed(2)} 秒` : '暂无示范波形';
    this.q('#wave-own-time').textContent = this.live ? '正在录音' : this.own ? `${(this.own.end-this.own.start).toFixed(2)} 秒` : '';
  }
  drawCanvas(canvas,wave,span,color,which) {
    const width = Math.max(150,canvas.getBoundingClientRect().width || 450), height = 82;
    const ratio = Math.min(window.devicePixelRatio || 1,2);
    canvas.width = Math.round(width*ratio); canvas.height = height*ratio;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.scale(ratio,ratio); ctx.clearRect(0,0,width,height);
    const left=8,right=width-8,y=30,scale=(right-left)/span;
    ctx.strokeStyle='#e0e6d9'; ctx.lineWidth=1; ctx.font='10px sans-serif'; ctx.fillStyle='#87917f';
    const ticks=4;
    for(let t=0;t<=ticks;t++){
      const x=left+(right-left)*t/ticks;ctx.beginPath();ctx.moveTo(x,4);ctx.lineTo(x,60);ctx.stroke();
      ctx.textAlign=t===0?'left':t===ticks?'right':'center';ctx.fillText(`${(span*t/ticks).toFixed(1)}s`,x,78);
    }
    ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(right,y);ctx.stroke();
    if(wave){
      const peak=Math.max(wave.peak,.001),first=Math.max(0,Math.floor(wave.start/wave.step));
      ctx.strokeStyle=color;ctx.lineWidth=Math.max(1,Math.min(3,wave.step*scale*.8));
      for(let i=first;i<wave.points.length&&i*wave.step<wave.end;i++){
        const x=left+Math.max(0,i*wave.step-wave.start)*scale;
        if(x>right)break;const p=wave.points[i];ctx.beginPath();ctx.moveTo(x,y-p[1]/peak*25);ctx.lineTo(x,y-p[0]/peak*25);ctx.stroke();
      }
      canvas.setAttribute('aria-label',`${which==='reference'?'示范':'我的'}音频波形，起点对齐后的时长 ${(wave.end-wave.start).toFixed(2)} 秒，共用 ${span.toFixed(1)} 秒刻度`);
    }
    if(this.cursor?.which===which){const x=left+Math.min(span,this.cursor.time)*scale;ctx.strokeStyle='#bc8951';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,60);ctx.stroke();}
  }
  dispose() {
    this.stop(); this.dead=true; this.job++; this.stopCapture();
    if(this.recorder){this.recorder.onstop=null;this.recorder.onerror=null;if(this.recorder.state==='recording')this.recorder.stop();this.recorder=null;}
    this.observer?.disconnect();window.removeEventListener('resize',this.resize);
    if(this.recordURL)URL.revokeObjectURL(this.recordURL);this.recordURL=null;
  }
}
