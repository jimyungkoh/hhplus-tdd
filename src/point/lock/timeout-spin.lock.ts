export class TimeoutSpinLock {
  private locked = false;

  async acquire(timeoutMs: number = 50_000): Promise<void> {
    const startTime = Date.now();
    while (!this.tryLock()) {
      if (Date.now() - startTime > timeoutMs) {
        throw new Error('Lock acquisition timed out');
      }
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }

  private tryLock(): boolean {
    if (!this.locked) {
      this.locked = true;
      return true;
    }
    return false;
  }

  release(): void {
    this.locked = false;
  }
}

export class LockManager {
  private static instance: LockManager;
  readonly locks: Map<number, TimeoutSpinLock>;

  private constructor() {
    this.locks = new Map();
  }

  static getInstance(): LockManager {
    if (!LockManager.instance) {
      LockManager.instance = new LockManager();
    }

    return LockManager.instance;
  }

  getLock(id: number): TimeoutSpinLock {
    if (!this.locks.has(id)) {
      this.locks.set(id, new TimeoutSpinLock());
    }
    return this.locks.get(id);
  }
}
