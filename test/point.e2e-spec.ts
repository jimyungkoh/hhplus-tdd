import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { GlobalExceptionFilter } from 'src/common/filter/global-exception.filter';
import { TransactionType } from 'src/point/model/point.model';
import InjectionToken from 'src/database/injection.token';
import { UserPointRepository } from 'src/database/userpoint/userpoint.repository';
import { PointHistoryRepository } from 'src/database/pointhistory/pointhistory.repository';

describe('PointController (e2e)', () => {
  let app: INestApplication;
  let userPointRepository: UserPointRepository;
  let pointHistoryRepository: PointHistoryRepository;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        whitelist: true,
      }),
    );

    userPointRepository = moduleFixture.get(InjectionToken.UserPointRepository);
    pointHistoryRepository = moduleFixture.get(
      InjectionToken.PointHistoryRepository,
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('포인트 조회 API', () => {
    // 테스트 케이스: 유효한 사용자 ID로 포인트 조회
    // 작성 이유: 사용자의 포인트 정보를 정확히 반환하는지 확인
    test('유효한 사용자 ID로 포인트를 조회하면 200 상태코드와 함께 포인트 정보를 반환해야 한다', async () => {
      const userId = 1;
      const initialPoint = 1000;

      await userPointRepository.insertOrUpdate(userId, initialPoint);
      await pointHistoryRepository.insert(
        userId,
        initialPoint,
        TransactionType.CHARGE,
        Date.now(),
      );

      const response = await request(app.getHttpServer())
        .get(`/point/${userId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', userId);
      expect(response.body).toHaveProperty('point', initialPoint);
      expect(response.body).toHaveProperty('updateMillis');
    });

    // 테스트 케이스: 유효하지 않은 사용자 ID로 포인트 조회
    // 작성 이유: 잘못된 사용자 ID에 대해 적절한 에러 처리를 하는지 확인
    test('유효하지 않은 사용자 ID로 포인트를 조회하면 400 에러를 반환해야 한다', async () => {
      const invalidUserId = -1;

      await request(app.getHttpServer())
        .get(`/point/${invalidUserId}`)
        .expect(400);
    });
  });

  describe('포인트 충전 API', () => {
    // 테스트 케이스: 유효한 사용자 ID와 금액으로 포인트 충전
    // 작성 이유: 포인트 충전 기능이 정상적으로 작동하는지 확인
    test('유효한 사용자 ID와 금액으로 포인트를 충전하면 200 상태코드와 함께 업데이트된 포인트 정보를 반환해야 한다', async () => {
      const userId = 2;
      const initialAmount = 500;
      const chargeAmount = 1000;

      await userPointRepository.insertOrUpdate(userId, initialAmount);
      await pointHistoryRepository.insert(
        userId,
        initialAmount,
        TransactionType.CHARGE,
        Date.now(),
      );

      const response = await request(app.getHttpServer())
        .patch(`/point/${userId}/charge`)
        .send({ amount: chargeAmount })
        .expect(200);

      expect(response.body).toHaveProperty('id', userId);
      expect(response.body).toHaveProperty(
        'point',
        initialAmount + chargeAmount,
      );
      expect(response.body).toHaveProperty('updateMillis');
    });

    // 테스트 케이스: 유효하지 않은 금액으로 포인트 충전 시도
    // 작성 이유: 잘못된 충전 금액에 대해 적절한 에러 처리를 하는지 확인
    test('유효하지 않은 금액으로 포인트를 충전하려고 하면 400 에러를 반환해야 한다', async () => {
      const userId = 3;
      const invalidChargeAmount = -100;

      await request(app.getHttpServer())
        .patch(`/point/${userId}/charge`)
        .send({ amount: invalidChargeAmount })
        .expect(400);
    });
  });

  describe('포인트 사용 API', () => {
    // 테스트 케이스: 충분한 잔액으로 포인트 사용
    // 작성 이유: 포인트 사용 기능이 정상적으로 작동하는지 확인
    test('충분한 잔액이 있는 경우 포인트 사용 후 200 상태코드와 함께 업데이트된 포인트 정보를 반환해야 한다', async () => {
      const userId = 4;
      const initialPoint = 2000;
      const useAmount = 500;

      await userPointRepository.insertOrUpdate(userId, initialPoint);
      await pointHistoryRepository.insert(
        userId,
        initialPoint,
        TransactionType.USE,
        Date.now(),
      );

      const response = await request(app.getHttpServer())
        .patch(`/point/${userId}/use`)
        .send({ amount: useAmount })
        .expect(200);

      expect(response.body).toHaveProperty('id', userId);
      expect(response.body).toHaveProperty('point', initialPoint - useAmount);
      expect(response.body).toHaveProperty('updateMillis');
    });

    // 테스트 케이스: 잔액 부족으로 포인트 사용 실패
    // 작성 이유: 잔액 부족 시 적절한 에러 처리를 하는지 확인
    test('잔액이 부족한 경우 포인트 사용 시 400 에러를 반환해야 한다', async () => {
      const userId = 5;
      const initialPoint = 100;
      const useAmount = 500;

      await userPointRepository.insertOrUpdate(userId, initialPoint);

      await request(app.getHttpServer())
        .patch(`/point/${userId}/use`)
        .send({ amount: useAmount })
        .expect(400);
    });
  });
  });
  });
});
