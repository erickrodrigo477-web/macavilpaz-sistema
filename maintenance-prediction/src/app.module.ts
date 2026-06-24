import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiModule } from './ai/ai.module';
import { Asset } from './entities/asset.entity';
import { Assignment } from './entities/assignment.entity';
import { Inspection } from './entities/inspection.entity';
import { Maintenance } from './entities/maintenance.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASS'),
        database: configService.get<string>('DB_NAME'),
        entities: [Asset, Assignment, Inspection, Maintenance],
        synchronize: false, // Usamos migraciones manuales
      }),
    }),
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
