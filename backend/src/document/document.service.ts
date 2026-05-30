import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class DocumentService {

    constructor(private readonly prisma: PrismaService) { }

    validateTypes(file: Express.Multer.File) {
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
        ]

        if (!allowedTypes.includes(file.mimetype)) {
            throw new BadRequestException('Unsupported File Type');
        }

        const maxSize = 10 * 1024 * 1024;

        if (file.size > maxSize) {
            throw new BadRequestException('File Size Exceeds the maximum limit');
        }

        return file;
    }
}
