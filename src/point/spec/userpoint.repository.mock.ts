import { UserPointRepository } from 'src/database/userpoint/userpoint.repository';

const userPointRepositoryMock: UserPointRepository = {
  selectById: jest.fn(),
  insertOrUpdate: jest.fn(),
};

export default userPointRepositoryMock;
