# Roadmap

This roadmap is intentionally practical. The long-term goal is a full-featured, AAA-capable web game engine that can be used by anyone, while the near-term work stays grounded in playable vertical slices.

## North star

Mochi should eventually provide the kinds of systems expected from a serious game engine:

- robust scene/world runtime
- scalable rendering pipeline
- animation and asset workflows
- physics/collision and gameplay framework
- audio, input, camera, networking-ready architecture
- tooling, debugging, profiling, and editor-like workflows
- approachable APIs and templates for solo developers and teams

The engine should not become complex by default. AAA-level capability should be layered behind simple entry points.

## Current status

- `@mochi/core` exists for headless world, input, components, and frame-loop primitives.
- `@mochi/renderer-webgl` exists as the current custom WebGL2 renderer.
- `@mochi/gameplay` exists for the high-level facade, controller presets, scene lifecycle, and gameplay helpers.
- `@mochi/vue` exists as the Vue adapter for canvas hosting and HUD/UI ergonomics.
- Controller preset taxonomy exists.
- Playground has multiple demos:
  - `Nightfall Run`
  - `Orbital Islands`
- `Velocity Circuit`
- `Starfield Drift`
- `Preset Lab`
  - `First Person Range`
  - `Tactics Board`

## Near-term checklist

### Runtime

- [x] Add stable entity/component helpers without overbuilding a full ECS.
- [x] Add scene lifecycle helpers (`createScene`, `mountScene`, `disposeScene`).
- [x] Add runtime-level collision primitives (`box`, `sphere`, `trigger`) so demos stop reimplementing collision locally.
- [x] Add event/channel helpers for score, damage, collection, and mission events.
- [ ] Add deterministic fixed-step mode examples.
- [x] Add initial runtime tests for fixed-step ticking, input frame reset, math transforms, and collision queries.

### Rendering

- [x] Add basic directional/ambient lighting.
- [x] Add per-face or simple normal shading for cube/plane geometry.
- [x] Add debug rendering for bounds and controller targets.
- [x] Add simple material presets (`solid`, `emissive`, `warning`, `neutral`).
- [ ] Add asset-loading direction after engine boundaries stabilize.

### Game facade

- [x] Add scene mounting APIs that handle controller/listener/entity cleanup.
- [x] Add controller preset docs with live examples.
- [x] Add collision/world helper APIs promoted from playground patterns.
- [x] Add reset/replay helpers for demos and small games.
- [x] Add input binding config (`WASD`, arrows, gamepad-ready shape).
- [x] Add pooled projectile helpers for simple combat loops.

### Vue layer

- [x] Add a reusable demo shell/HUD pattern.
- [x] Add composables for game stats.
- [x] Add composables for scene state.
- [ ] Keep Vue out of hot-loop simulation data.
- [x] Add examples for HUD-only Vue updates from runtime state.

### Playground demos

- [x] Add a preset playground that can switch camera/control modes live.
- [x] Add a first-person demo.
- [x] Add a top-down or isometric tactics demo.
- [x] Improve `Velocity Circuit` with vehicle-feeling steering instead of character-style movement.
- [x] Add a first spaceflight demo and reusable arcade spacecraft controller.
- [x] Add visual debug toggles.

## Medium-term checklist

- [ ] Package public API docs (vitepress with github pages).
- [x] Add initial tests for controller presets and scene cleanup.
- [ ] Expand tests across renderer behavior and Vue composables.
- [ ] Add release workflow.
- [ ] Add example starter template.
- [ ] Decide package publishing strategy.

## Long-term platform checklist

### Runtime and world

- [ ] Move from basic entities toward a stable scene/world architecture.
- [ ] Add transform hierarchy and parent/child relationships.
- [ ] Add serializable scene format.
- [ ] Add save/load and snapshot support (file based and DB based options).
- [ ] Add worker/off-main-thread exploration for simulation.

### Rendering

- [ ] Add lighting model progression: flat -> normal shading -> PBR direction.
- [ ] Add camera stack and post-processing direction.
- [ ] Add shadows once lighting and materials are stable.
- [ ] Add instancing and batching for scale.
- [ ] Add WebGPU backend exploration after WebGL2 renderer matures.
- [ ] Advanced LOD presets and support
- [ ] ray tracing support

### Assets and animation

- [ ] Decide asset pipeline strategy.
- [ ] Add mesh/texture/material loading.
- [ ] Add animation clips and playback.
- [ ] Add import pipeline for common game assets.

### Physics and gameplay

- [ ] Promote collision helpers into reusable engine primitives.
- [ ] Add character controller foundations.
- [ ] Add trigger volumes, hitboxes, and damage zones.
- [x] Add first reusable projectile emitter for blaster-style interactions.
- [ ] Add physics backend decision when simple collision is no longer enough.

### Tools and developer experience

- [ ] Add visual debug overlays.
- [ ] Add scene inspection tools.
- [ ] Add starter templates by game style.
- [ ] Add example cookbook.
- [ ] Add profiling and performance guidance.
- [ ] Multiplayer support
- [ ] Anti Cheat

### Ecosystem

- [ ] Establish contribution guidelines.
- [ ] Add package/versioning strategy.
- [ ] Create project website/docs site.
- [ ] Add community demo gallery when ready.
- [ ] Tauri support for desktop native and mobile native games
- [ ] Support for React and Svelte

## Design principles

- Keep the default path simple.
- Preserve lower-level escape hatches.
- Promote patterns only after they appear in more than one demo.
- Avoid framework coupling in runtime and renderer.
- Build demos that feel playable, not just technically correct.
- Grow toward AAA capability through staged systems, not speculative rewrites.
