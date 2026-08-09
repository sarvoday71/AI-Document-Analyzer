import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { IDocument, IDocumentQueuePayload } from './document-queue.types';

@Injectable()
export class DocumentQueueService {
    constructor(
        @InjectQueue('document-processing') private readonly documentQueue: Queue,
    ) { }

    async addDocumentToQueue(doc: IDocument | null): Promise<void> {
        if (!doc) {
            return;
        }
        const job = await this.documentQueue.add("summarize-document", {
            documentId: doc.id,
            userId: doc.userId
        },
            {
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 5_000,
                },
                removeOnComplete: true,
                removeOnFail: 100
            }
        )

    }
}