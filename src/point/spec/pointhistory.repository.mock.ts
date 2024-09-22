import { PointHistoryRepository } from 'src/database/pointhistory/pointhistory.repository';

const pointHistoryRepositoryMock: PointHistoryRepository = {
  insert: jest.fn(),
  selectAllByUserId: jest.fn(),
};

export default pointHistoryRepositoryMock;
