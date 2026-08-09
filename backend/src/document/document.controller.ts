import { Body, Controller, HttpCode, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { DocumentService } from './document.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthGuard } from 'src/auth/auth.gaurd';


@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) { }

  @Post('upload')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('document', {
    storage: memoryStorage(),
  }))
  async DocumentUpload(
    @UploadedFile() file: Express.Multer.File,
    @Req() request: Request
  ) {
    console.log(file);
    return this.documentService.fileProcessing(file, request['user'].sub);
  }


}
