import DefaultTheme from 'vitepress/theme';
import HomePage from './components/HomePage.vue';
import DemoFrame from './components/DemoFrame.vue';
import DemoGallery from './components/DemoGallery.vue';
import './custom.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('HomePage', HomePage);
    app.component('DemoFrame', DemoFrame);
    app.component('DemoGallery', DemoGallery);
  },
};
