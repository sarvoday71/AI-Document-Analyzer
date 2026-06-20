import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { PrismaService } from 'src/prisma.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [DocumentController],
  providers: [DocumentService, PrismaService],
  imports: [AuthModule],
})
export class DocumentModule { }
