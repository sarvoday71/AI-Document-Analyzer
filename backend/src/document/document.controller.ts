import { Body, Controller, HttpCode, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { DocumentService } from './document.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, memoryStorage } from 'multer';
import { extname } from 'path';

@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) { }

  @Post('upload')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('document', {
    storage: memoryStorage(),
  }))
  async DocumentUpload(
    @UploadedFile() file: Express.Multer.File
  ) {
    console.log(file);
    return this.documentService.fileProcessing(file);
  }


}
