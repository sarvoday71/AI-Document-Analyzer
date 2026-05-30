import { Body, Controller, HttpCode, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { DocumentService } from './document.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) { }

  @Post('upload')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('document'))
  async DocumentUpload(
    @UploadedFile() file: Express.Multer.File
  ) {
    console.log(file);
    return this.documentService.validateTypes(file);
  }


}
