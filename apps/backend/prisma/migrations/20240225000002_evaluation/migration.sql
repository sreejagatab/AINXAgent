-- CreateTable
CREATE TABLE "Evaluation" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "scores" JSONB NOT NULL,
    "feedback" TEXT NOT NULL,
    "modelUsed" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToolExecution" (
    "id" TEXT NOT NULL,
    "toolName" TEXT NOT NULL,
    "params" JSONB NOT NULL,
    "result" JSONB,
    "error" TEXT,
    "duration" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToolExecution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Evaluation_modelUsed_idx" ON "Evaluation"("modelUsed");
CREATE INDEX "Evaluation_createdAt_idx" ON "Evaluation"("createdAt");

-- CreateIndex
CREATE INDEX "ToolExecution_toolName_idx" ON "ToolExecution"("toolName");
CREATE INDEX "ToolExecution_userId_idx" ON "ToolExecution"("userId");
CREATE INDEX "ToolExecution_status_idx" ON "ToolExecution"("status");
CREATE INDEX "ToolExecution_createdAt_idx" ON "ToolExecution"("createdAt");

-- AddForeignKey
ALTER TABLE "ToolExecution" ADD CONSTRAINT "ToolExecution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; 