export type DemoId =
  | 'nightfall'
  | 'orbital'
  | 'starfield'
  | 'velocity'
  | 'presets'
  | 'range'
  | 'tactics';

export const demos = [
  {
    id: 'nightfall',
    title: 'Nightfall Run',
    description: 'Atmospheric runner-style scene with moody lighting and movement.',
  },
  {
    id: 'orbital',
    title: 'Orbital Islands',
    description: 'Floating island scene for platforming and spatial navigation.',
  },
  {
    id: 'starfield',
    title: 'Starfield Drift',
    description: 'Spaceflight-style camera and movement demo.',
  },
  {
    id: 'velocity',
    title: 'Velocity Circuit',
    description: 'Fast arcade movement and vehicle-like control feel.',
  },
  {
    id: 'presets',
    title: 'Preset Lab',
    description: 'Camera and controller preset testing playground.',
  },
  {
    id: 'range',
    title: 'First Person Range',
    description: 'First-person camera, aiming, and range-style interaction.',
  },
  {
    id: 'tactics',
    title: 'Tactics Board',
    description: 'Strategy-board style camera and entity layout demo.',
  },
] as const;
