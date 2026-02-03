// common.js
// Physics model: vertical motion only, no air resistance.
// SIGN CONVENTION (IMPORTANT):
// - Positive direction = downward
// - Start: y = 0 at the initial position
// - Ground: y = H0 (initial height above ground)
// - Acceleration a = +g (downward)
// - Bounce at ground: v_after = -e * v_impact (restitution e in [0,1])

function clamp(x, a, b){ return Math.max(a, Math.min(b, x)); }

function stateFromYV(t, y, v, bounceCount, params){
  const { H0, m, g } = params;

  // "Displacement" requested to be always positive:
  const displacementMag = Math.abs(y);

  // Height above ground:
  // ground is at y=H0, so height is H0 - y
  const heightAboveGround = (H0 - y);
  const heightClamped = Math.max(0, heightAboveGround); // for display and PE

  const speed = Math.abs(v);
  const a = g; // +down

  const KE = 0.5 * m * speed * speed;
  const PE = m * g * heightClamped;
  const E = KE + PE;

  const weightN = m * g;

  return {
    t,
    y,                    // signed downward displacement from start
    displacementMag,      // always positive
    height: heightAboveGround,
    heightClamped,
    v,                    // signed, +down
    speed,
    a,                    // +g
    KE, PE, E,
    weightN,
    bounceCount
  };
}

function solveImpactTau(y0, v0, g, H0, dt){
  // Solve y0 + v0*tau + 0.5*g*tau^2 = H0, for tau in [0, dt]
  const A = 0.5 * g;
  const B = v0;
  const C = y0 - H0;

  const disc = B*B - 4*A*C; // = v0^2 + 2g(H0 - y0)
  if (disc < 0) return null;

  const sqrtD = Math.sqrt(disc);

  // smallest nonnegative root
  const tau1 = (-B - sqrtD) / (2*A);
  const tau2 = (-B + sqrtD) / (2*A);

  if (tau1 >= 0 && tau1 <= dt) return tau1;
  if (tau2 >= 0 && tau2 <= dt) return tau2;
  return null;
}

function bounceHeightFromVafter(vAfter, g){
  // After bounce, vAfter is negative (upward) due to sign convention.
  // At the top: v = 0 => tau = -vAfter/g
  // Height gained above ground: (vAfter^2)/(2g)
  if (g <= 0) return 0;
  return (vAfter * vAfter) / (2 * g);
}

function simulate(params, dt){
  // params: {H0, m, g, v0, e, maxBounces, stopSpeed, maxTime}
  const H0 = Math.max(0, params.H0);
  const g = Math.max(0, params.g);

  if (H0 === 0 || g === 0){
    const s0 = stateFromYV(0, 0, params.v0 || 0, 0, params);
    return { samples: [s0], tEnd: 0, events: [] };
  }

  const maxTime = Math.max(1, params.maxTime ?? 30);
  const maxBounces = Math.max(0, params.maxBounces ?? 10);
  const stopSpeed = Math.max(0, params.stopSpeed ?? 0.05);
  const e = clamp(params.e ?? 0.6, 0, 1);

  let t = 0;
  let y = 0;
  let v = params.v0 ?? 0; // +down
  let b = 0;

  const samples = [];
  const events = []; // bounce events: impact time, impact speed, bounce height, etc.

  samples.push(stateFromYV(t, y, v, b, params));

  const maxSteps = Math.ceil(maxTime / dt);
  for (let step = 0; step < maxSteps; step++){
    if (t >= maxTime) break;

    let remaining = dt;
    let safety = 0;

    while (remaining > 1e-9 && safety < 10){
      safety++;

      // Predict end of substep analytically
      const yEnd = y + v*remaining + 0.5*g*remaining*remaining;

      if (yEnd < H0 - 1e-9){
        // No impact
        const vEnd = v + g*remaining;
        t += remaining;
        y = yEnd;
        v = vEnd;
        remaining = 0;
        samples.push(stateFromYV(t, y, v, b, params));
        break;
      }

      // Impact within remaining time
      const tau = solveImpactTau(y, v, g, H0, remaining);
      if (tau === null){
        // fallback
        t += remaining;
        y = H0;
        v = 0;
        remaining = 0;
        samples.push(stateFromYV(t, y, v, b, params));
        break;
      }

      // Advance to impact
      const vImpact = v + g*tau;   // signed, likely +down at impact
      t += tau;
      y = H0;

      // Record state at impact
      samples.push(stateFromYV(t, y, vImpact, b, params));

      // Bounce
      const vAfter = -e * vImpact; // flips sign, scaled
      b += 1;

      // Record bounce event summary
      const impactSpeed = Math.abs(vImpact);
      const bounceHeight = bounceHeightFromVafter(vAfter, g);
      events.push({
        bounceNumber: b,
        tImpact: t,
        vImpact,
        impactSpeed,
        vAfter,
        bounceHeight
      });

      // Stop conditions
      if (b > maxBounces || Math.abs(vAfter) < stopSpeed){
        v = 0;
        samples.push(stateFromYV(t, y, v, b, params));
        return { samples, tEnd: t, events };
      }

      // Continue remainder after impact
      const dtRem = remaining - tau;
      v = vAfter;
      remaining = dtRem;

      // record immediate post-bounce state (same t, new v)
      samples.push(stateFromYV(t, y, v, b, params));
    }
  }

  return { samples, tEnd: samples[samples.length - 1].t, events };
}
