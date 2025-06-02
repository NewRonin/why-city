/*
  Warnings:

  - You are about to drop the column `task` on the `point` table. All the data in the column will be lost.
  - Added the required column `taskText` to the `Point` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `point` DROP COLUMN `task`,
    ADD COLUMN `taskText` TEXT NOT NULL;
