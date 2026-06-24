import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  app.enableCors();
  const port = process.env.PORT || 4001;
  await app.listen(port);
  console.log(`Maintenance Prediction service running on port ${port}`);
}
bootstrap();
