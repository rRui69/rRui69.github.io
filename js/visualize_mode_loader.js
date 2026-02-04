// visualize_mode_loader.js
// Single-page mode switch:
// - visualize.html?mode=2d  -> loads ./js/visualize.js
// - visualize.html?mode=3d  -> loads ./js/visualize3d.js (module + importmap)

(function () {
  const qs = new URLSearchParams(location.search);
  const saved = localStorage.getItem("viz_mode");
  const mode = (qs.get("mode") || saved || "2d").toLowerCase() === "3d" ? "3d" : "2d";

  // UI elements
  const btn2d = document.getElementById("btnMode2d");
  const btn3d = document.getElementById("btnMode3d");
  const subtitle = document.getElementById("modeSubtitle");
  const hint = document.getElementById("modeHint");
  const ppmLabel = document.getElementById("ppmLabel");
  const simHost = document.getElementById("simHost");

  // Keep preference
  localStorage.setItem("viz_mode", mode);

  // Button styles
  function setActive() {
    btn2d.className = "btn " + (mode === "2d" ? "btn-primary" : "btn-outline-light");
    btn3d.className = "btn " + (mode === "3d" ? "btn-primary" : "btn-outline-light");
  }
  setActive();

  // Navigation for mode switch
  btn2d.addEventListener("click", () => {
    qs.set("mode", "2d");
    localStorage.setItem("viz_mode", "2d");
    location.search = qs.toString();
  });

  btn3d.addEventListener("click", () => {
    qs.set("mode", "3d");
    localStorage.setItem("viz_mode", "3d");
    location.search = qs.toString();
  });

  // Inject correct simCanvas element
  if (mode === "2d") {
    subtitle.textContent = "Mode: 2D Canvas";
    hint.textContent = "2D is fastest and most reliable on phones.";
    ppmLabel.textContent = "Pixels per meter (2D scale)";
    simHost.innerHTML = '<canvas id="simCanvas"></canvas>';

    // Load 2D script (non-module)
    const s = document.createElement("script");
    s.src = "./js/visualize.js";
    document.body.appendChild(s);
  } else {
    subtitle.textContent = "Mode: 3D (OBJ + OrbitControls)";
    hint.textContent = "3D loads assets/models/ball.obj. If it’s slow, switch back to 2D.";
    ppmLabel.textContent = "Scene scale (units per meter)";
    simHost.innerHTML = '<div id="simCanvas"></div>';

    // Insert importmap then load module script
    const importMap = document.createElement("script");
    importMap.type = "importmap";
    importMap.textContent = JSON.stringify({
      imports: {
        three: "https://cdn.jsdelivr.net/npm/three@0.182.0/build/three.module.js",
        "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.182.0/examples/jsm/"
      }
    });
    document.body.appendChild(importMap);

    const m = document.createElement("script");
    m.type = "module";
    m.src = "./js/visualize3d.js";
    document.body.appendChild(m);
  }
})();
