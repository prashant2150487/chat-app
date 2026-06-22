-- DropForeignKey
ALTER TABLE `otps` DROP FOREIGN KEY `otps_userId_fkey`;

-- DropTable (truncates previous data)
DROP TABLE `users`;

-- CreateTable
CREATE TABLE `auth-user` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NULL,
    `firstName` VARCHAR(191) NULL,
    `mobile` VARCHAR(191) NULL,
    `token` LONGTEXT NULL,
    `role` ENUM('USER', 'ADMIN', 'SUPER_ADMIN') NOT NULL DEFAULT 'USER',
    `is_phone_verified` BOOLEAN NOT NULL DEFAULT false,
    `is_email_verified` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `auth-user_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Clear orphaned OTP rows that referenced the dropped table
DELETE FROM `otps`;

-- AddForeignKey
ALTER TABLE `otps` ADD CONSTRAINT `otps_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `auth-user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
