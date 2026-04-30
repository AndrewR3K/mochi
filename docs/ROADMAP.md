# Roadmap

This roadmap keeps the ambition high and the next steps practical. Mochi should become a web-native engine that can stand beside Unity, Godot, and Unreal for modern web developers. Near-term work should still ship playable slices.

## North star

Mochi should provide the systems developers expect from a full game engine:

- stable scene/world runtime
- scalable rendering pipeline
- animation and asset workflows
- physics/collision and gameplay framework
- audio, input, camera, networking-ready architecture
- tooling, debugging, profiling, and editor-like workflows
- approachable APIs and templates for solo developers and teams

The engine should not become complex by default. Advanced capability should sit behind simple entry points.

Mochi is web-native first. It should feel natural inside Vue and other frontend stacks, while the core stays framework-agnostic enough for React, Svelte, vanilla TypeScript, and non-DOM runtimes. Demos are proof points for external developers, not special cases that require engine edits.

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
- `Alpha Starter`

## Near-term checklist

### Runtime

- [x] Add stable entity/component helpers without overbuilding a full ECS.
- [x] Add scene lifecycle helpers (`createScene`, `mountScene`, `disposeScene`).
- [x] Add runtime-level collision primitives (`box`, `sphere`, `trigger`) so demos stop reimplementing collision locally.
- [x] Add event/channel helpers for score, damage, collection, and mission events.
- [x] Add deterministic fixed-step mode examples.
- [x] Add initial runtime tests for fixed-step ticking, input frame reset, math transforms, and collision queries.
- [x] Add runtime clock controls for pause/resume, time scale, manual stepping, max delta, and fixed-step catch-up limits.
- [x] Add entity names and tags for organization, queries, inspection, and editor workflows.

### Rendering

- [x] Add basic directional/ambient lighting.
- [x] Add per-face or simple normal shading for cube/plane geometry.
- [x] Add debug rendering for bounds and controller targets.
- [x] Add simple material presets (`solid`, `emissive`, `warning`, `neutral`).
- [x] Add initial asset-loading/cache direction with a reusable asset registry.

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
- [x] Expand tests across renderer behavior and Vue composables.
- [x] Add release workflow.
- [x] Add example starter template.
- [x] Decide package publishing strategy for alpha.

## Long-term platform checklist

### Runtime and world

- [ ] Move from basic entities toward a stable scene/world architecture.
- [x] Add transform hierarchy and parent/child relationships.
- [x] Add serializable world snapshots for engine-owned scene state.
- [ ] Add save/load persistence adapters (file based and DB based options).
- [ ] Add worker/off-main-thread exploration for simulation.

### Rendering

- [ ] Add lighting model progression: flat -> normal shading -> PBR direction.
- [ ] Add camera stack and post-processing direction.
- [ ] Add shadows once lighting and materials are stable.
- [ ] Add instancing and batching for scale.
- [ ] Add WebGPU backend exploration after WebGL2 renderer matures.
- [ ] Add advanced LOD presets and support.
- [ ] Add ray tracing direction when the renderer stack is ready.

### Assets and animation

- [ ] Decide asset pipeline strategy.
- [ ] Add mesh/texture/material loading.
- [ ] Add animation clips and playback.
- [ ] Add import pipeline for common game assets.

### Physics and gameplay

- [ ] Promote collision helpers into reusable engine primitives.
- [ ] Add character controller foundations.
- [x] Add trigger volumes, hitboxes, and damage zones.
- [x] Add first reusable projectile emitter for blaster-style interactions.
- [x] Add collision layer and mask filtering.
- [x] Add spatial collision queries for point and sphere-volume checks.
- [x] Add ray collision queries for picking, aiming, sensors, and editor selection.
- [x] Add camera viewport rays for mouse picking, aiming, sensors, and editor tooling.
- [ ] Add physics backend decision when simple collision is no longer enough.

### Tools and developer experience

- [ ] Add visual debug overlays.
- [x] Add initial game inspection snapshots for debug overlays and editor panels.
- [x] Add lifecycle-bound scene scheduling for timers, cooldowns, waves, and debug refreshes.
- [x] Add prefab-style entity blueprints for reusable hierarchies.
- [x] Add debug ray visuals for ray-query and sensor debugging.
- [ ] Add starter templates by game style.
- [ ] Add example cookbook.
- [ ] Add profiling and performance guidance.
- [ ] Add multiplayer support.
- [ ] Add anti-cheat guidance and hooks.

### Ecosystem

- [ ] Establish contribution guidelines.
- [ ] Add package/versioning strategy.
- [ ] Create project website/docs site.
- [ ] Add community demo gallery when ready.
- [ ] Add Tauri support for desktop and mobile builds.
- [ ] Add React and Svelte adapters.

## Design principles

- Keep the default path simple.
- Preserve lower-level escape hatches.
- Promote patterns only after they appear in more than one demo.
- Keep demos as examples of public engine usage, not as hidden requirements for engine modification.
- Avoid framework coupling in runtime and renderer.
- Build demos that feel playable, not just technically correct.
- Grow toward engine-scale capability through staged systems, not speculative rewrites.
