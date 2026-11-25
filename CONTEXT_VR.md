# Project Context: Kayutangan 360 (WebVR Virtual Tour)

## 1. Overview & Architecture
- **Goal**: Web-based 360° virtual tour of Kampung Heritage Kayutangan, Malang, Indonesia.
- **Tech Stack**: Vanilla HTML5, CSS3, JavaScript (ES6+), **A-Frame** (v1.5.0+ via CDN). No heavy build step required (static site deployable to Vercel/GitHub Pages).
- **Target Devices**: Mobile browsers (Android Chrome primary; iOS Safari fallback). Must support two viewing modes:
  1. **Normal Mode**: Touch/drag look-around + on-screen HUD buttons.
  2. **VR Cardboard Mode**: Stereoscopic split-screen (`vr-mode-ui="enabled: true"`) + gaze-based cursor (`fuse: true`, 1500ms fuse timeout) for hands-free interaction inside Google Cardboard.
- **Platform Constraint**: On iOS Safari, `DeviceOrientationEvent` permissions can restrict gyroscopic look-around. Ensure touch-drag (`magic-window` / `look-controls`) works seamlessly as a fallback and display a brief notice if gyro permission is denied.

## 2. Tour Locations (7 Points)
The tour consists of 7 sequential/selectable scenes stored in a centralized `data/locations.js` configuration:
1. **Gerbang Kampung** (Jl. Basuki Rahmat) - Entry gate, hidden old kampung behind colonial shopfronts, tourism village since 2018.
2. **Rumah 1870** - Oldest recorded house in the kampung, early Batavia colonial architectural style.
3. **Rumah Namsin** - Features crown ornaments symbolizing the owner's status as a wealthy merchant (saudagar).
4. **Rumah Jengki** - 1960s post-independence Indonesian architectural style with slanted roofs, contrasting colonial buildings.
5. **Rumah & Warung Mbah Ndut** - Built in 1923, linked to Mardikyah family (Hotel Yamato flag incident). Explains Malangan *boso walikan* ("Hamur" = Rumah).
6. **Makam Mbah Honggo** - Tomb of Pangeran Honggokusumo (c. 1830, post-Diponegoro war) who spread Islam in Kayutangan. Includes etiquette reminder.
7. **Pasar Krempyeng & Sungai** - Traditional morning market inside the kampung, river irrigation, and antique household items.

## 3. Core Functional Requirements (From P1 Spec)
- **VR-01 & VR-02**: Landing overlay with title "Kayutangan 360", brief intro, mode selector (Normal vs. Cardboard), and "Mulai Tour" button.
- **VR-03 & VR-04**: Load initial 360° equirectangular image (`<a-sky>`) upon starting. Use placeholder equirectangular colors/grids until real 360° photos are added.
- **VR-05**: 360° look-around via touch drag or gyroscope.
- **VR-06 & VR-07**: Interactive Info Hotspots (`i` icon) in 3D space. Clicking/fusing opens a floating/modal educational text panel AND plays narration audio (must handle browser autoplay policies via user click/gaze).
- **VR-08**: Navigation between all 7 points via in-scene directional arrow portals AND a quick-jump location drawer/menu (`1/7` to `7/7`).
- **VR-09**: End-of-tour interactive multiple-choice quiz (5 questions about Kayutangan history) with immediate right/wrong feedback and a **Final Score Screen** (awarding titles like "Pemandu Kayutangan", "Penjelajah Heritage", or "Coba Ulang").
- **VR-10**: Exit / Return to Landing Page button that stops active audio and exits VR mode.

## 4. Coding Conventions for AI Agent
- Keep all scene data (titles, descriptions, placeholder sky colors/image paths, audio paths, hotspot coordinates, quiz questions) decoupled in `js/tour-data.js`.
- Use A-Frame custom components (`AFRAME.registerComponent`) for `hotspot-info`, `portal-nav`, and `tour-manager`.
- Ensure UI overlays (HUD menu, quiz modal, score screen) work cleanly in Normal Mode, while providing 3D `<a-plane>` / `<a-text>` equivalents or gaze triggers when inside Cardboard VR split-screen mode.