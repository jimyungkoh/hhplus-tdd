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

  describe('포인트 내역 조회 API', () => {
    // 테스트 케이스: 유효한 사용자 ID로 포인트 내역 조회
    // 작성 이유: 포인트 내역 조회 기능이 정상적으로 작동하는지 확인
    test('유효한 사용자 ID로 포인트 내역을 조회하면 200 상태코드와 함께 내역 목록을 반환해야 한다', async () => {
      const userId = 6;
      const chargeAmount = 1000;
      const useAmount = 500;

      await userPointRepository.insertOrUpdate(userId, chargeAmount);
      await pointHistoryRepository.insert(
        userId,
        chargeAmount,
        TransactionType.CHARGE,
        Date.now(),
      );
      await pointHistoryRepository.insert(
        userId,
        useAmount,
        TransactionType.USE,
        Date.now(),
      );

      const response = await request(app.getHttpServer())
        .get(`/point/${userId}/histories`)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('userId', userId);
      expect(response.body[0]).toHaveProperty('amount', chargeAmount);
      expect(response.body[1]).toHaveProperty('userId', userId);
      expect(response.body[1]).toHaveProperty('amount', useAmount);
    });
  });

  describe('동시성 테스트', () => {
    // 테스트 케이스: 동시 포인트 충전
    // 작성 이유: 여러 요청이 동시에 처리될 때 경쟁 상태 없이 정확한 결과를 반환하는지 확인
    test('여러 요청이 동시에 포인트를 충전할 때 경쟁 상태 없이 정확한 결과를 반환해야 한다', async () => {
      const userId = 7;
      const initialPoint = 1000;
      const chargeAmount = 100;
      const concurrentRequests = 10;

      await userPointRepository.insertOrUpdate(userId, initialPoint);

      const chargePromises = Array(concurrentRequests)
        .fill(null)
        .map(() =>
          request(app.getHttpServer())
            .patch(`/point/${userId}/charge`)
            .send({ amount: chargeAmount }),
        );

      await Promise.all(chargePromises);

      const finalPointResponse = await request(app.getHttpServer())
        .get(`/point/${userId}`)
        .expect(200);

      const expectedFinalPoint =
        initialPoint + chargeAmount * concurrentRequests;
      expect(finalPointResponse.body).toHaveProperty(
        'point',
        expectedFinalPoint,
      );
    });

    // 테스트 케이스: 동시 포인트 사용
    // 작성 이유: 여러 요청이 동시에 처리될 때 경쟁 상태 없이 정확한 결과를 반환하는지 확인
    test('여러 요청이 동시에 포인트를 사용할 때 경쟁 상태 없이 정확한 결과를 반환해야 한다', async () => {
      const userId = 8;
      const initialPoint = 10000;
      const useAmount = 100;
      const concurrentRequests = 10;

      await userPointRepository.insertOrUpdate(userId, initialPoint);

      const usePromises = Array(concurrentRequests)
        .fill(null)
        .map(() =>
          request(app.getHttpServer())
            .patch(`/point/${userId}/use`)
            .send({ amount: useAmount }),
        );

      await Promise.all(usePromises);

      const finalPointResponse = await request(app.getHttpServer())
        .get(`/point/${userId}`)
        .expect(200);

      const expectedFinalPoint = initialPoint - useAmount * concurrentRequests;
      expect(finalPointResponse.body).toHaveProperty(
        'point',
        expectedFinalPoint,
      );
    });

    // 테스트 케이스: 대량의 동시 포인트 충전
    // 작성 이유: 많은 수의 동시 요청에도 시스템이 정확하게 동작하는지 확인
    test('100개의 요청이 동시에 포인트를 충전할 때 순서를 보장하며 정확한 결과를 반환해야 한다', async () => {
      const userId = 13;
      const chargeAmount = 10;
      const concurrentRequests = 100;

      const chargePromises = Array(concurrentRequests)
        .fill(null)
        .map(() =>
          request(app.getHttpServer())
            .patch(`/point/${userId}/charge`)
            .send({ amount: chargeAmount }),
        );

      await Promise.all(chargePromises);

      const finalPointResponse = await request(app.getHttpServer())
        .get(`/point/${userId}`)
        .expect(200);

      const expectedFinalPoint = chargeAmount * concurrentRequests;
      expect(finalPointResponse.body).toHaveProperty(
        'point',
        expectedFinalPoint,
      );
    }, 40_000); // Increase timeout to 40 seconds
  });

  describe('다중 사용자 동시성 테스트', () => {
    // 테스트 케이스: 여러 사용자의 동시 포인트 충전 및 사용
    // 작성 이유: 다중 사용자 환경에서 각 사용자의 요청이 독립적으로 처리되는지 확인
    test('여러 사용자가 동시에 포인트를 충전하고 사용할 때 각 사용자의 요청이 독립적으로 처리되어야 한다', async () => {
      const user1Id = 9;
      const user2Id = 10;
      const initialPoint = 2000;
      const chargeAmount = 500;
      const useAmount = 300;
      const concurrentRequests = 3;

      await userPointRepository.insertOrUpdate(user1Id, initialPoint);
      await userPointRepository.insertOrUpdate(user2Id, initialPoint);

      const user1ChargePromises = Array(concurrentRequests)
        .fill(null)
        .map(() =>
          request(app.getHttpServer())
            .patch(`/point/${user1Id}/charge`)
            .send({ amount: chargeAmount }),
        );

      const user2UsePromises = Array(concurrentRequests)
        .fill(null)
        .map(() =>
          request(app.getHttpServer())
            .patch(`/point/${user2Id}/use`)
            .send({ amount: useAmount }),
        );

      await Promise.all([...user1ChargePromises, ...user2UsePromises]);

      const user1FinalPoint = await request(app.getHttpServer())
        .get(`/point/${user1Id}`)
        .expect(200);

      const user2FinalPoint = await request(app.getHttpServer())
        .get(`/point/${user2Id}`)
        .expect(200);

      const expectedUser1FinalPoint =
        initialPoint + chargeAmount * concurrentRequests;
      const expectedUser2FinalPoint =
        initialPoint - useAmount * concurrentRequests;

      expect(user1FinalPoint.body).toHaveProperty(
        'point',
        expectedUser1FinalPoint,
      );
      expect(user2FinalPoint.body).toHaveProperty(
        'point',
        expectedUser2FinalPoint,
      );
    }, 10_000);

    // 테스트 케이스: 처리 시간이 다른 사용자 요청의 독립성
    // 작성 이유: 한 사용자의 요청 처리 시간이 길어져도 다른 사용자의 요청 처리에 영향을 주지 않는지 확인
    test('한 사용자의 요청 처리 시간이 길어져도 다른 사용자의 요청 처리에 영향을 주지 않아야 한다', async () => {
      const user1Id = 11; // 처리 시간이 긴 사용자
      const user2Id = 12; // 일반 사용자
      const initialPoint = 1000;
      const chargeAmount = 500;

      await userPointRepository.insertOrUpdate(user1Id, initialPoint);
      await userPointRepository.insertOrUpdate(user2Id, initialPoint);

      const user1SlowChargePromise = new Promise<void>((resolve) => {
        setTimeout(async () => {
          await request(app.getHttpServer())
            .patch(`/point/${user1Id}/charge`)
            .send({ amount: chargeAmount })
            .expect(200);
          resolve();
        }, 1000); // 1초 지연
      });

      const startTime = Date.now();
      const user2FastChargePromise = request(app.getHttpServer())
        .patch(`/point/${user2Id}/charge`)
        .send({ amount: chargeAmount })
        .expect(200);

      await Promise.all([user1SlowChargePromise, user2FastChargePromise]);

      const endTime = Date.now();
      const user2ProcessingTime = endTime - startTime;

      expect(user2ProcessingTime).toBeLessThan(2000); // 2초 미만으로 수정

      const user1FinalPoint = await request(app.getHttpServer())
        .get(`/point/${user1Id}`)
        .expect(200);

      const user2FinalPoint = await request(app.getHttpServer())
        .get(`/point/${user2Id}`)
        .expect(200);

      expect(user1FinalPoint.body).toHaveProperty(
        'point',
        initialPoint + chargeAmount,
      );
      expect(user2FinalPoint.body).toHaveProperty(
        'point',
        initialPoint + chargeAmount,
      );
    }, 10_000);
  });

  // 테스트 케이스: 복합 시나리오 테스트
  // 작성 이유: 여러 사용자의 다양한 포인트 충전 및 사용 시나리오가 올바르게 처리되는지 확인
  test('여러 사용자의 포인트 충전 및 사용 시나리오가 올바르게 처리되어야 한다', async () => {
    const users = [1, 2, 3];

    // 시나리오 실행
    const scenarios = [
      { userId: 1, action: 'charge', amount: 4000, expectedStatus: 200 },
      { userId: 2, action: 'charge', amount: 1000, expectedStatus: 200 },
      { userId: 3, action: 'charge', amount: 2000, expectedStatus: 200 },
      { userId: 1, action: 'use', amount: 100, expectedStatus: 200 },
      { userId: 3, action: 'use', amount: 3000, expectedStatus: 400 },
      { userId: 2, action: 'charge', amount: 3000, expectedStatus: 200 },
      { userId: 3, action: 'use', amount: 6000, expectedStatus: 400 },
      { userId: 1, action: 'charge', amount: 500, expectedStatus: 200 },
    ];

    for (const scenario of scenarios) {
      await request(app.getHttpServer())
        .patch(`/point/${scenario.userId}/${scenario.action}`)
        .send({ amount: scenario.amount })
        .expect(scenario.expectedStatus);
    }

    // 최종 포인트 확인
    const finalPoints = await Promise.all(
      users.map((userId) =>
        request(app.getHttpServer()).get(`/point/${userId}`).expect(200),
      ),
    );

    const expectedFinalPoints = [4400, 4000, 2000];
    finalPoints.forEach((response, index) => {
      expect(response.body).toHaveProperty('point', expectedFinalPoints[index]);
    });

    const expectedHistories = {
      1: [
        { userId: 1, amount: 4000, type: 0 }, // TransactionType.CHARGE
        { userId: 1, amount: 100, type: 1 }, // TransactionType.USE
        { userId: 1, amount: 500, type: 0 }, // TransactionType.CHARGE
      ],
      2: [
        { userId: 2, amount: 1000, type: 0 }, // TransactionType.CHARGE
        { userId: 2, amount: 3000, type: 0 }, // TransactionType.CHARGE
      ],
      3: [
        { userId: 3, amount: 2000, type: 0 }, // TransactionType.CHARGE
      ],
    };

    // 포인트 내역 확인
    const histories = await Promise.all(
      users.map((userId) =>
        request(app.getHttpServer())
          .get(`/point/${userId}/histories`)
          .expect(200),
      ),
    );

    histories.forEach((history, index) => {
      const userId = users[index];
      expect(history.body).toHaveLength(expectedHistories[userId].length);
      expectedHistories[userId].forEach(
        (
          expectedTransaction: TransactionType,
          transactionIndex: string | number,
        ) => {
          expect(history.body[transactionIndex]).toMatchObject(
            expectedTransaction,
          );
        },
      );
    });
  });
});
