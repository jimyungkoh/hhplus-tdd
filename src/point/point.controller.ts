import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { PointAmountDto } from './dto/point.dto';
import { UserIdDto } from './dto/user.dto';
import { PointHistory, UserPoint } from './model/point.model';
import { PointService } from './point.service';

@Controller('/point')
export class PointController {
  constructor(private readonly pointService: PointService) {}

  /**
   * TODO - 특정 유저의 포인트를 조회하는 기능을 작성해주세요.
   */
  @Get(':id')
  async point(@Param() { id }: UserIdDto): Promise<UserPoint> {
    return this.pointService.getPointBy(id);
  }

  /**
   * TODO - 특정 유저의 포인트 충전/이용 내역을 조회하는 기능을 작성해주세요.
   */
  @Get(':id/histories')
  async history(@Param() { id }: UserIdDto): Promise<PointHistory[]> {
    return this.pointService.findHistoryBy(id);
  }

  /**
   * TODO - 특정 유저의 포인트를 충전하는 기능을 작성해주세요.
   */
  @Patch(':id/charge')
  async charge(
    @Param() { id }: UserIdDto,
    @Body() pointDto: PointAmountDto,
  ): Promise<UserPoint> {
    const amount = pointDto.amount;
    return this.pointService.charge(id, amount);
  }

  /**
   * TODO - 특정 유저의 포인트를 사용하는 기능을 작성해주세요.
   */
  @Patch(':id/use')
  async use(
    @Param() { id }: UserIdDto,
    @Body() pointDto: PointAmountDto,
  ): Promise<UserPoint> {
    const amount = pointDto.amount;
    return this.pointService.use(id, amount);
  }
}
