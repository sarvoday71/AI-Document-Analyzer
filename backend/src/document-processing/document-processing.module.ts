import { Module } from '@nestjs/common';
import { DocumentQueueService } from './document-queue.service';
import { DocumentProcessor } from './document.processor';
import { BullModule } from "@nestjs/bullmq";
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'document-processing',
    }),
  ],
  providers: [DocumentQueueService, DocumentProcessor, PrismaService],
  exports: [DocumentQueueService],
})
export class DocumentProcessingModule { }
