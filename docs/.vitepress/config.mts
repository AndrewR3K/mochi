import { defineConfig } from 'vitepress';
import { fileURLToPath, URL } from 'node:url';

const base = process.env.BASE_PATH ?? '/';
const assetPath = (path: string) => `${base}${path.replace(/^\//, '')}`;
const siteUrl = 'https://andrewr3k.github.io/mochi/';
const siteDescription =
  'Mochi is a Vue-first TypeScript 3D game engine for browser games, with WebGL rendering, controller presets, scene lifecycle helpers, and npm packages.';

export default defineConfig({
  title: 'Mochi | Vue-First 3D Game Engine for Browser Games',
  description: siteDescription,
  base,
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['meta', { name: 'theme-color', content: '#19c37d' }],
    ['meta', { name: 'description', content: siteDescription }],
    [
      'meta',
      {
        name: 'keywords',
        content:
          'Vue game engine, TypeScript game engine, WebGL game engine, browser game engine, JavaScript 3D game engine, web game development',
      },
    ],
    ['link', { rel: 'icon', href: assetPath('/favicon.ico'), sizes: 'any' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: assetPath('/favicon-32x32.png') }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: assetPath('/favicon-16x16.png') }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: assetPath('/apple-touch-icon.png') }],
    ['link', { rel: 'manifest', href: assetPath('/site.webmanifest') }],
    ['link', { rel: 'canonical', href: siteUrl }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'Mochi | Vue-First 3D Game Engine' }],
    [
      'meta',
      {
        property: 'og:description',
        content: siteDescription,
      },
    ],
    ['meta', { property: 'og:url', content: siteUrl }],
    ['meta', { property: 'og:image', content: assetPath('/hero-scene.png') }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'Mochi | Vue-First 3D Game Engine' }],
    ['meta', { name: 'twitter:description', content: siteDescription }],
    ['meta', { name: 'twitter:image', content: assetPath('/hero-scene.png') }],
    [
      'script',
      { type: 'application/ld+json' },
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Mochi',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Web',
        programmingLanguage: 'TypeScript',
        description: siteDescription,
        url: siteUrl,
        codeRepository: 'https://github.com/AndrewR3K/mochi',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      }),
    ],
  ],
  themeConfig: {
    logo: {
      light: '/mochi-logo.png',
      dark: '/mochi-logo-darkmode.png',
      alt: 'Mochi',
    },
    siteTitle: false,
    nav: [
      { text: 'Guide', link: '/GETTING_STARTED' },
      { text: 'Demos', link: '/DEMOS' },
      { text: 'Tutorials', link: '/FIRST_GAME' },
      { text: 'API', link: '/API_REFERENCE' },
      { text: 'Roadmap', link: '/ROADMAP' },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/AndrewR3K/mochi' }],
    search: {
      provider: 'local',
    },
    sidebar: [
      {
        text: 'Start Here',
        items: [
          { text: 'Getting Started', link: '/GETTING_STARTED' },
          { text: 'First Game in 10 Minutes', link: '/FIRST_GAME' },
          { text: 'Alpha Release', link: '/ALPHA_RELEASE' },
          { text: 'Developer Resources', link: '/RESOURCES' },
        ],
      },
      {
        text: 'Demos',
        items: [
          { text: 'All Demos', link: '/DEMOS' },
          { text: 'Nightfall Run', link: '/demos/nightfall' },
          { text: 'Orbital Islands', link: '/demos/orbital' },
          { text: 'Starfield Drift', link: '/demos/starfield' },
          { text: 'Velocity Circuit', link: '/demos/velocity' },
          { text: 'Preset Lab', link: '/demos/presets' },
          { text: 'First Person Range', link: '/demos/range' },
          { text: 'Tactics Board', link: '/demos/tactics' },
        ],
      },
      {
        text: 'Build With Mochi',
        items: [
          { text: 'Camera + Controls', link: '/PRESET_GUIDE' },
          { text: 'Project Layout', link: '/PROJECT_LAYOUT' },
          { text: 'External Developer Workflow', link: '/EXTERNAL_DEVELOPER_WORKFLOW' },
          { text: 'API Reference Direction', link: '/API_REFERENCE' },
        ],
      },
      {
        text: 'Project',
        items: [
          { text: 'Roadmap', link: '/ROADMAP' },
          { text: 'Recent Changes', link: '/RECENT_CHANGES' },
          { text: 'Discussions', link: '/DISCUSSIONS' },
          { text: 'Licensing', link: '/LICENSING' },
        ],
      },
      {
        text: 'Maintainers',
        items: [
          { text: 'Versioning', link: '/VERSIONING' },
          { text: 'Release Process', link: '/RELEASE_PROCESS' },
          { text: 'Repository Settings', link: '/REPOSITORY_SETTINGS' },
        ],
      },
    ],
    footer: {
      message: `Released under the <a href="${base}LICENSING">Mochi license</a>.`,
      copyright: 'Copyright © 2026 Mochi contributors',
    },
  },
  vite: {
    publicDir: fileURLToPath(new URL('../assets', import.meta.url)),
    resolve: {
      alias: {
        '@theme/index': fileURLToPath(new URL('./theme/index.ts', import.meta.url)),
      },
    },
  },
});
