import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaService } from 'src/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { DocumentModule } from './document/document.module';
import { BullModule } from '@nestjs/bullmq';
import { DocumentProcessingModule } from './document-processing/document-processing.module';
import { GeminiModule } from './gemini/gemini.module';

@Module({
  imports: [AuthModule, UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DocumentModule,
    BullModule.forRoot({
      connection: {
        host: "localhost",
        port: 6379
      },

    }),
    DocumentProcessingModule,
    GeminiModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule { }
