// graph.js
// UI EDIT:
// - Change what the cursor box shows in cursorText()
// - Change bounce list formatting in formatBounceList()

const el = (id) => document.getElementById(id);

const ui = {
  H0: el("H0"),
  m: el("m"),
  g: el("g"),
  v0: el("v0"),
  e: el("e"),
  maxBounces: el("maxBounces"),
  stopSpeed: el("stopSpeed"),

  btnGenerate: el("btnGenerate"),
  btnCSV: el("btnCSV"),
  timeSlider: el("timeSlider"),

  cursorBox: el("cursorBox"),
  bounceBox: el("bounceBox"),

  chart1: el("chart1"),
  chart2: el("chart2"),
};

let run = {
  params: null,
  samples: [],
  events: [],
  tEnd: 0,
  dt: 1/60,
  chart1: null,
  chart2: null
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
    maxTime: 30
  };
}

function sampleAtTime(t){
  const idx = clamp(Math.round(t / run.dt), 0, run.samples.length - 1);
  return run.samples[idx];
}

function cursorText(s){
  return [
    `t: ${s.t.toFixed(3)} seconds\n`,
    `height h: ${s.height.toFixed(4)} m\n`,
    `displacement |Δy|: ${s.displacementMag.toFixed(4)} m\n`,
    `v (+down): ${s.v.toFixed(4)} m/s\n`,
    `|v|: ${s.speed.toFixed(4)} m/s\n`,
    `a (+down): ${s.a.toFixed(4)} m/s²\n`,
    `weight: ${s.weightN.toFixed(4)} kg\n`,
    `bounces so far: ${s.bounceCount}\n`,
    `KE: ${s.KE.toFixed(4)} J\n`,
    `PE: ${s.PE.toFixed(4)} J\n`,
    `Total E: ${s.E.toFixed(4)} J\n`,
  ].join("\n");
}

function formatBounceList(){
  if (!run.params) return "Bounce list:\n(generate first)";
  if (run.events.length === 0) return "Bounce list:\n(no bounces)";

  const lines = ["Bounce list (impact speed + bounce height):"];
  for (const ev of run.events){
    lines.push(
      `#${ev.bounceNumber}  t=${ev.tImpact.toFixed(4)} s  |vImpact|=${ev.impactSpeed.toFixed(4)} m/s  bounceHeight=${ev.bounceHeight.toFixed(4)} m`
    );
  }
  return lines.join("\n");
}

function destroyCharts(){
  if (run.chart1){ run.chart1.destroy(); run.chart1 = null; }
  if (run.chart2){ run.chart2.destroy(); run.chart2 = null; }
}

function buildCharts(){
  // Use numeric x-values for true time axis
  const heightPts = run.samples.map(s => ({ x: s.t, y: s.height }));
  const vPts      = run.samples.map(s => ({ x: s.t, y: s.v }));

  const KEpts = run.samples.map(s => ({ x: s.t, y: s.KE }));
  const PEpts = run.samples.map(s => ({ x: s.t, y: s.PE }));
  const Epts  = run.samples.map(s => ({ x: s.t, y: s.E }));

  destroyCharts();

  run.chart1 = new Chart(ui.chart1, {
    type: "line",
    data: {
      datasets: [
        { label: "Height h (m)", data: heightPts, tension: 0.05, pointRadius: 0 },
        { label: "Velocity v (m/s) (+down)", data: vPts, tension: 0.05, pointRadius: 0 }
      ]
    },
    options: {
      responsive: true,
      parsing: false,
      plugins: { legend: { labels: { color: "#e7eaf0" } } },
      scales: {
        x: { type: "linear", ticks: { color: "#aab2c0", maxTicksLimit: 10 }, grid: { color: "rgba(42,49,64,0.35)" } },
        y: { ticks: { color: "#aab2c0" }, grid: { color: "rgba(42,49,64,0.35)" } }
      }
    }
  });

  run.chart2 = new Chart(ui.chart2, {
    type: "line",
    data: {
      datasets: [
        { label: "KE (J)", data: KEpts, tension: 0.05, pointRadius: 0 },
        { label: "PE (J)", data: PEpts, tension: 0.05, pointRadius: 0 },
        { label: "Total E (J)", data: Epts, tension: 0.05, pointRadius: 0 }
      ]
    },
    options: {
      responsive: true,
      parsing: false,
      plugins: { legend: { labels: { color: "#e7eaf0" } } },
      scales: {
        x: { type: "linear", ticks: { color: "#aab2c0", maxTicksLimit: 10 }, grid: { color: "rgba(42,49,64,0.35)" } },
        y: { ticks: { color: "#aab2c0" }, grid: { color: "rgba(42,49,64,0.35)" } }
      }
    }
  });
}

function generate(){
  run.params = readParams();
  run.dt = 1/60;

  const { samples, tEnd, events } = simulate(run.params, run.dt);
  run.samples = samples;
  run.tEnd = tEnd;
  run.events = events;

  ui.timeSlider.disabled = false;
  ui.timeSlider.min = "0";
  ui.timeSlider.max = String(tEnd);
  ui.timeSlider.step = String(run.dt);
  ui.timeSlider.value = "0";

  ui.btnCSV.disabled = false;

  buildCharts();

  ui.cursorBox.textContent = cursorText(sampleAtTime(0));
  ui.bounceBox.textContent = formatBounceList();
}

function downloadCSV(){
  if (!run.samples.length) return;

  const header = [
    "t_s","y_down_m","displacement_abs_m","height_m",
    "v_mps_downpos","speed_mps","a_mps2_downpos",
    "bounces_so_far","weight_N","KE_J","PE_J","E_J"
  ].join(",");

  const rows = run.samples.map(s => ([
    s.t, s.y, s.displacementMag, s.height,
    s.v, s.speed, s.a,
    s.bounceCount, s.weightN, s.KE, s.PE, s.E
  ].map(x => Number(x).toFixed(6)).join(",")));

  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "ball_fall_bounce_data.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// wiring
ui.btnGenerate.addEventListener("click", generate);
ui.btnCSV.addEventListener("click", downloadCSV);

ui.timeSlider.addEventListener("input", () => {
  if (!run.samples.length) return;
  const t = Number(ui.timeSlider.value);
  ui.cursorBox.textContent = cursorText(sampleAtTime(t));
});

ui.cursorBox.textContent = "Press Generate to build graphs.";
ui.bounceBox.textContent = "Bounce list:\n(generate first)";
