import { Module } from '@nestjs/common';
import { PointController } from './point.controller';
import { DatabaseModule } from 'src/database/database.module';
import { PointService } from './point.service';
import { LockManager } from './lock/timeout-spin.lock';

@Module({
  imports: [DatabaseModule],
  controllers: [PointController],
  providers: [
    PointService,
    {
      provide: LockManager,
      useFactory: () => LockManager.getInstance(),
    },
  ],
})
export class PointModule {}
