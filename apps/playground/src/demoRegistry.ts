import type { Component } from 'vue';

import FirstPersonRangeDemo from './demos/FirstPersonRangeDemo.vue';
import NightfallDemo from './DemoScene.vue';
import OrbitalIslandsDemo from './demos/OrbitalIslandsDemo.vue';
import PresetLabDemo from './demos/PresetLabDemo.vue';
import StarfieldDriftDemo from './demos/StarfieldDriftDemo.vue';
import TacticsBoardDemo from './demos/TacticsBoardDemo.vue';
import VelocityCircuitDemo from './demos/VelocityCircuitDemo.vue';

export type DemoId =
  | 'nightfall'
  | 'orbital'
  | 'starfield'
  | 'velocity'
  | 'presets'
  | 'range'
  | 'tactics';

export interface DemoDefinition {
  readonly id: DemoId;
  readonly label: string;
  readonly component: Component;
}

export const demoRegistry: readonly DemoDefinition[] = [
  { id: 'nightfall', label: 'Nightfall Run', component: NightfallDemo },
  { id: 'orbital', label: 'Orbital Islands', component: OrbitalIslandsDemo },
  { id: 'starfield', label: 'Starfield Drift', component: StarfieldDriftDemo },
  { id: 'velocity', label: 'Velocity Circuit', component: VelocityCircuitDemo },
  { id: 'presets', label: 'Preset Lab', component: PresetLabDemo },
  { id: 'range', label: 'First Person Range', component: FirstPersonRangeDemo },
  { id: 'tactics', label: 'Tactics Board', component: TacticsBoardDemo },
];
