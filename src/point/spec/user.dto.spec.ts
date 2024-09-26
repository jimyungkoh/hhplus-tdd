import { validate } from 'class-validator';
import { ErrorCodes } from 'src/common/error/error-codes';
import { UserIdDto } from '../dto/user.dto';

describe('UserDto', () => {
  describe('UserIdDto', () => {
    test(`사용자 id가 정수가 아니고 1 미만인 경우,
        정수 유효성 검사가 먼저 이뤄지므로,
        ErrorCodes.INVALID_USER_ID.message는
        한번 반환돼야 한다`, async () => {
      // given
      const userParam = new UserIdDto();
      userParam.id = 0.1;

      // when
      const result = await validate(userParam);
      const expected = {
        length: 1,
        message: ErrorCodes.INVALID_USER_ID.message,
      };

      // then
      expect(result.length).toBe(expected.length);
      expect(result[0]?.constraints?.isInt).toBe(expected.message);
    });

    test(`사용자 id가 정수가 아닌 경우,
        ErrorCodes.INVALID_USER_ID.message를
        반환해야 한다`, async () => {
      // given
      const userParam = new UserIdDto();
      userParam.id = 1.1;

      // when
      const result = await validate(userParam);
      const expected = {
        length: 1,
        message: ErrorCodes.INVALID_USER_ID.message,
      };

      // then
      expect(result.length).toBe(expected.length);
      expect(result.pop()?.constraints?.isInt).toBe(expected.message);
    });

    test(`사용자 id가 1 미만인 경우
        ErrorCodes.INVALID_USER_ID.message를
        반환해야 한다`, async () => {
      // given
      const userParam = new UserIdDto();
      userParam.id = -1;

      // when
      const errors = await validate(userParam);

      // then
      expect(errors.length).toBe(1);
      expect(errors.pop()?.constraints?.min).toBe(
        ErrorCodes.INVALID_USER_ID.message,
      );
    });

    test(`사용자 id가 1 이상의 정수인 경우
        ValidationError가 발생하면 안 된다`, async () => {
      // given
      const userParam = new UserIdDto();
      userParam.id = 3;

      // when
      const errors = await validate(userParam);

      // then
      expect(errors.length).toBe(0);
    });
  });
});
