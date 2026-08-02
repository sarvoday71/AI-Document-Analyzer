import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { PrismaService } from 'src/prisma.service';
import { AuthModule } from 'src/auth/auth.module';
import { DocumentProcessingModule } from 'src/document-processing/document-processing.module';

@Module({
  controllers: [DocumentController],
  providers: [DocumentService, PrismaService],
  imports: [AuthModule, DocumentProcessingModule],
})
export class DocumentModule { }
