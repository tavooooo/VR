/* =====================================================================
   paper-dragon — Gandalf's firework dragon for A-Frame
   ---------------------------------------------------------------------
   The dragon is drawn entirely from glowing golden particles (additive
   sprites), like the firework serpent from Bilbo's party. No GLB, no
   textures to download — the whole creature is built and animated in
   code. Trailing sparks peel off the wingtips, tail and snout and fall
   like embers.

   The FLIGHT LOGIC is unchanged from the paper version:
     · circles the anchor, nose tangent to the path
     · banks into the turn like a glider
     · alternates flapping bursts and glides
     · wing tips lag the inner wing on each stroke
     · tail ripples with a travelling wave, body bobs with the beat

   Component + schema are kept identical so gps.html / previews don't
   need to change:
     <a-entity paper-dragon="size: 3; radius: 12; period: 22; altitude: 25">
   ===================================================================== */

AFRAME.registerComponent("paper-dragon", {
  schema: {
    size:     { default: 3 },     // overall scale (wingspan ≈ 4.6 × size m)
    radius:   { default: 12 },    // flight circle radius, metres
    period:   { default: 22 },    // seconds per lap
    altitude: { default: 25 },    // flight height above the anchor, metres
  },

  init: function () {
    const S = this.data.size;
    const rand = (a, b) => a + Math.random() * (b - a);

    // ---- soft round ember sprite (white core → gold → transparent) ---
    const glow = (() => {
      const c = document.createElement("canvas"); c.width = c.height = 64;
      const g = c.getContext("2d");
      const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grd.addColorStop(0.0, "rgba(255,255,255,1)");
      grd.addColorStop(0.2, "rgba(255,244,200,0.95)");
      grd.addColorStop(0.5, "rgba(255,200,90,0.55)");
      grd.addColorStop(1.0, "rgba(255,150,40,0)");
      g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
      const t = new THREE.CanvasTexture(c);
      return t;
    })();

    // ---- shared shader for the body particles (twinkling embers) -----
    this.bodyMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uSize: { value: 62 }, uTex: { value: glow } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute vec3 aColor; attribute float aPhase; attribute float aSize;
        uniform float uTime; uniform float uSize;
        varying vec3 vColor; varying float vTw;
        void main() {
          vColor = aColor;
          float tw = 0.62 + 0.38 * sin(uTime * 6.0 + aPhase);
          vTw = tw;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = min(44.0, aSize * uSize * tw / -mv.z);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform sampler2D uTex;
        varying vec3 vColor; varying float vTw;
        void main() {
          vec4 t = texture2D(uTex, gl_PointCoord);
          gl_FragColor = vec4(vColor * vTw, t.a);
        }`,
    });

    // ---- rig: identical hierarchy to the paper dragon ----------------
    this.model = new THREE.Group();
    this.model.rotation.order = "YZX";      // yaw, then bank, then pitch
    this.inner = new THREE.Group();         // bobs with each wing beat
    this.inner.scale.setScalar(S);
    this.model.add(this.inner);
    this.el.object3D.add(this.model);

    // ---- point-cloud helpers -----------------------------------------
    // Build a THREE.Points from an array of [x,y,z] with a tint + size.
    const makePoints = (pts, tint, sizeMin, sizeMax) => {
      const n = pts.length;
      const pos = new Float32Array(n * 3);
      const col = new Float32Array(n * 3);
      const ph  = new Float32Array(n);
      const sz  = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        pos[i*3] = pts[i][0]; pos[i*3+1] = pts[i][1]; pos[i*3+2] = pts[i][2];
        col[i*3]   = Math.min(1, tint[0] + rand(-0.05, 0.05));
        col[i*3+1] = Math.min(1, tint[1] + rand(-0.06, 0.06));
        col[i*3+2] = Math.min(1, tint[2] + rand(-0.05, 0.08));
        ph[i] = rand(0, Math.PI * 2);
        sz[i] = rand(sizeMin, sizeMax) * S;   // grow sprite with the dragon
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("aColor",   new THREE.BufferAttribute(col, 3));
      geo.setAttribute("aPhase",   new THREE.BufferAttribute(ph, 1));
      geo.setAttribute("aSize",    new THREE.BufferAttribute(sz, 1));
      return new THREE.Points(geo, this.bodyMat);
    };
    // fill a tapered tube along z
    const tube = (n, z0, z1, r0, r1, yFlat) => {
      const out = [];
      for (let i = 0; i < n; i++) {
        const t = Math.random();
        const z = z0 + (z1 - z0) * t;
        const r = (r0 + (r1 - r0) * t) * Math.sqrt(Math.random());
        const a = Math.random() * Math.PI * 2;
        out.push([r * Math.cos(a), r * Math.sin(a) * (yFlat || 1), z]);
      }
      return out;
    };
    const cluster = (n, c, r, flat) => {
      const out = [];
      for (let i = 0; i < n; i++) {
        const u = Math.random(), v = Math.random();
        const th = 2 * Math.PI * u, ph = Math.acos(2 * v - 1);
        const rr = r * Math.cbrt(Math.random());
        out.push([
          c[0] + rr * Math.sin(ph) * Math.cos(th),
          c[1] + rr * Math.sin(ph) * Math.sin(th) * (flat || 1),
          c[2] + rr * Math.cos(ph),
        ]);
      }
      return out;
    };
    // bilinear fill of a quad given 4 [x,z] corners (membrane in the xz plane)
    const quad = (n, c0, c1, c2, c3) => {
      const out = [];
      for (let i = 0; i < n; i++) {
        const u = Math.random(), v = Math.random();
        const ax = c0[0] + (c1[0]-c0[0])*u, az = c0[1] + (c1[1]-c0[1])*u;
        const bx = c3[0] + (c2[0]-c3[0])*u, bz = c3[1] + (c2[1]-c3[1])*u;
        out.push([ax + (bx-ax)*v, rand(-0.015, 0.015), az + (bz-az)*v]);
      }
      return out;
    };
    // triangle-fan fill of a polygon given [x,z] points (apex = pts[0])
    const fan = (n, pts) => {
      const areas = [], out = [];
      for (let i = 1; i < pts.length - 1; i++) {
        const a = pts[0], b = pts[i], c = pts[i+1];
        areas.push(Math.abs((b[0]-a[0])*(c[1]-a[1]) - (c[0]-a[0])*(b[1]-a[1])) / 2);
      }
      const tot = areas.reduce((s, x) => s + x, 0);
      for (let i = 0; i < n; i++) {
        let r = Math.random() * tot, k = 0;
        while (k < areas.length - 1 && r > areas[k]) { r -= areas[k]; k++; }
        const a = pts[0], b = pts[k+1], c = pts[k+2];
        let s = Math.random(), t = Math.random();
        if (s + t > 1) { s = 1 - s; t = 1 - t; }
        out.push([
          a[0] + s*(b[0]-a[0]) + t*(c[0]-a[0]),
          rand(-0.015, 0.015),
          a[1] + s*(b[1]-a[1]) + t*(c[1]-a[1]),
        ]);
      }
      return out;
    };

    // ---- body + chest (attached to inner) ----------------------------
    this.inner.add(makePoints(tube(950, -0.75, 0.55, 0.22, 0.12, 0.8),
      [1.0, 0.85, 0.5], 0.045, 0.085));
    this.inner.add(makePoints(cluster(260, [0, 0.02, -0.72], 0.22, 0.85),
      [1.0, 0.92, 0.62], 0.05, 0.10));

    // ---- neck (attached to a swaying group) --------------------------
    const neckGroup = new THREE.Group();
    neckGroup.position.set(0, 0.05, -0.9);
    this.inner.add(neckGroup);
    const neckPts = [];
    for (let i = 0; i < 260; i++) {
      const t = Math.random();
      const cx = 0, cy = 0.36 * t, cz = -0.41 * t;      // base → head
      const r = 0.09 * (1 - 0.5 * t);
      const a = Math.random() * Math.PI * 2, rr = r * Math.sqrt(Math.random());
      neckPts.push([cx + rr*Math.cos(a), cy + rr*Math.sin(a), cz]);
    }
    neckGroup.add(makePoints(neckPts, [1.0, 0.88, 0.55], 0.05, 0.10));

    // ---- head + snout + horns (attached to head group) ---------------
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.36, -0.41);
    neckGroup.add(this.headGroup);
    this.headGroup.add(makePoints(cluster(280, [0, 0, 0], 0.15, 0.9),
      [1.0, 0.95, 0.68], 0.05, 0.10));
    this.headGroup.add(makePoints(tube(120, -0.05, -0.32, 0.06, 0.02, 1),
      [1.0, 0.9, 0.55], 0.04, 0.08));                    // snout forward
    for (const sx of [-1, 1]) {
      const horn = [];
      for (let i = 0; i < 40; i++) {
        const t = Math.random();
        horn.push([sx*0.07 + rand(-0.01,0.01), 0.08 + 0.16*t, 0.05 + 0.02*t]);
      }
      this.headGroup.add(makePoints(horn, [1.0, 0.8, 0.4], 0.03, 0.07));
    }

    // ---- tail: 4 chained segments + spade tip (travelling wave) ------
    this.tailSegs = [];
    let parent = this.inner, zOff = 0.55;
    const lens = [0.35, 0.32, 0.30, 0.26];
    const rads = [0.12, 0.09, 0.06, 0.03];
    for (let i = 0; i < lens.length; i++) {
      const seg = new THREE.Group();
      seg.position.z = zOff;
      const tint = [1.0, 0.65 - i*0.06, 0.25 - i*0.03];  // cools toward tip
      seg.add(makePoints(tube(170, 0, lens[i], i ? rads[i-1] : 0.13, rads[i], 1),
        tint, 0.04, 0.08));
      parent.add(seg);
      this.tailSegs.push(seg);
      parent = seg;
      zOff = lens[i];
    }
    this.spade = parent;
    parent.add(makePoints(
      quad(170, [-0.13, 0], [0.13, 0], [0.05, 0.34], [-0.05, 0.34]),
      [1.0, 0.5, 0.18], 0.045, 0.09));

    // ---- wings (inner membrane + scalloped outer) --------------------
    const buildWing = (mirror) => {
      const wing = new THREE.Group();
      wing.position.set(0.18, 0.08, -0.25);
      wing.add(makePoints(
        quad(760, [0, -0.30], [1.0, -0.35], [1.0, 0.12], [0, 0.30]),
        [1.0, 0.8, 0.42], 0.04, 0.08));
      const outer = new THREE.Group();
      outer.position.set(1.0, 0, -0.02);
      outer.add(makePoints(
        fan(560, [[0, -0.32], [1.15, -0.18], [0.8, 0.15], [0.45, 0.30], [0, 0.34]]),
        [1.0, 0.62, 0.28], 0.04, 0.078));
      wing.add(outer);
      // ember emitter marker at the wing tip
      const tip = new THREE.Group();
      tip.position.set(1.1, 0, 0);
      outer.add(tip);
      const holder = mirror ? new THREE.Group() : wing;
      if (mirror) { holder.scale.x = -1; holder.add(wing); }
      this.inner.add(holder);
      return { wing, outer, tip };
    };
    const L = buildWing(false);
    const R = buildWing(true);
    this.wings = [L.wing, R.wing];
    this.outers = [L.outer, R.outer];

    // tail-tip + snout ember emitters
    const tailTip = new THREE.Group(); tailTip.position.set(0, 0.3, 0.34);
    this.spade.add(tailTip);
    const snoutTip = new THREE.Group(); snoutTip.position.set(0, 0, -0.34);
    this.headGroup.add(snoutTip);
    this.emitters = [L.tip, R.tip, tailTip, snoutTip];

    // ---- trailing embers ---------------------------------------------
    this.buildSparks(glow);

    // scratch vectors
    this._wp = new THREE.Vector3();
  },

  // -------------------------------------------------------------------
  buildSparks: function (glow) {
    const N = this.sparkN = 900;
    this.spPos  = new Float32Array(N * 3);
    this.spVel  = new Float32Array(N * 3);
    this.spLife = new Float32Array(N);      // 0 = dead
    this.spSeed = new Float32Array(N);
    for (let i = 0; i < N; i++) { this.spLife[i] = 0; this.spSeed[i] = Math.random() * 6.28; }
    this.spPtr = 0;

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(this.spPos, 3));
    geo.setAttribute("aLife",    new THREE.BufferAttribute(this.spLife, 1));
    geo.setAttribute("aSeed",    new THREE.BufferAttribute(this.spSeed, 1));
    const mat = new THREE.ShaderMaterial({
      uniforms: { uSize: { value: 26 * this.data.size }, uTex: { value: glow } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute float aLife; attribute float aSeed;
        uniform float uSize;
        varying float vLife;
        void main() {
          vLife = aLife;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          float sz = uSize * smoothstep(0.0, 0.25, aLife) * (0.35 + 0.65 * aLife);
          gl_PointSize = min(30.0, max(0.0, sz) / -mv.z);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform sampler2D uTex;
        varying float vLife;
        void main() {
          if (vLife <= 0.0) discard;
          vec4 t = texture2D(uTex, gl_PointCoord);
          vec3 hot  = vec3(1.0, 0.95, 0.75);
          vec3 mid  = vec3(1.0, 0.7,  0.28);
          vec3 cool = vec3(1.0, 0.32, 0.10);
          vec3 col = mix(cool, mix(mid, hot, smoothstep(0.5, 1.0, vLife)),
                         smoothstep(0.0, 1.0, vLife));
          gl_FragColor = vec4(col, t.a * (0.45 + 0.55 * vLife));
        }`,
    });
    this.sparks = new THREE.Points(geo, mat);
    this.sparks.frustumCulled = false;
    this.el.object3D.add(this.sparks);
  },

  spawnSpark: function (x, y, z) {
    const i = this.spPtr; this.spPtr = (this.spPtr + 1) % this.sparkN;
    this.spPos[i*3] = x; this.spPos[i*3+1] = y; this.spPos[i*3+2] = z;
    const S = this.data.size;
    this.spVel[i*3]   = (Math.random() - 0.5) * 0.8 * S;
    this.spVel[i*3+1] = (Math.random() * 0.3 - 0.1) * S;
    this.spVel[i*3+2] = (Math.random() - 0.5) * 0.8 * S;
    this.spLife[i] = 0.9 + Math.random() * 0.9;
  },

  // -------------------------------------------------------------------
  tick: function (time, dt) {
    if (!this.model) return;
    const t = time / 1000;
    const dts = Math.min(0.05, (dt || 16) / 1000);
    const d = this.data;

    // ---- flight path: circle, nose on the tangent, banked ------------
    const a = (2 * Math.PI * t) / d.period;
    this.model.position.set(
      Math.cos(a) * d.radius,
      d.altitude + Math.sin(t * 0.5) * 1.2,      // slow thermal drift
      Math.sin(a) * d.radius
    );

    // ---- flap ⇄ glide cycle ------------------------------------------
    const phase = 2 * Math.PI * 1.1 * t;
    const env = Math.min(1, Math.max(0, Math.sin((2 * Math.PI * t) / 9) * 2.5));
    const flap = env * 0.8 * Math.sin(phase) + (1 - env) * 0.22;
    const outerFlap = env * 0.55 * Math.sin(phase - 0.7) + (1 - env) * -0.12;
    this.wings.forEach(w => (w.rotation.z = flap));
    this.outers.forEach(o => (o.rotation.z = outerFlap));

    this.inner.position.y = env * 0.05 * Math.sin(phase - Math.PI / 2);
    const pitch = env * 0.06 * Math.sin(phase) + 0.03;
    this.model.rotation.set(pitch, Math.PI - a, -0.38);

    // ---- tail travelling wave, idle head sway ------------------------
    for (let i = 0; i < this.tailSegs.length; i++) {
      const s = this.tailSegs[i];
      s.rotation.y = 0.16 * Math.sin(2 * Math.PI * 0.45 * t - i * 0.85);
      s.rotation.x = 0.05 * Math.sin(2 * Math.PI * 0.30 * t - i * 0.60);
    }
    this.headGroup.rotation.x = 0.12 * Math.sin(t * 0.9);
    this.headGroup.rotation.y = 0.10 * Math.sin(t * 0.55);

    // ---- shimmer -----------------------------------------------------
    this.bodyMat.uniforms.uTime.value = t;

    // ---- emit + integrate trailing embers ----------------------------
    this.el.object3D.updateMatrixWorld(true);
    const perEmitter = 2;
    for (const em of this.emitters) {
      em.getWorldPosition(this._wp);
      this.el.object3D.worldToLocal(this._wp);
      for (let k = 0; k < perEmitter; k++) this.spawnSpark(this._wp.x, this._wp.y, this._wp.z);
    }
    const g = 2.2 * d.size;
    for (let i = 0; i < this.sparkN; i++) {
      if (this.spLife[i] <= 0) continue;
      this.spLife[i] -= dts;
      if (this.spLife[i] <= 0) { this.spLife[i] = 0; continue; }
      this.spVel[i*3+1] -= g * dts;                 // gravity — embers fall
      this.spPos[i*3]   += this.spVel[i*3]   * dts;
      this.spPos[i*3+1] += this.spVel[i*3+1] * dts;
      this.spPos[i*3+2] += this.spVel[i*3+2] * dts;
    }
    this.sparks.geometry.attributes.position.needsUpdate = true;
    this.sparks.geometry.attributes.aLife.needsUpdate = true;
  },
});
