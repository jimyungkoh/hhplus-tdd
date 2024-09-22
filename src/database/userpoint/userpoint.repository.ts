import { UserPoint } from 'src/point/model/point.model';

export interface UserPointRepository {
  /**
   * @description 사용자의 포인트 정보 조회
   */
  selectById(id: number): Promise<UserPoint>;

  /**
   * @description 사용자의 포인트 정보 생성 또는 갱신
   */
  insertOrUpdate(id: number, amount: number): Promise<UserPoint>;
}
