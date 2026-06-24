import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { Asset } from '../entities/asset.entity';
import { Assignment } from '../entities/assignment.entity';
import { Maintenance } from '../entities/maintenance.entity';
import { Inspection } from '../entities/inspection.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Asset, Assignment, Maintenance, Inspection])],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
