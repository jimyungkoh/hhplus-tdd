export const WithUserLockMock = jest.fn().mockImplementation(() => {
  return function (_: any, __: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      return await originalMethod.apply(this, args);
    };
    return descriptor;
  };
});
