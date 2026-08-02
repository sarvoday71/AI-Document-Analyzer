import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { IDocumentQueuePayload } from "./document-queue.types";
import { PrismaService } from "src/prisma.service";
import { extname } from "node:path";
import { readFile } from "node:fs/promises";
import { PDFParse } from 'pdf-parse';
import mammoth from "mammoth";

@Processor('document-processing')
export class DocumentProcessor extends WorkerHost {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    // Extracting text from the document
    async textExratction(fileUrl: string) {
        const extension = extname(fileUrl).toLowerCase();

        if (extension === '.txt') {
            return readFile(fileUrl, 'utf8');
        }

        if (extension === '.pdf') {
            const fileBuffer = await readFile(fileUrl);
            const parser = new PDFParse({ data: fileBuffer });

            try {
                const result = await parser.getText();
                return result.text;
            } finally {
                await parser.destroy();
            }
        }

        if (extension === '.docx') {
            const result = await mammoth.extractRawText({ path: fileUrl });

            return result.value;
        }

        throw new Error(`unsuported file type : ${extension}`);
    }


    async process(job: Job<IDocumentQueuePayload>) {
        if (job.name !== 'summarize-document') {
            return;
        }
        const jobToBeProcessed = job.data;
        const document = await this.prisma.document.findUnique({
            where: {
                id: jobToBeProcessed.documentId
            }
        })

        if (!document) {
            const status = "FAILED";
            const errorMessage = "No document found with provided ID";
            return;
        }

        // Now here perform the text extraction part from the pdf and store it inside the database
        const fileUrl = document?.fileUrl
        const rawText = await this.textExratction(fileUrl)

        await this.prisma.document.update({
            where: {
                id: jobToBeProcessed.documentId,
            },
            data: {
                status: 'PROCESSING',
                rawText: rawText,
            }
        })

        console.log(rawText);
    }
}
