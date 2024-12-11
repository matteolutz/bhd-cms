-- CreateTable
CREATE TABLE "ProjectAccessToken" (
    "token" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectAccessToken_pkey" PRIMARY KEY ("token")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectAccessToken_token_key" ON "ProjectAccessToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectAccessToken_projectId_key" ON "ProjectAccessToken"("projectId");

-- AddForeignKey
ALTER TABLE "ProjectAccessToken" ADD CONSTRAINT "ProjectAccessToken_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
