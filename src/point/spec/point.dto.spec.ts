import { validate } from 'class-validator';
import { ErrorCodes } from 'src/common/error/error-codes';
import { PointAmountDto } from '../dto/point.dto';

describe('PointDto', () => {
  describe('PointAmountDto', () => {
    test(`포인트 양이 정수가 아니고 1 미만인 경우,
        정수 유효성 검사가 먼저 이뤄지므로,
        ErrorCodes.INVALID_USE_AMOUNT.message는
        한번 반환돼야 한다`, async () => {
      // given
      const pointDto = new PointAmountDto();
      pointDto.amount = 0.1;

      // when
      const result = await validate(pointDto);
      const expected = {
        length: 1,
        message: ErrorCodes.INVALID_POINT_AMOUNT.message,
      };

      // then
      expect(result.length).toBe(expected.length);
      expect(result[0]?.constraints?.isInt).toBe(expected.message);
    });

    test(`포인트 양이 정수가 아닌 경우,
        ErrorCodes.INVALID_USE_AMOUNT.message를
        반환해야 한다`, async () => {
      // given
      const pointDto = new PointAmountDto();
      pointDto.amount = 1.1;

      // when
      const result = await validate(pointDto);
      const expected = {
        length: 1,
        message: ErrorCodes.INVALID_POINT_AMOUNT.message,
      };

      // then
      expect(result.length).toBe(expected.length);
      expect(result.pop()?.constraints?.isInt).toBe(expected.message);
    });

    test(`포인트 양이 1 미만인 경우
        ErrorCodes.INVALID_USE_AMOUNT.message를
        반환해야 한다`, async () => {
      // given
      const pointDto = new PointAmountDto();
      pointDto.amount = 0;

      // when
      const errors = await validate(pointDto);

      // then
      expect(errors.length).toBe(1);
      expect(errors.pop()?.constraints?.min).toBe(
        ErrorCodes.INVALID_POINT_AMOUNT.message,
      );
    });

    test(`포인트 양이 1 이상의 정수인 경우
        ValidationError가 발생하면 안 된다`, async () => {
      // given
      const pointDto = new PointAmountDto();
      pointDto.amount = 100;

      // when
      const errors = await validate(pointDto);

      // then
      expect(errors.length).toBe(0);
    });
  });
});
