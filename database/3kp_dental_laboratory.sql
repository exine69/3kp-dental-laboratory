CREATE DATABASE IF NOT EXISTS `3kp_dental_laboratory`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `3kp_dental_laboratory`;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `message_replies`;
DROP TABLE IF EXISTS `messages`;
DROP TABLE IF EXISTS `tracking_updates`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `appointments`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(80) NOT NULL,
  `name` VARCHAR(160) NOT NULL,
  `email` VARCHAR(190) NULL,
  `phone` VARCHAR(40) NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_username_unique` (`username`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `appointments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `public_id` VARCHAR(40) NOT NULL,
  `customer_name` VARCHAR(160) NOT NULL,
  `service` VARCHAR(160) NOT NULL,
  `appointment_date` DATE NOT NULL,
  `time_slot` VARCHAR(40) NOT NULL,
  `status` VARCHAR(80) NOT NULL DEFAULT 'Pending',
  `contact` VARCHAR(40) NULL,
  `clinic` VARCHAR(190) NULL,
  `notes` TEXT NULL,
  `user_id` BIGINT UNSIGNED NULL,
  `is_hidden_by_user` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `appointments_public_id_unique` (`public_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `orders` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `public_id` VARCHAR(40) NOT NULL,
  `client` VARCHAR(160) NOT NULL,
  `product` VARCHAR(160) NOT NULL,
  `qty` INT UNSIGNED NOT NULL DEFAULT 1,
  `address` TEXT NULL,
  `contact` VARCHAR(40) NULL,
  `delivery_method` VARCHAR(40) NULL,
  `status` ENUM('In Progress','Ready','In Transit','Completed','Cancelled') NOT NULL DEFAULT 'In Progress',
  `notes` TEXT NULL,
  `appointment_id` VARCHAR(40) NULL,
  `user_id` BIGINT UNSIGNED NULL,
  `is_hidden_by_user` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orders_public_id_unique` (`public_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `messages` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `public_id` VARCHAR(40) NOT NULL,
  `user_id` BIGINT UNSIGNED NULL,
  `from_name` VARCHAR(160) NOT NULL,
  `subject` VARCHAR(190) NOT NULL DEFAULT 'General Inquiry',
  `body` TEXT NOT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `is_hidden_by_user` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `messages_public_id_unique` (`public_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `message_replies` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `message_id` BIGINT UNSIGNED NOT NULL,
  `from_name` VARCHAR(160) NOT NULL,
  `body` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `message_replies_message_id_idx` (`message_id`),
  CONSTRAINT `fk_replies_message` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`username`, `name`, `email`, `password_hash`, `role`) VALUES
  ('admin', 'Admin', NULL, SHA2('admin123', 256), 'admin');
