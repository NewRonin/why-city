-- CreateTable
CREATE TABLE `Point` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `address` TEXT NOT NULL,
    `taskType` ENUM('text', 'image', 'audio') NOT NULL,
    `task` TEXT NOT NULL,
    `correctAnswer` VARCHAR(191) NOT NULL,
    `successMessage` TEXT NOT NULL,
    `routeId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Route` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `routeNumber` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Team` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `password` VARCHAR(191) NOT NULL,
    `routeId` INTEGER NOT NULL,
    `currentPoint` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Point` ADD CONSTRAINT `Point_routeId_fkey` FOREIGN KEY (`routeId`) REFERENCES `Route`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Team` ADD CONSTRAINT `Team_routeId_fkey` FOREIGN KEY (`routeId`) REFERENCES `Route`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
