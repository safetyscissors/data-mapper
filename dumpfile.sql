-- MySQL dump 10.13  Distrib 5.6.25, for osx10.8 (x86_64)
--
-- Host: localhost    Database: rcuh
-- ------------------------------------------------------
-- Server version	5.6.25

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `check_printing`
--

DROP TABLE IF EXISTS `check_printing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `check_printing` (
  `check_printing_id` int(11) NOT NULL AUTO_INCREMENT,
  `check_printing_check_count` int(11) DEFAULT NULL,
  `check_printing_created_date` datetime DEFAULT NULL,
  `check_printing_check_grand_total` decimal(12,2) DEFAULT NULL,
  `check_printing_status` varchar(255) DEFAULT NULL,
  `check_printing_step` int(11) DEFAULT NULL,
  `check_printing_first_check_number` varchar(255) DEFAULT NULL,
  `check_printing_last_check_number` varchar(255) DEFAULT NULL,
  `check_printing_first_good_check_number` varchar(255) DEFAULT NULL,
  `check_printing_last_good_check_number` varchar(255) DEFAULT NULL,
  `check_printing_individual_voided_checks` varchar(10000) DEFAULT NULL,
  `check_printing_all_voided_checks` varchar(10000) DEFAULT NULL,
  PRIMARY KEY (`check_printing_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `check_register`
--

DROP TABLE IF EXISTS `check_register`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `check_register` (
  `check_register_id` int(11) NOT NULL AUTO_INCREMENT,
  `check_register_check_printing_id` int(11) NOT NULL,
  `check_register_date` datetime DEFAULT NULL,
  `check_register_grand_total` decimal(12,2) DEFAULT NULL,
  `check_register_returned_total` int(11) DEFAULT NULL,
  `check_register_mailed_total` int(11) DEFAULT NULL,
  `check_register_total_number_of_checks` int(11) DEFAULT NULL,
  `check_register_starting_check_number` varchar(255) DEFAULT NULL,
  `check_register_ending_check_number` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`check_register_id`),
  KEY `fk_check_register_fk_id` (`check_register_check_printing_id`),
  CONSTRAINT `fk_check_register_fk_id` FOREIGN KEY (`check_register_check_printing_id`) REFERENCES `check_printing` (`check_printing_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `check_register_count_line_item`
--

DROP TABLE IF EXISTS `check_register_count_line_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `check_register_count_line_item` (
  `check_register_count_line_item_id` int(11) NOT NULL AUTO_INCREMENT,
  `check_register_count_line_item_check_register_id` int(11) NOT NULL,
  `check_register_count_line_item_fa_code` varchar(255) DEFAULT NULL,
  `check_register_count_line_item_returned_count` int(11) DEFAULT NULL,
  `check_register_count_line_item_mailed_count` int(11) DEFAULT NULL,
  `check_register_count_line_item_total` int(11) DEFAULT NULL,
  `check_register_count_line_item_forder` varchar(255) DEFAULT NULL,
  `check_register_count_line_item_ck_flag` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`check_register_count_line_item_id`),
  KEY `fk_check_register_count_line_item_fk_id` (`check_register_count_line_item_check_register_id`),
  CONSTRAINT `fk_check_register_count_line_item_fk_id` FOREIGN KEY (`check_register_count_line_item_check_register_id`) REFERENCES `check_register` (`check_register_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `check_register_line_item`
--

DROP TABLE IF EXISTS `check_register_line_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `check_register_line_item` (
  `check_register_line_item_id` int(11) NOT NULL AUTO_INCREMENT,
  `check_register_line_item_check_register_id` int(11) NOT NULL,
  `check_register_line_item_check_number` varchar(255) DEFAULT NULL,
  `check_register_line_item_fa_code` varchar(255) DEFAULT NULL,
  `check_register_line_item_payment_request_number` varchar(255) DEFAULT NULL,
  `check_register_line_item_vendor_name` varchar(1000) DEFAULT NULL,
  `check_register_line_item_amount` decimal(12,2) DEFAULT NULL,
  `check_register_line_item_project_number` varchar(255) DEFAULT NULL,
  `check_register_line_item_budget_category` varchar(255) DEFAULT NULL,
  `check_register_line_item_document_number` varchar(255) DEFAULT NULL,
  `check_register_line_item_transaction_code` varchar(255) DEFAULT NULL,
  `check_register_line_item_original_fa` varchar(255) DEFAULT NULL,
  `check_register_line_item_ck_flag` varchar(255) DEFAULT NULL,
  `check_register_line_item_dist_flag` varchar(255) DEFAULT NULL,
  `check_register_line_item_fa_flag` varchar(255) DEFAULT NULL,
  `check_register_line_item_pay_req` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`check_register_line_item_id`),
  KEY `fk_check_register_line_item_fk_id` (`check_register_line_item_check_register_id`),
  CONSTRAINT `fk_check_register_line_item_fk_id` FOREIGN KEY (`check_register_line_item_check_register_id`) REFERENCES `check_register` (`check_register_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2015-07-07 10:41:24
