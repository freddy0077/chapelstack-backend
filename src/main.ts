// Import crypto polyfill FIRST to fix @nestjs/schedule crypto error
import './crypto-polyfill';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import { AllExceptionsFilter } from './base/filters/all-exceptions.filter';
import { graphqlUploadExpress } from 'graphql-upload';
import * as express from 'express';
import { join } from 'path';

// Auto-start the SMS queue worker
import './communications/queue/sms.processor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'https://chapelstack.com',
      'http://chapelstack.com',
    ],
    credentials: true,
  });

  // Increase body size limit for JSON requests
  app.use(express.json({ limit: '10gb' }));
  app.use(express.urlencoded({ limit: '10gb', extended: true }));

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Enable file upload middleware for GraphQL with increased limits
  app.use(graphqlUploadExpress({ maxFileSize: 10_000_000_000, maxFiles: 10 }));

  // Serve static exports directory for file downloads
  app.use('/exports', express.static(join(process.cwd(), 'public', 'exports')));

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap().catch((err) => {
  console.error('Failed to bootstrap the application:', err);
  process.exit(1);
});
