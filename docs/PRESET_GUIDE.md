# Choosing Camera + Controls

Pick presets by camera/control model first, then genre.

## Presets

- `firstPerson` - direct look + strafe movement
- `thirdPersonOrbit` - character focus with free orbit
- `thirdPersonOverShoulder` - tighter combat framing
- `topDown` - overhead tactical control
- `isometric` - fixed angled camera
- `sideScroller2D` - side view movement lane
- `vehicleArcade` - fast, forgiving chase camera
- `vehicleSim` - heavier, steadier vehicle feel
- `railCamera` - constrained cinematic movement
- `strategyFreeCam` - detached map camera

## Fast mapping by game type

- Arena FPS -> `firstPerson`
- Third-person action shooter -> `thirdPersonOverShoulder`
- Adventure/platformer -> `thirdPersonOrbit`
- ARPG/RTS-lite -> `isometric` or `topDown`
- Kart/arcade racer -> `vehicleArcade`
- Sim racer -> `vehicleSim`

## API patterns

### Explicit constructor

```ts
import { createThirdPersonOrbitController } from '@lite3d/game';
const controller = createThirdPersonOrbitController(game, { target: player });
```

### Registry style

```ts
import { createControllerPreset } from '@lite3d/game';
const controller = createControllerPreset(game, 'thirdPersonOrbit', { target: player });
```

## Tuning tips

- Start with movement speed and camera distance.
- Tune sensitivity and camera lerp before adding special logic.
- Keep defaults unless you have a clear gameplay reason.
- Add a new preset only if multiple projects need the same tuned profile.

