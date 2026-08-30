import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { extname, join } from 'path';
import * as fs from 'fs';
import { DocumentQueueService } from 'src/document-processing/document-queue.service';

@Injectable()
export class DocumentService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly documentQueueService: DocumentQueueService
    ) { }

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

    // To process file uploaded by user
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

        // Here give the document info to queue.
        if (doc) {
            console.log("Call to queue");
            await this.documentQueueService.addDocumentToQueue(doc);
        }
        return doc;
    }




    // To get all the documents uploaded by user
    async getDocumentsByUserId(userId: number) {
        return this.prisma.document.findMany({
            where: { userId },
            select: {
                id: true,
                fileName: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }



    // To get document with particular id
    async getDocumentById(id: number, userId: number) {
        const document = this.prisma.document.findFirst({
            where: {
                id,
                userId,
            },
            select: {
                id: true,
                fileName: true,
                status: true,
                summary: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!document) {
            throw new NotFoundException('Document not found');
        }

        return document;
    }
} 
