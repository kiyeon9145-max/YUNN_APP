-- CreateTable
CREATE TABLE "SurveySubmission" (
    "id" SERIAL NOT NULL,
    "sessionId" TEXT NOT NULL,
    "city" TEXT,
    "gender" TEXT,
    "age" TEXT,
    "skinType" TEXT,
    "concerns" TEXT,
    "trigger" TEXT[],
    "sensitivity" TEXT,
    "outdoor" TEXT,
    "sunscreen" TEXT,
    "sleep" TEXT,
    "stress" TEXT,
    "routineLevel" TEXT,
    "photoUploaded" BOOLEAN NOT NULL,
    "resultSkinType" TEXT,
    "resultConcernType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SurveySubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineCheck" (
    "id" SERIAL NOT NULL,
    "sessionId" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,
    "morning" BOOLEAN[],
    "evening" BOOLEAN[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoutineCheck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SurveySubmission_sessionId_idx" ON "SurveySubmission"("sessionId");

-- CreateIndex
CREATE INDEX "RoutineCheck_sessionId_idx" ON "RoutineCheck"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "RoutineCheck_sessionId_dateKey_key" ON "RoutineCheck"("sessionId", "dateKey");
