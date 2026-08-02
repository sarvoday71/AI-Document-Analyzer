import type { DocumentProcessing } from '../generated/prisma/enums';

export type { DocumentProcessing };

export interface IDocument {
    id: number;
    fileName: string;
    fileUrl: string;
    status: DocumentProcessing;
    userId: number;
    summary?: string | null;
    rawText?: string | null;
    createdAt: Date;
    updatedAt: Date;
    errorMessage?: string | null;
}

export interface IDocumentQueuePayload {
    documentId: number;
    userId: number;
}
