export type GlobalBanner = (
  | { autoDismiss: true; autoDismissMs?: number }
  | { autoDismiss?: false; autoDismissMs?: never }
) & {
  description: string;
  id: string;
  timestamp: Date;
  title: string;
  variant: "destructive" | "info" | "success" | "warning";
};

type Listener = () => void;

type State = { banners: GlobalBanner[] };

function createGlobalBannerStore() {
  let state: State = { banners: [] };

  const listeners = new Set<Listener>();
  const timers = new Map<string, ReturnType<typeof setTimeout>>();

  const getState = () => state;

  const emit = () => {
    for (const listener of listeners) {
      listener();
    }
  };

  const setState = (next: State) => {
    state = next;
    emit();
  };

  const subscribe = (listener: Listener) => {
    listeners.add(listener);
    listener();

    return () => {
      listeners.delete(listener);
    };
  };

  const add = (
    banner: Omit<GlobalBanner, "id" | "timestamp"> & { id?: string },
  ) => {
    const bannerId = banner.id ?? crypto.randomUUID();

    const newBanner = {
      ...banner,
      ...((banner.autoDismiss ?? true)
        ? { autoDismiss: true, autoDismissMs: banner.autoDismissMs ?? 7000 }
        : { autoDismiss: false }),
      id: bannerId,
      timestamp: new Date(),
    } as GlobalBanner;

    const existingIndex = state.banners.findIndex((b) => b.id === bannerId);

    const next =
      existingIndex === -1
        ? [...state.banners, newBanner]
        : state.banners.map((b, index) =>
            index === existingIndex ? newBanner : b,
          );

    setState({ banners: next });

    if (newBanner.autoDismiss) {
      const existingTimer = timers.get(bannerId);
      if (existingTimer) clearTimeout(existingTimer);

      const timer = setTimeout(() => {
        remove(bannerId);
      }, newBanner.autoDismissMs);

      timers.set(bannerId, timer);
    }

    return bannerId;
  };

  const remove = (id: string) => {
    setState({ banners: state.banners.filter((b) => b.id !== id) });

    const timer = timers.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.delete(id);
    }
  };

  const clearAll = () => {
    for (const timer of timers.values()) {
      clearTimeout(timer);
    }
    timers.clear();

    setState({ banners: [] });
  };

  return {
    add,
    clearAll,
    getState,
    remove,
    subscribe,
  };
}

export const globalBannerStore = createGlobalBannerStore();
