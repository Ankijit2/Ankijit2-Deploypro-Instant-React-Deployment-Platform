/*
  Warnings:

  - A unique constraint covering the columns `[subDomain]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[customDomain]` on the table `Project` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Project_subDomain_key" ON "Project"("subDomain");

-- CreateIndex
CREATE UNIQUE INDEX "Project_customDomain_key" ON "Project"("customDomain");
