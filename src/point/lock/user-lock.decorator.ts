export function WithUserLock() {
  return function (_: any, __: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const userId = args[0];
      const lock = this.lockManager.getLock(userId);

      await lock.acquire();
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        throw error;
      } finally {
        lock.release();
      }
    };
    return descriptor;
  };
}
