-- DropForeignKey
ALTER TABLE `point` DROP FOREIGN KEY `Point_routeId_fkey`;

-- DropForeignKey
ALTER TABLE `team` DROP FOREIGN KEY `Team_routeId_fkey`;

-- DropIndex
DROP INDEX `Point_routeId_fkey` ON `point`;

-- DropIndex
DROP INDEX `Team_routeId_fkey` ON `team`;

-- AddForeignKey
ALTER TABLE `Point` ADD CONSTRAINT `Point_routeId_fkey` FOREIGN KEY (`routeId`) REFERENCES `Route`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Team` ADD CONSTRAINT `Team_routeId_fkey` FOREIGN KEY (`routeId`) REFERENCES `Route`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
