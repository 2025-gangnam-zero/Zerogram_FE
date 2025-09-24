type Handler<T = any> = (payload?: T) => void;

class EventBus {
  private map = new Map<string, Set<Handler>>();

  on(event: string, cb: Handler) {
    if (!this.map.has(event)) this.map.set(event, new Set());
    this.map.get(event)!.add(cb);
    return () => this.off(event, cb);
  }

  off(event: string, cb: Handler) {
    this.map.get(event)?.delete(cb);
  }

  emit<T = any>(event: string, payload?: T) {
    this.map.get(event)?.forEach((cb) => cb(payload));
  }
}

export const eventBus = new EventBus();
