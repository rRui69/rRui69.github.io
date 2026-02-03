// visualize.js
// UI EDIT:
// - Change what telemetry displays in formatTelemetry()
// - Change bounce list formatting in formatBounceList()
// - Canvas visuals are in draw()

const el = (id) => document.getElementById(id);

const ui = {
  H0: el("H0"),
  m: el("m"),
  g: el("g"),
  v0: el("v0"),
  e: el("e"),
  maxBounces: el("maxBounces"),
  stopSpeed: el("stopSpeed"),
  ppm: el("ppm"),

  btnStart: el("btnStart"),
  btnPause: el("btnPause"),
  btnReset: el("btnReset"),

  timeSlider: el("timeSlider"),
  telemetryBox: el("telemetryBox"),
  summaryBox: el("summaryBox"),
  bounceBox: el("bounceBox"),

  canvas: el("simCanvas")
};

const ctx = ui.canvas.getContext("2d");

let run = {
  playing: false,
  params: null,
  samples: [],
  events: [],
  tEnd: 0,
  dt: 1/60,
  t: 0,
  raf: 0
};

function readParams(){
  return {
    H0: Math.max(0, Number(ui.H0.value)),
    m: Math.max(0.001, Number(ui.m.value)),
    g: Math.max(0, Number(ui.g.value)),
    v0: Number(ui.v0.value), // +down
    e: Math.max(0, Math.min(1, Number(ui.e.value))),
    maxBounces: Math.max(0, Math.floor(Number(ui.maxBounces.value))),
    stopSpeed: Math.max(0, Number(ui.stopSpeed.value)),
    maxTime: 30,
    ppm: Math.max(0.5, Number(ui.ppm.value))
  };
}

function resizeCanvas(){
  const rect = ui.canvas.getBoundingClientRect();
  ui.canvas.width = Math.floor(rect.width * devicePixelRatio);
  ui.canvas.height = Math.floor(rect.height * devicePixelRatio);
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}

window.addEventListener("resize", () => { resizeCanvas(); draw(); });

function setControls(enabled){
  ui.btnPause.disabled = !enabled;
  ui.btnReset.disabled = !enabled;
  ui.timeSlider.disabled = !enabled;
}

function sampleAtTime(t){
  if (run.samples.length === 0) return null;
  const idx = clamp(Math.round(t / run.dt), 0, run.samples.length - 1);
  return run.samples[idx];
}

function formatTelemetry(s, params){
  return [
    `t: ${s.t.toFixed(3)} s`,
    `height h (above ground): ${s.height.toFixed(3)} m`,
    `displacement |Δy|: ${s.displacementMag.toFixed(3)} m`,
    `velocity v (+down): ${s.v.toFixed(3)} m/s`,
    `speed |v|: ${s.speed.toFixed(3)} m/s`,
    `acceleration a (+down): ${s.a.toFixed(3)} m/s²`,
    `weight: ${s.weightN.toFixed(3)} N`,
    `bounces so far: ${s.bounceCount}`,
    `KE: ${s.KE.toFixed(3)} J`,
    `PE: ${s.PE.toFixed(3)} J`,
    `Total E: ${s.E.toFixed(3)} J`
  ].join("\n");
}

function formatSummary(){
  if (!run.params || run.samples.length === 0) return "";
  const last = run.samples[run.samples.length - 1];
  return [
    `Run summary`,
    `end time: ${run.tEnd.toFixed(4)} s`,
    `final height: ${last.height.toFixed(4)} m`,
    `final speed: ${last.speed.toFixed(4)} m/s`,
    `total bounces: ${run.events.length}`
  ].join("\n");
}

function formatBounceList(){
  if (!run.params) return "";
  if (run.events.length === 0) {
    return "Bounce list:\n(no bounces yet)";
  }

  // UI EDIT: change formatting here
  const lines = ["Bounce list (impact speed + bounce height):"];
  for (const ev of run.events){
    lines.push(
      `#${ev.bounceNumber}  t=${ev.tImpact.toFixed(4)} s  |vImpact|=${ev.impactSpeed.toFixed(4)} m/s  bounceHeight=${ev.bounceHeight.toFixed(4)} m`
    );
  }
  return lines.join("\n");
}

function draw(){
  resizeCanvas();

  const w = ui.canvas.width / devicePixelRatio;
  const h = ui.canvas.height / devicePixelRatio;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#0f1115";
  ctx.fillRect(0, 0, w, h);

  const groundYpx = h - 50;

  // ground line
  ctx.strokeStyle = "#2a3140";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(30, groundYpx);
  ctx.lineTo(w - 30, groundYpx);
  ctx.stroke();

  ctx.fillStyle = "#aab2c0";
  ctx.font = "12px ui-monospace, Menlo, Consolas, monospace";
  ctx.fillText("ground", 35, groundYpx + 18);

  if (!run.params || run.samples.length === 0){
    ctx.fillStyle = "#e7eaf0";
    ctx.font = "16px system-ui";
    ctx.fillText("Set parameters and press Start.", 30, 40);
    return;
  }

  const params = run.params;
  const s = sampleAtTime(run.t);
  if (!s) return;

  // map height to pixels
  const ppm = params.ppm;
  const maxVisibleHeight = (groundYpx - 30) / ppm;
  const hShown = clamp(s.heightClamped, 0, maxVisibleHeight);

  const x = w * 0.5;
  const yBall = groundYpx - hShown * ppm;

  // shadow
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.beginPath();
  ctx.ellipse(x, groundYpx + 10, 18, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // ball
  ctx.fillStyle = "#4ea1ff";
  ctx.beginPath();
  ctx.arc(x, yBall, 16, 0, Math.PI * 2);
  ctx.fill();

  // height marker
  ctx.strokeStyle = "rgba(78,161,255,0.55)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 26, yBall);
  ctx.lineTo(x + 26, groundYpx);
  ctx.stroke();

  ctx.fillStyle = "#e7eaf0";
  ctx.font = "12px ui-monospace, Menlo, Consolas, monospace";
  ctx.fillText(`h=${s.height.toFixed(2)}m`, x + 32, yBall + 4);

  ui.telemetryBox.textContent = formatTelemetry(s, params);
  ui.summaryBox.textContent = formatSummary();
  ui.bounceBox.textContent = formatBounceList();
}

function start(){
  run.params = readParams();
  run.dt = 1/60;

  const { samples, tEnd, events } = simulate(run.params, run.dt);
  run.samples = samples;
  run.tEnd = tEnd;
  run.events = events;

  run.t = 0;
  run.playing = true;

  ui.timeSlider.min = "0";
  ui.timeSlider.max = String(tEnd);
  ui.timeSlider.step = String(run.dt);
  ui.timeSlider.value = "0";

  setControls(true);
  ui.btnStart.disabled = true;
  ui.btnPause.textContent = "Pause";

  loop();
  draw();
}

function reset(){
  cancelAnimationFrame(run.raf);

  run.playing = false;
  run.t = 0;

  ui.btnStart.disabled = false;
  ui.btnPause.disabled = true;
  ui.btnReset.disabled = true;
  ui.timeSlider.disabled = true;

  ui.telemetryBox.textContent = "";
  ui.summaryBox.textContent = "";
  ui.bounceBox.textContent = "";

  run.samples = [];
  run.events = [];
  run.params = null;
  run.tEnd = 0;

  draw();
}

function togglePause(){
  if (!run.params) return;
  run.playing = !run.playing;
  ui.btnPause.textContent = run.playing ? "Pause" : "Play";
  if (run.playing) loop();
}

function loop(){
  if (!run.playing) return;

  run.t += run.dt;
  if (run.t >= run.tEnd){
    run.t = run.tEnd;
    run.playing = false;
    ui.btnPause.textContent = "Play";
  }

  ui.timeSlider.value = String(run.t);
  draw();

  run.raf = requestAnimationFrame(loop);
}

// Events
ui.btnStart.addEventListener("click", start);
ui.btnReset.addEventListener("click", reset);
ui.btnPause.addEventListener("click", togglePause);

ui.timeSlider.addEventListener("input", () => {
  if (!run.params) return;
  run.playing = false;
  ui.btnPause.textContent = "Play";
  run.t = Number(ui.timeSlider.value);
  draw();
});

// Initial paint
draw();
