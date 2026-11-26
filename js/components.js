// Komponen A-Frame: hotspot-info, portal-nav, tour-manager
(function () {
  const EYE_Y = 1.6;   // tinggi mata (sama dengan rig kamera)
  const RADIUS = 6;    // jarak hotspot dari pengamat

  // yaw/pitch (derajat) -> posisi relatif terhadap mata. yaw 0 = lurus ke depan (-Z).
  function polar(yaw, pitch) {
    const y = THREE.MathUtils.degToRad(yaw);
    const p = THREE.MathUtils.degToRad(pitch);
    return {
      x: RADIUS * Math.cos(p) * Math.sin(y),
      y: RADIUS * Math.sin(p),
      z: -RADIUS * Math.cos(p) * Math.cos(y)
    };
  }

  // Tombol bulat berlabel yang menghadap pengamat
  function buildButton(el, color, label, size) {
    el.setAttribute('geometry', { primitive: 'circle', radius: size });
    el.setAttribute('material', { color: color, shader: 'flat', opacity: 0.92 });
    const t = document.createElement('a-entity');
    t.setAttribute('text', { value: label, align: 'center', width: size * 7, color: '#ffffff', wrapCount: 12 });
    t.setAttribute('position', '0 0 0.01');
    el.appendChild(t);
    el.classList.add('clickable');
  }

  AFRAME.registerComponent('hotspot-info', {
    init() {
      buildButton(this.el, '#d97706', 'i', 0.4);
      this.el.setAttribute('animation', 'property: scale; to: 1.15 1.15 1.15; dir: alternate; dur: 800; loop: true');
      this.el.addEventListener('click', () => this.el.sceneEl.emit('hotspot-open'));
    }
  });

  AFRAME.registerComponent('portal-nav', {
    schema: { action: { type: 'string' }, label: { type: 'string' } },
    init() {
      const colors = { next: '#16a34a', prev: '#475569', angle: '#2563eb', exit: '#b91c1c' };
      buildButton(this.el, colors[this.data.action] || '#475569', this.data.label, 0.45);
      this.el.addEventListener('click', () => this.el.sceneEl.emit('portal-action', { action: this.data.action }));
    }
  });

  AFRAME.registerComponent('tour-manager', {
    init() {
      this.locIdx = 0;
      this.viewIdx = 0;
      this.token = 0;
      this.cache = {};
      this.sky = document.getElementById('sky-bg');
      this.hotspots = document.getElementById('hotspots');
      this.panel = document.getElementById('vr-info-panel');
      this.loader = document.getElementById('loader');
      this.layer = document.getElementById('hotspot-layer');
      this.camPos = new THREE.Vector3();
      this.el.addEventListener('portal-action', (e) => {
        const a = e.detail.action;
        if (a === 'next') this.nextLocation();
        else if (a === 'prev') this.prevLocation();
        else if (a === 'angle') this.nextView();
        else if (a === 'exit') this.el.emit('tour-exit');
      });
    },

    // Jaga hotspot tetap berpusat di mata pengamat, apa pun tinggi kamera di mode biasa/Cardboard
    tick() {
      const cam = this.el.camera;
      if (!cam || !this.layer) return;
      cam.getWorldPosition(this.camPos);
      this.layer.object3D.position.copy(this.camPos);
    },

    getLocation() { return TOUR.locations[this.locIdx]; },

    go(locIdx, viewIdx) {
      this.locIdx = locIdx;
      this.viewIdx = viewIdx || 0;
      this.hideVrInfo();
      const loc = this.getLocation();
      const view = loc.views[this.viewIdx];
      this.setStartView(view);
      const my = ++this.token;
      this.loader.classList.remove('hidden');
      this.loader.textContent = 'Memuat panorama…';
      this.preload(view.src, (ok) => {
        if (my !== this.token) return; // sudah pindah lagi
        if (ok) {
          this.sky.setAttribute('src', view.src);
          this.loader.classList.add('hidden');
        } else {
          this.loader.textContent = 'Gagal memuat panorama. Periksa koneksi lalu coba lagi.';
        }
      });
      this.buildHotspots();
      this.el.emit('tour-changed', { locIdx: this.locIdx, viewIdx: this.viewIdx });
      this.preloadNeighbours();
    },

    // Arahkan pandangan awal: rig diputar sehingga berlaku di mode biasa maupun Cardboard,
    // sementara hotspot tetap memakai yaw relatif terhadap foto.
    setStartView(view) {
      const yaw = view.startYaw !== undefined ? view.startYaw : TOUR.defaultYaw;
      document.getElementById('rig').setAttribute('rotation', `0 ${-yaw} 0`);
      const camEl = this.el.camera && this.el.camera.el;
      const lc = camEl && camEl.components['look-controls'];
      if (lc && lc.yawObject) { lc.yawObject.rotation.y = 0; lc.pitchObject.rotation.x = 0; } // buang sisa geseran
    },

    preload(src, cb) {
      if (this.cache[src] === 'ok') { cb(true); return; }
      const img = new Image();
      img.onload = () => { this.cache[src] = 'ok'; cb(true); };
      img.onerror = () => cb(false);
      img.src = src;
    },

    preloadNeighbours() {
      const next = TOUR.locations[this.locIdx + 1];
      if (next) this.preload(next.views[0].src, () => {});
    },

    nextLocation() {
      if (this.locIdx < TOUR.locations.length - 1) this.go(this.locIdx + 1, 0);
      else this.el.emit('tour-finish');
    },
    prevLocation() { if (this.locIdx > 0) this.go(this.locIdx - 1, 0); },
    nextView() {
      const n = this.getLocation().views.length;
      if (n > 1) this.go(this.locIdx, (this.viewIdx + 1) % n);
    },

    // Hotspot info + portal 3D (dipakai terutama di mode Cardboard)
    buildHotspots() {
      while (this.hotspots.firstChild) this.hotspots.removeChild(this.hotspots.firstChild);
      const loc = this.getLocation();
      const view = loc.views[this.viewIdx];
      const last = this.locIdx === TOUR.locations.length - 1;

      const add = (yaw, pitch, comp) => {
        const e = document.createElement('a-entity');
        const pos = polar(yaw, pitch);
        e.setAttribute('position', `${pos.x} ${pos.y} ${pos.z}`);
        e.setAttribute('rotation', `${pitch} ${-yaw} 0`); // menghadap pengamat
        e.setAttribute(comp.name, comp.value);
        this.hotspots.appendChild(e);
      };

      // Portal mengikuti arah pandangan awal (startYaw), jadi selalu ada di sekitar pusat layar saat titik dimuat.
      // Hotspot info memakai yaw relatif terhadap foto (infoYaw) agar menempel pada objeknya.
      const sy = view.startYaw !== undefined ? view.startYaw : TOUR.defaultYaw;
      add(view.infoYaw, view.infoPitch, { name: 'hotspot-info', value: '' });
      if (this.locIdx > 0) add(sy - 40, -30, { name: 'portal-nav', value: { action: 'prev', label: 'Sebelum-nya' } });
      add(sy + 40, -30, { name: 'portal-nav', value: { action: 'next', label: last ? 'Kuis' : 'Lanjut' } });
      if (loc.views.length > 1) {
        add(sy, -30, { name: 'portal-nav', value: { action: 'angle', label: `Sudut ${((this.viewIdx + 1) % loc.views.length) + 1}` } });
      }
      add(sy, -52, { name: 'portal-nav', value: { action: 'exit', label: 'Keluar' } });
    },

    // Panel info 3D untuk mode Cardboard (overlay DOM tidak tampil di layar split)
    showVrInfo(loc) {
      const cam = this.el.camera.el.object3D;
      const dir = new THREE.Vector3();
      cam.getWorldDirection(dir);
      dir.y = 0; dir.normalize();
      const d = 3.2;
      this.panel.setAttribute('position', `${dir.x * d} 0 ${dir.z * d}`);
      this.panel.setAttribute('rotation', `0 ${THREE.MathUtils.radToDeg(Math.atan2(-dir.x, -dir.z))} 0`);
      this.panel.querySelector('.vr-info-text').setAttribute('text', 'value', `${loc.id}. ${loc.name}\n\n${loc.desc}\n\n(Tatap panel ini untuk menutup)`);
      this.panel.setAttribute('visible', 'true');
      this.panel.classList.add('clickable');
    },
    hideVrInfo() {
      this.panel.setAttribute('visible', 'false');
      this.panel.classList.remove('clickable');
    }
  });
})();
