import { Module } from '@nestjs/common';
import InjectionToken from './injection.token';
import { PointHistoryMemoryRepository } from './pointhistory/pointhistory-memory.repository';
import { PointHistoryTable } from './pointhistory/pointhistory.table';
import { UserPointMemoryRepository } from './userpoint/userpoint-memory.repository';
import { UserPointTable } from './userpoint/userpoint.table';

@Module({
  providers: [
    UserPointTable,
    PointHistoryTable,
    {
      provide: InjectionToken.UserPointRepository,
      useClass: UserPointMemoryRepository,
    },
    {
      provide: InjectionToken.PointHistoryRepository,
      useClass: PointHistoryMemoryRepository,
    },
  ],
  exports: [
    UserPointTable,
    PointHistoryTable,
    InjectionToken.UserPointRepository,
    InjectionToken.PointHistoryRepository,
  ],
})
export class DatabaseModule {}
