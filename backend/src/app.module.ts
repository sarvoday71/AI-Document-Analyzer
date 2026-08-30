import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from 'src/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { DocumentModule } from './document/document.module';
import { BullModule } from '@nestjs/bullmq';
import { DocumentProcessingModule } from './document-processing/document-processing.module';
import { GeminiModule } from './gemini/gemini.module';

@Module({
  imports: [AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DocumentModule,
    BullModule.forRoot({
      connection: {
        host: process.env.UPSTASH_REDIS_HOST,
        port: parseInt(process.env.UPSTASH_REDIS_PORT || '6379'),
        password: process.env.UPSTASH_REDIS_PASSWORD,
        tls: {},
      },
    }),
    DocumentProcessingModule,
    GeminiModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule { }
