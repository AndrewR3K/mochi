import { computed, shallowRef } from 'vue';

import type { DemoDefinition, DemoId } from '../demoRegistry';

export function usePlaygroundDemoSelection(demos: readonly DemoDefinition[]) {
  const params = new URLSearchParams(window.location.search);
  const initial = params.get('demo') as DemoId | null;

  const selectedDemo = shallowRef<DemoId>(
    initial && demos.some((demo) => demo.id === initial) ? initial : demos[0].id,
  );

  const currentDemo = computed(
    () => demos.find((demo) => demo.id === selectedDemo.value) ?? demos[0],
  );

  function selectDemo(id: DemoId) {
    selectedDemo.value = id;

    const url = new URL(window.location.href);
    url.searchParams.set('demo', id);
    window.history.replaceState({}, '', url);
  }

  return { selectedDemo, currentDemo, selectDemo };
}
