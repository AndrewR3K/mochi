<template>
  <main class="home-shell">
    <section class="home-hero">
      <div class="hero-copy">
        <div class="hero-kicker">Vue-first 3D game engine</div>
        <h1>Build browser games<br />with <span>Vue.js</span></h1>
        <p>
          Mochi is a TypeScript game engine for web-native 3D projects. Ship a playable scene faster
          with Vue canvas hosting, WebGL rendering, controller presets, scene lifecycle helpers, and npm packages
          that fit into the frontend stack you already know.
        </p>
        <div class="hero-actions">
          <a class="button button-primary" href="./GETTING_STARTED">Start Building</a>
          <a class="button button-secondary" href="https://github.com/AndrewR3K/mochi">View on GitHub</a>
        </div>
        <div class="hero-tags" aria-label="Project traits">
          <span>Install from npm</span>
          <span>Vue + TypeScript</span>
          <span>Browser-native WebGL</span>
        </div>
      </div>

      <div class="hero-visual" aria-label="Code and forest scene preview">
        <div class="mascot-crop">
          <img :src="withBase('/mochi-mascot.png')" alt="Mochi mascot" />
        </div>
        <div class="builder-window">
          <div class="code-pane">
            <div class="window-bar">
              <span>App.vue</span>
              <span>npm install @mochi-labs/vue@alpha</span>
            </div>
            <pre><code><span class="token tag">&lt;GameCanvas</span> <span class="token attr">:runtime</span><span class="token operator">=</span><span class="token string">"{ fixedStep: 1 / 60 }"</span><span class="token tag">&gt;</span>
  <span class="token tag">&lt;FirstGameScene</span> <span class="token tag">/&gt;</span>
<span class="token tag">&lt;/GameCanvas&gt;</span></code></pre>
          </div>
          <div class="scene-pane">
            <img :src="withBase('/hero-scene.png')" alt="Stylized forest game scene" />
            <div class="scene-badge">60 FPS</div>
          </div>
        </div>
        <div class="floating-star star-one" aria-hidden="true"></div>
        <div class="floating-star star-two" aria-hidden="true"></div>
      </div>
    </section>

    <section class="feature-section" aria-labelledby="features-title">
      <p class="section-kicker">Features</p>
      <h2 id="features-title">The fast path from Vue app to playable 3D game</h2>
      <div class="feature-grid">
        <article v-for="feature in features" :key="feature.title" class="feature-card">
          <div class="feature-icon" aria-hidden="true">
            <IconGlyph :name="feature.icon" />
          </div>
          <div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.text }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="examples-section" aria-labelledby="examples-title">
      <p class="section-kicker">Examples</p>
      <h2 id="examples-title">Game patterns you can actually build from</h2>
      <div class="example-grid">
        <article v-for="example in examples" :key="example.title" class="example-card">
          <img class="example-art" :src="withBase(example.image)" :alt="example.title" />
          <h3>{{ example.title }}</h3>
          <p>{{ example.text }}</p>
        </article>
      </div>
    </section>

    <section class="model-section" aria-label="Mochi mental model">
      <div>
        <p class="section-kicker">Why Mochi</p>
        <h2>Game engine power without leaving the web stack</h2>
        <p>
          Mochi keeps the engine model approachable: entities describe the world, scenes own lifecycle,
          systems run gameplay, and Vue handles HUDs, menus, overlays, and tools.
        </p>
        <a href="./RESOURCES">Explore developer resources</a>
      </div>
      <div class="model-flow">
        <article v-for="step in modelSteps" :key="step.title" class="model-step">
          <div class="model-icon" aria-hidden="true">
            <IconGlyph :name="step.icon" />
          </div>
          <h3>{{ step.title }}</h3>
          <p>{{ step.text }}</p>
        </article>
      </div>
    </section>

    <section class="cta-section">
      <div class="mascot-small">
        <img :src="withBase('/mochi-mascot.png')" alt="" />
      </div>
      <div>
        <h2>Ready to make something playable?</h2>
        <p>Install Mochi, mount the canvas, and build a tiny 3D scene with movement, collision, and debug visuals.</p>
      </div>
      <a class="button button-primary" href="./FIRST_GAME">Build the Tutorial</a>
    </section>
  </main>
</template>

<script setup lang="ts">
import { withBase } from 'vitepress';
import { defineComponent, h } from 'vue';

const iconPaths: Record<string, string[]> = {
  vue: ['M4 6h5l3 5 3-5h5l-8 13L4 6Z', 'M8.5 6 12 12l3.5-6'],
  core: ['M5 9a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9Z', 'M9 9h6v6H9V9Z', 'M12 2v3M12 19v3M2 12h3M19 12h3'],
  renderer: ['M12 3 4.5 7.5v9L12 21l7.5-4.5v-9L12 3Z', 'M12 12 4.5 7.5M12 12l7.5-4.5M12 12v9'],
  controls: ['M7 14H5.5A3.5 3.5 0 0 1 2 10.5V10a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v.5a3.5 3.5 0 0 1-3.5 3.5H17l-2-2H9l-2 2Z', 'M7 9v4M5 11h4M16.5 10.5h.01M19 12.5h.01'],
  iterate: ['M5 12a7 7 0 0 1 12-5l2 2', 'M19 4v5h-5', 'M19 12a7 7 0 0 1-12 5l-2-2', 'M5 20v-5h5'],
  package: ['M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z', 'M4 7.5l8 4.5 8-4.5', 'M12 12v9'],
  scene: ['M4 18h16', 'M5 16l4-6 3 4 3-5 4 7', 'M7 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z'],
  systems: ['M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z', 'M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1'],
  assets: ['M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z', 'M7 13h10'],
};

const IconGlyph = defineComponent({
  props: {
    name: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    return () =>
      h(
        'svg',
        {
          class: 'icon-glyph',
          viewBox: '0 0 24 24',
          fill: 'none',
          xmlns: 'http://www.w3.org/2000/svg',
        },
        (iconPaths[props.name] ?? iconPaths.package).map((d) =>
          h('path', {
            d,
            stroke: 'currentColor',
            'stroke-width': 1.9,
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
          }),
        ),
      );
  },
});

const features = [
  {
    icon: 'vue',
    title: 'Vue where it shines',
    text: 'Use Vue for canvas hosting, HUDs, menus, and tools while Mochi keeps hot-loop simulation out of reactivity.',
  },
  {
    icon: 'core',
    title: 'Gameplay-ready runtime',
    text: 'World state, transforms, input, collision queries, snapshots, and fixed-step timing are ready on day one.',
  },
  {
    icon: 'renderer',
    title: 'WebGL for the browser',
    text: 'Render fast 3D scenes in the browser with a focused WebGL backend and lower-level escape hatches when needed.',
  },
  {
    icon: 'controls',
    title: 'Controls without the slog',
    text: 'Drop in first-person, third-person, vehicle, spaceflight, side-scroller, tactics, and strategy cameras.',
  },
  {
    icon: 'iterate',
    title: 'Prototype in minutes',
    text: 'Start from npm packages and grow toward production with tutorials, starter flows, and public package APIs.',
  },
  {
    icon: 'package',
    title: 'Modular by design',
    text: 'Use the Vue adapter for the happy path or reach for gameplay, renderer, and core packages directly.',
  },
];

const modelSteps = [
  {
    icon: 'package',
    title: 'Entities',
    text: 'Create stable game objects with transforms, tags, renderables, and reusable data.',
  },
  {
    icon: 'scene',
    title: 'Scenes',
    text: 'Own lifecycle, cameras, controllers, entities, and playable spaces.',
  },
  {
    icon: 'systems',
    title: 'Systems',
    text: 'Run movement, rules, input, collision, objectives, and timed behavior.',
  },
  {
    icon: 'assets',
    title: 'Assets',
    text: 'Load, cache, and reuse content across game flows.',
  },
];

const examples = [
  {
    title: 'Forest Explorer',
    text: 'Third-person collection, collision tuning, and debug visuals for your first playable loop.',
    image: '/example-forest-explorer.png',
  },
  {
    title: 'Neon Runner',
    text: 'Vehicle and camera presets for fast arcade movement, racing ideas, and kinetic prototypes.',
    image: '/example-neon-runner.png',
  },
  {
    title: 'Floating Islands',
    text: 'Platforming layouts, scene-owned entities, fixed-step updates, and replayable state.',
    image: '/example-floating-islands.png',
  },
];
</script>
