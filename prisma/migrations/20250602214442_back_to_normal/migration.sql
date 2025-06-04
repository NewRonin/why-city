-- DropForeignKey
ALTER TABLE `point` DROP FOREIGN KEY `Point_routeId_fkey`;

-- DropForeignKey
ALTER TABLE `team` DROP FOREIGN KEY `Team_routeId_fkey`;

-- DropIndex
DROP INDEX `Point_routeId_fkey` ON `Point`;

-- DropIndex
DROP INDEX `Team_routeId_fkey` ON `Team`;

-- AddForeignKey
ALTER TABLE `Point` ADD CONSTRAINT `Point_routeId_fkey` FOREIGN KEY (`routeId`) REFERENCES `Route`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Team` ADD CONSTRAINT `Team_routeId_fkey` FOREIGN KEY (`routeId`) REFERENCES `Route`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
