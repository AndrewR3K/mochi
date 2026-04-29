# Roadmap

This roadmap is intentionally practical. The long-term goal is a full-featured, AAA-capable web game engine that can be used by anyone, while the near-term work stays grounded in playable vertical slices.

## North star

`lite3d` should eventually provide the kinds of systems expected from a serious game engine:

- robust scene/world runtime
- scalable rendering pipeline
- animation and asset workflows
- physics/collision and gameplay framework
- audio, input, camera, networking-ready architecture
- tooling, debugging, profiling, and editor-like workflows
- approachable APIs and templates for solo developers and teams

The engine should not become complex by default. AAA-level capability should be layered behind simple entry points.

## Current status

- Headless runtime package exists.
- Custom WebGL2 renderer package exists.
- Game facade exists.
- Vue visibility layer exists.
- Controller preset taxonomy exists.
- Playground has multiple demos:
  - `Nightfall Run`
  - `Orbital Islands`
  - `Velocity Circuit`

## Near-term checklist

### Runtime

- [ ] Add stable entity/component helpers without overbuilding a full ECS.
- [x] Add scene lifecycle helpers (`createScene`, `mountScene`, `disposeScene`).
- [ ] Add runtime-level collision primitives (`box`, `sphere`, `trigger`) so demos stop reimplementing collision locally.
- [ ] Add event/channel helpers for score, damage, collection, and mission events.
- [ ] Add deterministic fixed-step mode examples.

### Rendering

- [ ] Add basic directional/ambient lighting.
- [ ] Add per-face or simple normal shading for cube/plane geometry.
- [ ] Add debug rendering for bounds, triggers, and controller targets.
- [ ] Add simple material presets (`solid`, `emissive`, `warning`, `neutral`).
- [ ] Add asset-loading direction after engine boundaries stabilize.

### Game facade

- [x] Add scene mounting APIs that handle controller/listener/entity cleanup.
- [ ] Add controller preset docs with live examples.
- [x] Add collision/world helper APIs promoted from playground patterns.
- [ ] Add reset/replay helpers for demos and small games.
- [ ] Add input binding config (`WASD`, arrows, gamepad-ready shape).

### Vue layer

- [ ] Add a reusable demo shell/HUD pattern.
- [ ] Add composables for game stats and scene state.
- [ ] Keep Vue out of hot-loop simulation data.
- [ ] Add examples for HUD-only Vue updates from runtime state.

### Playground demos

- [ ] Add a preset playground that can switch camera/control modes live.
- [ ] Add a first-person demo.
- [ ] Add a top-down or isometric tactics demo.
- [x] Improve `Velocity Circuit` with vehicle-feeling steering instead of character-style movement.
- [ ] Add visual debug toggles.

## Medium-term checklist

- [ ] Package public API docs.
- [ ] Add tests for math, runtime input, controller presets, and scene cleanup.
- [ ] Add release workflow.
- [ ] Add example starter template.
- [ ] Decide package publishing strategy.

## Long-term platform checklist

### Runtime and world

- [ ] Move from basic entities toward a stable scene/world architecture.
- [ ] Add transform hierarchy and parent/child relationships.
- [ ] Add serializable scene format.
- [ ] Add save/load and snapshot support.
- [ ] Add worker/off-main-thread exploration for simulation.

### Rendering

- [ ] Add lighting model progression: flat -> normal shading -> PBR direction.
- [ ] Add camera stack and post-processing direction.
- [ ] Add shadows once lighting and materials are stable.
- [ ] Add instancing and batching for scale.
- [ ] Add WebGPU backend exploration after WebGL2 renderer matures.

### Assets and animation

- [ ] Decide asset pipeline strategy.
- [ ] Add mesh/texture/material loading.
- [ ] Add animation clips and playback.
- [ ] Add import pipeline for common game assets.

### Physics and gameplay

- [ ] Promote collision helpers into reusable engine primitives.
- [ ] Add character controller foundations.
- [ ] Add trigger volumes, hitboxes, and damage zones.
- [ ] Add physics backend decision when simple collision is no longer enough.

### Tools and developer experience

- [ ] Add visual debug overlays.
- [ ] Add scene inspection tools.
- [ ] Add starter templates by game style.
- [ ] Add example cookbook.
- [ ] Add profiling and performance guidance.

### Ecosystem

- [ ] Establish contribution guidelines.
- [ ] Add package/versioning strategy.
- [ ] Create project website/docs site.
- [ ] Add community demo gallery when ready.

## Design principles

- Keep the default path simple.
- Preserve lower-level escape hatches.
- Promote patterns only after they appear in more than one demo.
- Avoid framework coupling in runtime and renderer.
- Build demos that feel playable, not just technically correct.
- Grow toward AAA capability through staged systems, not speculative rewrites.

