-- CreateTable
CREATE TABLE `conversations` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(20) NOT NULL,
    `created_by` VARCHAR(191) NOT NULL,
    `last_message_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conversation_participants` (
    `conversation_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `role` VARCHAR(20) NOT NULL DEFAULT 'member',
    `is_muted` BOOLEAN NOT NULL DEFAULT false,
    `is_pinned` BOOLEAN NOT NULL DEFAULT false,
    `is_archived` BOOLEAN NOT NULL DEFAULT false,
    `last_read_at` DATETIME(3) NULL,
    `joined_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`conversation_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `messages` (
    `id` VARCHAR(191) NOT NULL,
    `conversation_id` VARCHAR(191) NOT NULL,
    `sender_id` VARCHAR(191) NOT NULL,
    `content` TEXT NULL,
    `content_iv` TEXT NULL,
    `type` VARCHAR(30) NOT NULL,
    `reply_to_id` VARCHAR(191) NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_for` JSON NOT NULL,
    `edited_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`, `created_at`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
PARTITION BY RANGE (TO_DAYS(`created_at`)) (
    PARTITION p202606 VALUES LESS THAN (TO_DAYS('2026-07-01')),
    PARTITION p202607 VALUES LESS THAN (TO_DAYS('2026-08-01')),
    PARTITION p202608 VALUES LESS THAN (TO_DAYS('2026-09-01')),
    PARTITION p202609 VALUES LESS THAN (TO_DAYS('2026-10-01')),
    PARTITION p202610 VALUES LESS THAN (TO_DAYS('2026-11-01')),
    PARTITION p202611 VALUES LESS THAN (TO_DAYS('2026-12-01')),
    PARTITION p202612 VALUES LESS THAN (TO_DAYS('2027-01-01')),
    PARTITION pmax VALUES LESS THAN MAXVALUE
);

-- CreateTable
CREATE TABLE `message_status` (
    `message_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`message_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reactions` (
    `message_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `emoji` VARCHAR(10) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`message_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `groups` (
    `id` VARCHAR(191) NOT NULL,
    `conversation_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `avatar_url` TEXT NULL,
    `invite_link` VARCHAR(100) NULL,
    `max_members` INTEGER NOT NULL DEFAULT 1024,
    `created_by` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `groups_conversation_id_key`(`conversation_id`),
    UNIQUE INDEX `groups_invite_link_key`(`invite_link`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Index for partitioned messages (MySQL does not allow FKs on partitioned tables)
CREATE INDEX `messages_conversation_id_idx` ON `messages` (`conversation_id`);

-- AddForeignKey
ALTER TABLE `conversation_participants` ADD CONSTRAINT `conversation_participants_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `groups` ADD CONSTRAINT `groups_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
