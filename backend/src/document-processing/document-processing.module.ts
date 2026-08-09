import { Module } from '@nestjs/common';
import { DocumentQueueService } from './document-queue.service';
import { DocumentProcessor } from './document.processor';
import { BullModule } from "@nestjs/bullmq";
import { PrismaService } from 'src/prisma.service';
import { GeminiModule } from 'src/gemini/gemini.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'document-processing',
    }),
    GeminiModule
  ],
  providers: [DocumentQueueService, DocumentProcessor, PrismaService],
  exports: [DocumentQueueService],
})
export class DocumentProcessingModule { }
