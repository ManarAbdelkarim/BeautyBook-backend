/*
  Warnings:

  - You are about to drop the column `sDeleted` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `sDeleted`,
    ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false;
