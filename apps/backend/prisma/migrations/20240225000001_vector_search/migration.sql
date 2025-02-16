-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
CREATE TABLE "VectorIndex" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "embedding" vector(1536) NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VectorIndex_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VectorOperation" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "VectorOperation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VectorIndex_documentId_key" ON "VectorIndex"("documentId");
CREATE INDEX "VectorIndex_metadata_gin" ON "VectorIndex" USING gin ("metadata");
CREATE INDEX "VectorIndex_embedding_ivfflat" ON "VectorIndex" USING ivfflat (embedding vector_cosine_ops);

-- CreateIndex
CREATE INDEX "VectorOperation_documentId_idx" ON "VectorOperation"("documentId");
CREATE INDEX "VectorOperation_status_idx" ON "VectorOperation"("status");
CREATE INDEX "VectorOperation_type_idx" ON "VectorOperation"("type");

-- AddForeignKey
ALTER TABLE "VectorIndex" ADD CONSTRAINT "VectorIndex_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE; 