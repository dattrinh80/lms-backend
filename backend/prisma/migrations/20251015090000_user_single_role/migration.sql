-- Prisma Migration: user-single-role
-- Adds single-role fields to the User table while preserving existing data.

ALTER TABLE `User`
    ADD COLUMN `username` VARCHAR(191) NULL,
    ADD COLUMN `role` ENUM('ADMIN','STUDENT','TEACHER','PARENT','HUMAN_RESOURCES') NULL,
    ADD COLUMN `phoneNumber` VARCHAR(191) NULL,
    ADD COLUMN `dateOfBirth` DATETIME NULL;

UPDATE `User`
SET
  `username` = CASE
    WHEN LOCATE('@', `email`) > 0 THEN CONCAT(
      LOWER(REPLACE(SUBSTRING_INDEX(`email`, '@', 1), '.', '_')),
      '_',
      SUBSTRING(`id`, 1, 6)
    )
    ELSE CONCAT('user_', SUBSTRING(`id`, 1, 6))
  END
WHERE `username` IS NULL;

UPDATE `User`
SET `role` = JSON_UNQUOTE(JSON_EXTRACT(`roles`, '$[0]'))
WHERE `role` IS NULL AND JSON_TYPE(`roles`) = 'ARRAY' AND JSON_LENGTH(`roles`) > 0;

UPDATE `User`
SET `role` = 'STUDENT'
WHERE `role` IS NULL;

ALTER TABLE `User`
    MODIFY COLUMN `username` VARCHAR(191) NOT NULL,
    MODIFY COLUMN `role` ENUM('ADMIN','STUDENT','TEACHER','PARENT','HUMAN_RESOURCES') NOT NULL;

ALTER TABLE `User`
    DROP COLUMN `roles`;

CREATE UNIQUE INDEX `User_username_key` ON `User`(`username`);
