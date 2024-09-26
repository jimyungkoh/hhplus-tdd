import { LockManager } from 'src/point/lock/timeout-spin.lock';

const createTimeoutSpinLockMock = () => {
  return {
    acquire: jest.fn().mockResolvedValue(undefined),
    release: jest.fn(),
  };
};

const lockManagerMock: LockManager = {
  locks: new Map(),
  getLock: jest.fn().mockReturnValue({
    acquire: jest.fn().mockResolvedValue(createTimeoutSpinLockMock()),
    release: jest.fn(),
  }),
};

export default lockManagerMock;
