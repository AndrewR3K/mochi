export type EventListener<T> = (event: T) => void;

export interface EventSignal<T> {
  on(listener: EventListener<T>): () => void;
  once(listener: EventListener<T>): () => void;
  emit(event: T): void;
  clear(): void;
}

export function createEventSignal<T>(): EventSignal<T> {
  const listeners = new Set<EventListener<T>>();

  const signal: EventSignal<T> = {
    on(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    once(listener) {
      const unsubscribe = signal.on((event) => {
        unsubscribe();
        listener(event);
      });
      return unsubscribe;
    },
    emit(event) {
      for (const listener of listeners) {
        listener(event);
      }
    },
    clear() {
      listeners.clear();
    },
  };

  return signal;
}
