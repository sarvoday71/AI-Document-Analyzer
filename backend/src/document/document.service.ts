import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { extname, join } from 'path';
import * as fs from 'fs';

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
            return "InvalidType";
        }

        const maxSize = 10 * 1024 * 1024;

        if (file.size > maxSize) {
            return "InvalidSize";
        }

        return "Valid";
    }

    async fileProcessing(file: Express.Multer.File, userId: number) {
        const isValid = this.validateTypes(file);

        if (isValid === "InvalidSize")
            throw new BadRequestException("File size should be below 10MB");

        if (isValid === "InvalidType")
            throw new BadRequestException("Please check file type");

        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);

        const name = uniqueName + file.originalname;


        const filePath = join(
            process.cwd(),
            'uploads',
            name
        )

        await fs.promises.writeFile(
            filePath,
            file.buffer,
        );

        const doc = await this.prisma.document.create({
            data: {
                fileName: name,
                fileUrl: filePath,
                status: "UPLOADED",
                userId: userId
            }
        })

        return doc;
    }
}
