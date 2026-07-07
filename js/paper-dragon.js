/* =====================================================================
   paper-dragon — procedural origami dragon for A-Frame
   ---------------------------------------------------------------------
   A low-poly "folded paper" dragon built entirely in code (no GLB).
   Flight model:
     · circles the anchor point, nose tangent to the path
     · banks toward the centre of the turn (like a real glider)
     · alternates flapping bursts and glides on a slow cycle
     · wing tips lag the inner wing on each stroke
     · tail ripples with a travelling wave, body bobs with the beat
   Units are metres in the parent GPS entity's frame.
   Usage:
     <a-entity paper-dragon="size: 3; radius: 12; period: 22; altitude: 25">
   ===================================================================== */

AFRAME.registerComponent("paper-dragon", {
  schema: {
    size:     { default: 3 },     // mesh scale (wingspan ≈ 4.6 × size metres)
    radius:   { default: 12 },    // flight circle radius, metres
    period:   { default: 22 },    // seconds per lap
    altitude: { default: 25 },    // flight height above the anchor, metres
  },

  init: function () {
    const paper = new THREE.MeshStandardMaterial({
      color: 0xf5ecd9, flatShading: true, roughness: 0.92, metalness: 0,
      side: THREE.DoubleSide,
    });
    const paperWing = new THREE.MeshStandardMaterial({
      color: 0xfbf5e6, flatShading: true, roughness: 0.9, metalness: 0,
      side: THREE.DoubleSide,
    });

    const tris = (pts, faces) => {
      const v = [];
      faces.forEach(f => f.forEach(i => v.push(...pts[i])));
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
      g.computeVertexNormals();
      return g;
    };

    // ---- root groups -------------------------------------------------
    this.model = new THREE.Group();          // moved along the flight path
    this.model.rotation.order = "YZX";       // yaw, then bank, then pitch
    this.inner = new THREE.Group();          // bobs with each wing beat
    this.inner.scale.setScalar(this.data.size);
    this.model.add(this.inner);
    this.el.object3D.add(this.model);

    // ---- body (nose points -z) --------------------------------------
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.2, 1.1, 4), paper);
    body.geometry.rotateX(Math.PI / 2);      // lie along z, taper to rear
    this.inner.add(body);

    const chest = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.45, 4), paper);
    chest.geometry.rotateX(-Math.PI / 2);    // point forward
    chest.position.z = -0.75;
    this.inner.add(chest);

    // ---- neck + head -------------------------------------------------
    const neckGroup = new THREE.Group();
    neckGroup.position.set(0, 0.05, -0.9);
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.11, 0.55, 4), paper);
    neck.geometry.translate(0, 0.275, 0);    // pivot at the base
    neck.rotation.x = -0.85;                 // up and forward
    neckGroup.add(neck);
    this.inner.add(neckGroup);

    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.36, -0.41);
    const skull = new THREE.Mesh(new THREE.TetrahedronGeometry(0.15), paper);
    skull.rotation.set(0.4, 0.8, 0);
    this.headGroup.add(skull);
    const snout = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.28, 4), paper);
    snout.geometry.rotateX(-Math.PI / 2);
    snout.position.set(0, -0.01, -0.18);
    this.headGroup.add(snout);
    for (const sx of [-1, 1]) {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.18, 4), paper);
      horn.position.set(sx * 0.07, 0.08, 0.05);
      horn.rotation.x = 2.4;                 // sweep back
      this.headGroup.add(horn);
    }
    neckGroup.add(this.headGroup);

    // ---- tail: 4 chained segments + spade tip ------------------------
    this.tailSegs = [];
    let parent = this.inner, zOff = 0.55;
    const lens = [0.35, 0.32, 0.3, 0.26];
    const rads = [0.12, 0.09, 0.06, 0.03];
    for (let i = 0; i < lens.length; i++) {
      const seg = new THREE.Group();
      seg.position.z = zOff;
      const m = new THREE.Mesh(
        new THREE.CylinderGeometry(rads[i], i ? rads[i - 1] : 0.13, lens[i], 4),
        paper);
      m.geometry.rotateX(Math.PI / 2);
      m.geometry.translate(0, 0, lens[i] / 2);
      seg.add(m);
      parent.add(seg);
      this.tailSegs.push(seg);
      parent = seg;
      zOff = lens[i];
    }
    const spade = new THREE.Mesh(new THREE.OctahedronGeometry(0.14), paper);
    spade.scale.set(0.8, 1.3, 0.22);
    spade.position.z = lens[lens.length - 1] + 0.08;
    parent.add(spade);

    // ---- wings --------------------------------------------------------
    // inner panel: quad from the shoulder to mid-span
    const innerGeo = tris(
      [[0, 0, -0.3], [1.0, 0, -0.35], [1.0, 0, 0.12], [0, 0, 0.3]],
      [[0, 1, 2], [0, 2, 3]]);
    // outer panel: scalloped trailing edge, like a folded bat wing
    const outerGeo = tris(
      [[0, 0, -0.32], [1.15, 0, -0.18], [0.8, 0, 0.15], [0.45, 0, 0.3], [0, 0, 0.34]],
      [[0, 1, 2], [0, 2, 3], [0, 3, 4]]);

    const buildWing = () => {
      const wing = new THREE.Group();
      wing.position.set(0.18, 0.08, -0.25);
      const innerMesh = new THREE.Mesh(innerGeo, paperWing);
      wing.add(innerMesh);
      const outer = new THREE.Group();
      outer.position.set(1.0, 0, -0.02);
      outer.add(new THREE.Mesh(outerGeo, paperWing));
      wing.add(outer);
      return { wing, outer };
    };

    const L = buildWing();
    this.inner.add(L.wing);
    // right wing: mirrored container so the same angles flap symmetrically
    const R = buildWing();
    const mirror = new THREE.Group();
    mirror.scale.x = -1;
    mirror.add(R.wing);
    this.inner.add(mirror);
    this.wings = [L.wing, R.wing];
    this.outers = [L.outer, R.outer];

    // ---- tucked hind legs ---------------------------------------------
    for (const sx of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.3, 4), paper);
      leg.position.set(sx * 0.14, -0.13, 0.32);
      leg.rotation.x = 2.4;                  // folded back under the tail
      this.inner.add(leg);
    }
  },

  tick: function (time) {
    if (!this.model) return;
    const t = time / 1000;
    const d = this.data;

    // ---- flight path: circle, nose on the tangent, banked into the turn
    const a = (2 * Math.PI * t) / d.period;
    this.model.position.set(
      Math.cos(a) * d.radius,
      d.altitude + Math.sin(t * 0.5) * 1.2,   // slow thermal drift
      Math.sin(a) * d.radius
    );

    // ---- flap ⇄ glide cycle -------------------------------------------
    const phase = 2 * Math.PI * 1.1 * t;                    // 1.1 beats/s
    const env = Math.min(1, Math.max(0, Math.sin((2 * Math.PI * t) / 9) * 2.5));
    const flap = env * 0.8 * Math.sin(phase) + (1 - env) * 0.22;
    const outerFlap = env * 0.55 * Math.sin(phase - 0.7) + (1 - env) * -0.12;
    this.wings.forEach(w => (w.rotation.z = flap));
    this.outers.forEach(o => (o.rotation.z = outerFlap));

    // body pushed up by each downstroke; nose pitches with the beat
    this.inner.position.y = env * 0.05 * Math.sin(phase - Math.PI / 2);
    const pitch = env * 0.06 * Math.sin(phase) + 0.03;
    this.model.rotation.set(pitch, Math.PI - a, -0.38);     // yaw + bank

    // ---- tail travelling wave, idle head sway -------------------------
    for (let i = 0; i < this.tailSegs.length; i++) {
      const s = this.tailSegs[i];
      s.rotation.y = 0.16 * Math.sin(2 * Math.PI * 0.45 * t - i * 0.85);
      s.rotation.x = 0.05 * Math.sin(2 * Math.PI * 0.3 * t - i * 0.6);
    }
    this.headGroup.rotation.x = 0.12 * Math.sin(t * 0.9);
    this.headGroup.rotation.y = 0.1 * Math.sin(t * 0.55);
  },
});
