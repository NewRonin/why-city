-- AlterTable
ALTER TABLE `Point` ADD COLUMN `order` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Attempt` ADD CONSTRAINT `Attempt_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attempt` ADD CONSTRAINT `Attempt_pointId_fkey` FOREIGN KEY (`pointId`) REFERENCES `Point`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
