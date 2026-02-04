// visualize3d.js (module)
// Loads assets/models/ball.obj with Three.js OBJLoader and animates it using the existing physics (simulate()) from common.js.
// OPTION 1 INCLUDED:
// - Camera can be moved before simulation
// - Checkbox to lock/unlock camera during simulation

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";

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

  lockCam: el("lockCam"),   // OPTION 1

  timeSlider: el("timeSlider"),
  telemetryBox: el("telemetryBox"),
  summaryBox: el("summaryBox"),
  bounceBox: el("bounceBox"),

  container: el("simCanvas")
};

// "Meters" in physics correspond to "units" in Three.js * scale
const BALL_RADIUS_M = 1;

let three = {
  scene: null,
  camera: null,
  renderer: null,
  controls: null,
  world: null,
  ballGroup: null,
  ballLoaded: false
};

let run = {
  playing: false,
  params: null,
  samples: [],
  events: [],
  tEnd: 0,
  dt: 1 / 60,
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
    ppm: Math.max(0.1, Number(ui.ppm.value)) // scene scale
  };
}

function setControls(enabled){
  ui.btnPause.disabled = !enabled;
  ui.btnReset.disabled = !enabled;
  ui.timeSlider.disabled = !enabled;
}

function sampleAtTime(t){
  if (!run.samples.length) return null;
  const idx = window.clamp(Math.round(t / run.dt), 0, run.samples.length - 1);
  return run.samples[idx];
}

function formatTelemetry(s){
  return [
    `t: ${s.t.toFixed(3)} s`,
    ``,
    `height h (above ground): ${s.height.toFixed(3)} m`,
    `displacement |Δy|: ${s.displacementMag.toFixed(3)} m`,
    ``,
    `velocity v (+down): ${s.v.toFixed(3)} m/s`,
    `speed |v|: ${s.speed.toFixed(3)} m/s`,
    `acceleration a (+down): ${s.a.toFixed(3)} m/s²`,
    ``,
    `weight: ${s.weightN.toFixed(3)} N`,
    `bounces so far: ${s.bounceCount}`,
    ``,
    `KE: ${s.KE.toFixed(3)} J`,
    `PE: ${s.PE.toFixed(3)} J`,
    `Total E: ${s.E.toFixed(3)} J`
  ].join("\n");
}

function formatSummary(){
  if (!run.params || !run.samples.length) return "";
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
  if (!run.events.length) return "Bounce list:\n(no bounces yet)";

  const lines = ["Bounce list (impact speed + bounce height):"];
  for (const ev of run.events){
    lines.push(
      `#${ev.bounceNumber}  t=${ev.tImpact.toFixed(4)} s  |vImpact|=${ev.impactSpeed.toFixed(4)} m/s  bounceHeight=${ev.bounceHeight.toFixed(4)} m`
    );
  }
  return lines.join("\n");
}

function initThree(){
  const w = ui.container.clientWidth;
  const h = ui.container.clientHeight || 420;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f1115);

  const camera = new THREE.PerspectiveCamera(55, w / h, 0.01, 1000);
  camera.position.set(4, 3, 6);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setSize(w, h);
  ui.container.innerHTML = "";
  ui.container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 1, 0);
  controls.enabled = true; // OPTION 1: allow camera movement immediately

  // lights
  scene.add(new THREE.HemisphereLight(0xffffff, 0x223344, 0.9));
  const dir = new THREE.DirectionalLight(0xffffff, 1.0);
  dir.position.set(5, 10, 7);
  scene.add(dir);

  // world group (scale this with ppm)
  const world = new THREE.Group();
  scene.add(world);

  // ground plane (y=0)
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.MeshStandardMaterial({ color: 0x151922, roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  world.add(ground);

  // ball group (we move this up/down)
  const ballGroup = new THREE.Group();
  ballGroup.position.set(0, BALL_RADIUS_M, 0);
  world.add(ballGroup);

  // fallback sphere if OBJ fails
  const fallback = new THREE.Mesh(
    new THREE.SphereGeometry(BALL_RADIUS_M, 32, 16),
    new THREE.MeshStandardMaterial({ color: 0xff8c00, roughness: 0.6, metalness: 0.0 })
  );
  fallback.name = "fallbackSphere";
  ballGroup.add(fallback);

  three = { scene, camera, renderer, controls, world, ballGroup, ballLoaded: false };

  window.addEventListener("resize", () => resizeThree());
}

function resizeThree(){
  if (!three.renderer) return;
  const w = ui.container.clientWidth;
  const h = ui.container.clientHeight || 420;
  three.camera.aspect = w / h;
  three.camera.updateProjectionMatrix();
  three.renderer.setSize(w, h);
}

function normalizeAndCenter(obj){
  // Force a simple orange material (ignores textures)
  obj.traverse((child) => {
    if (child.isMesh){
      child.material = new THREE.MeshStandardMaterial({
        color: 0xff8c00,
        roughness: 0.6,
        metalness: 0.0
      });
      child.castShadow = false;
      child.receiveShadow = false;
    }
  });

  // Fit to BALL_RADIUS_M
  const box = new THREE.Box3().setFromObject(obj);
  const size = new THREE.Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const scale = (BALL_RADIUS_M * 2) / maxDim;
  obj.scale.setScalar(scale);

  // Center around origin
  const box2 = new THREE.Box3().setFromObject(obj);
  const center = new THREE.Vector3();
  box2.getCenter(center);
  obj.position.sub(center);
}

function loadOBJ(){
  const loader = new OBJLoader();
  loader.load(
    "./assets/models/ball.obj",
    (object) => {
      normalizeAndCenter(object);

      // Remove fallback sphere
      const fb = three.ballGroup.getObjectByName("fallbackSphere");
      if (fb) three.ballGroup.remove(fb);

      three.ballGroup.add(object);
      three.ballLoaded = true;
    },
    undefined,
    (err) => {
      console.warn("OBJ load failed:", err);
      // fallback sphere stays
    }
  );
}

function update3D(s){
  // Apply scene scale from "ppm"
  const scale = run.params?.ppm ?? 1;
  three.world.scale.setScalar(scale);

  // height above ground is s.heightClamped (meters)
  const h = Math.max(0, s.heightClamped);

  // Place ball center at height + radius
  three.ballGroup.position.y = h + BALL_RADIUS_M;


  if (run.playing) three.ballGroup.rotation.y += 0.01;

}

function renderFrame(){
  if (!three.renderer) return;
  three.controls.update();
  three.renderer.render(three.scene, three.camera);
}

function draw(){
  if (!run.params || !run.samples.length){
    ui.telemetryBox.textContent = "";
    ui.summaryBox.textContent = "";
    ui.bounceBox.textContent = "";
    renderFrame();
    return;
  }

  const s = sampleAtTime(run.t);
  if (!s) return;

  ui.telemetryBox.textContent = formatTelemetry(s);
  ui.summaryBox.textContent = formatSummary();
  ui.bounceBox.textContent = formatBounceList();

  update3D(s);
  renderFrame();
}

function applyCameraLockRule(){
  // OPTION 1 behavior:
  // - Always allow camera movement when not playing
  // - When playing: lock if checkbox checked
  if (!three.controls) return;

  if (!run.playing){
    three.controls.enabled = true;
    return;
  }

  // playing
  three.controls.enabled = !ui.lockCam.checked ? true : false;
}

function start(){
  run.params = readParams();
  run.dt = 1 / 60;

  const { samples, tEnd, events } = window.simulate(run.params, run.dt);
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

  applyCameraLockRule(); // OPTION 1

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

  run.samples = [];
  run.events = [];
  run.params = null;
  run.tEnd = 0;

  applyCameraLockRule(); // OPTION 1

  draw();
}

function togglePause(){
  if (!run.params) return;
  run.playing = !run.playing;
  ui.btnPause.textContent = run.playing ? "Pause" : "Play";

  applyCameraLockRule(); // OPTION 1

  if (run.playing) loop();
}

function loop(){
  if (!run.playing) return;

  run.t += run.dt;
  if (run.t >= run.tEnd){
    run.t = run.tEnd;
    run.playing = false;
    ui.btnPause.textContent = "Play";
    applyCameraLockRule(); // OPTION 1
  }

  ui.timeSlider.value = String(run.t);
  draw();

  run.raf = requestAnimationFrame(loop);
}

// Wire UI
ui.btnStart.addEventListener("click", start);
ui.btnReset.addEventListener("click", reset);
ui.btnPause.addEventListener("click", togglePause);

ui.timeSlider.addEventListener("input", () => {
  if (!run.params) return;
  run.playing = false;
  ui.btnPause.textContent = "Play";
  applyCameraLockRule(); // OPTION 1
  run.t = Number(ui.timeSlider.value);
  draw();
});

// If user toggles lockCam while running/paused, apply immediately
ui.lockCam.addEventListener("change", () => {
  applyCameraLockRule();
});

let renderRaf = 0;

function renderLoop(){
  // Update pose from current time (even if paused)
  if (run.params && run.samples.length){
    const s = sampleAtTime(run.t);
    if (s) update3D(s);
  }

  renderFrame();
  renderRaf = requestAnimationFrame(renderLoop);
}

// Init 3D + load model
initThree();
loadOBJ();
applyCameraLockRule(); // allow movement before start
draw();
renderLoop();
