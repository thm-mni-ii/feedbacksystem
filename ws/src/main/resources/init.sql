-- MySQL dump 10.13  Distrib 8.0.13, for macos10.14 (x86_64)
--
-- Host: localhost    Database: submissionchecker
-- ------------------------------------------------------
-- Server version	8.0.13

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
 SET NAMES utf8 ;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `course`
--

DROP TABLE IF EXISTS `course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `course` (
  `course_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `description` text,
  `creator` int(11) NOT NULL,
  `standard_task_type` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`course_id`),
  UNIQUE KEY `courses_courseid_uindex` (`course_id`),
  KEY `courses_users_userid_fk` (`creator`),
  CONSTRAINT `courses_users_userid_fk` FOREIGN KEY (`creator`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course`
--

LOCK TABLES `course` WRITE;
/*!40000 ALTER TABLE `course` DISABLE KEYS */;
INSERT INTO `course` VALUES (1,'Admin Kurse','Der Kurs gehört dem Admin',1,NULL),(2,'Compilerbau','Compielerbau SS18',1,NULL),(4,'course no 42','another dummy entry',54,'SQL'),(5,'course no 42','another dummy entry',54,'SQL'),(6,'course no 42','another dummy entry',54,'SQL'),(7,'course no 42','another dummy entry',54,'SQL'),(8,'course no 42','another dummy entry',54,'SQL'),(9,'course no 42','another dummy entry',54,'SQL'),(10,'course no 42','another dummy entry',54,'SQL'),(11,'course no 42','another dummy entry',54,'SQL');
/*!40000 ALTER TABLE `course` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `role` (
  `role_id` int(11) NOT NULL,
  `name` varchar(30) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL,
  `description` varchar(200) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL,
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES (1,'admin',NULL),(2,'dozent',NULL),(4,'hiwi',NULL),(8,'student',NULL);
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `submission`
--

DROP TABLE IF EXISTS `submission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `submission` (
  `submission_id` int(11) NOT NULL AUTO_INCREMENT,
  `passed` tinyint(4) DEFAULT NULL,
  `message` varchar(45) DEFAULT NULL,
  `result` text,
  `submit_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `result_date` timestamp NULL DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `task_id` int(11) DEFAULT NULL,
  `filename` varchar(255) DEFAULT NULL,
  `submission_data` text,
  PRIMARY KEY (`submission_id`),
  KEY `submission_task_taskid_fk` (`task_id`),
  KEY `submission_users_userid_fk` (`user_id`),
  CONSTRAINT `submission_task_taskid_fk` FOREIGN KEY (`task_id`) REFERENCES `task` (`task_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `submission_users_userid_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `submission`
--

LOCK TABLES `submission` WRITE;
/*!40000 ALTER TABLE `submission` DISABLE KEYS */;
INSERT INTO `submission` VALUES (39,0,NULL,'correct: token and md5 hash are identical','2018-11-12 09:58:59',NULL,53,3,NULL,NULL),(40,1,NULL,'fault: token and md5 hash are not identical','2018-11-12 10:00:17',NULL,53,3,NULL,NULL),(41,0,NULL,'correct: token and md5 hash are identical','2018-11-12 10:01:22',NULL,53,3,NULL,NULL),(42,0,NULL,'correct: token and md5 hash are identical','2018-11-12 13:05:47',NULL,53,3,NULL,NULL),(43,1,NULL,'fault: token and md5 hash are not identical','2018-11-12 13:06:26',NULL,53,3,NULL,NULL),(44,0,NULL,'correct: token and md5 hash are identical','2018-11-12 13:07:25',NULL,53,3,NULL,NULL),(45,NULL,NULL,NULL,'2018-11-13 09:30:33',NULL,53,3,NULL,NULL),(46,NULL,NULL,NULL,'2018-11-13 09:49:04',NULL,53,3,NULL,NULL),(47,0,NULL,'correct: token and md5 hash are identical\n','2018-11-15 07:31:07',NULL,53,3,NULL,NULL),(48,0,NULL,'correct: token and md5 hash are identical\n','2018-11-15 07:31:46',NULL,53,3,NULL,NULL),(49,0,NULL,'correct: token and md5 hash are identical\n','2018-11-15 07:31:58',NULL,53,3,NULL,NULL),(50,1,NULL,'fault: token and md5 hash are not identical\n','2018-11-15 07:32:11',NULL,53,3,NULL,NULL),(51,0,NULL,'correct: token and md5 hash are identical\n','2018-11-19 15:44:57',NULL,53,3,NULL,NULL),(52,0,NULL,'correct: token and md5 hash are identical\n','2018-11-19 15:45:27',NULL,53,3,NULL,NULL),(53,NULL,NULL,NULL,'2018-11-28 12:25:47',NULL,54,3,NULL,NULL),(54,NULL,NULL,NULL,'2018-11-28 13:56:09',NULL,53,3,NULL,'7774ffd6f676ab7f4e17c0f38c7d5d8d'),(55,NULL,NULL,NULL,'2018-11-28 19:06:35',NULL,53,3,NULL,'7774ffd6f676ab7f4e17c0f38c7d5d8d'),(56,NULL,NULL,NULL,'2018-11-28 19:06:52',NULL,53,3,NULL,'7774ffd6f676ab7f4e17c0f38c7d5d8d'),(57,NULL,NULL,NULL,'2018-11-28 19:16:56',NULL,53,3,'check.png',NULL),(58,NULL,NULL,NULL,'2018-11-28 19:19:13',NULL,53,3,'check.png',NULL),(59,NULL,NULL,NULL,'2018-11-28 19:20:37',NULL,53,3,'check.png',NULL),(60,NULL,NULL,NULL,'2018-11-28 19:20:47',NULL,53,3,'check.png',NULL),(61,NULL,NULL,NULL,'2018-11-28 19:39:48',NULL,53,3,'check.png',NULL),(62,NULL,NULL,NULL,'2018-11-29 07:11:00',NULL,53,3,'check.png',NULL),(63,NULL,NULL,NULL,'2018-11-29 11:19:07',NULL,53,3,'check.png',NULL),(64,NULL,NULL,NULL,'2018-11-29 11:20:22',NULL,53,3,'check.png',NULL),(65,NULL,NULL,NULL,'2018-11-29 12:33:36',NULL,53,3,'check.png',NULL),(66,NULL,NULL,NULL,'2018-11-29 14:14:31',NULL,53,3,'check.png',NULL);
/*!40000 ALTER TABLE `submission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task`
--

DROP TABLE IF EXISTS `task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `task` (
  `task_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) DEFAULT NULL,
  `description` varchar(200) DEFAULT NULL,
  `course_id` int(11) DEFAULT NULL,
  `test_file_name` varchar(255) DEFAULT NULL,
  `test_type` enum('FILE','STRING') DEFAULT NULL,
  PRIMARY KEY (`task_id`),
  KEY `task_courses_courseid_fk` (`course_id`),
  CONSTRAINT `task_course_course_id_fk` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task`
--

LOCK TABLES `task` WRITE;
/*!40000 ALTER TABLE `task` DISABLE KEYS */;
INSERT INTO `task` VALUES (3,'Aufgabe 1','1qw2qw',2,'bash1.sh',NULL),(4,'Aufgbe2','USW',1,'bash.sh','FILE'),(7,'Aufgbe2','vfnd hfiods  blib bial üoj',1,'bash1.sh','FILE'),(8,'Aufgbe2','vfnd hfiods  blib bial üoj',1,'bash1.sh','FILE'),(9,'Aufgbe2','vfnd hfiods  blib bial üoj',1,'bash1.sh','FILE'),(10,'Aufgbe2','vfnd hfiods  blib bial üoj',1,'bash1.sh','FILE'),(11,'Aufgbe11','Bitte legen Sie an und machen Sie so',1,'bash1.sh','FILE');
/*!40000 ALTER TABLE `task` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `token`
--

DROP TABLE IF EXISTS `token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `token` (
  `token_hash` varchar(255) NOT NULL,
  `valid_for_id` int(11) NOT NULL,
  `token_type` enum('SUBMISSION_TEST_FILE','TASK_TEST_FILE') DEFAULT NULL COMMENT 'Enum may be extended in future',
  `valid_until` datetime NOT NULL,
  `token_created_stamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `used` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`token_hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `token`
--

LOCK TABLES `token` WRITE;
/*!40000 ALTER TABLE `token` DISABLE KEYS */;
INSERT INTO `token` VALUES ('06577cef4ecd3a81e6d3681a6fb3add5da8969d7',65,'SUBMISSION_TEST_FILE','2018-11-29 12:38:36','2018-11-29 12:33:36',0),('128a279afcd04de72ec5c2a80b58bda4cce08d9b',4,'TASK_TEST_FILE','2018-11-29 16:26:42','2018-11-29 16:21:42',1),('1a9938b3e53a764c1ad98b6d1d479b2edc74f5ec',6,'TASK_TEST_FILE','2018-11-29 13:07:28','2018-11-29 13:02:28',1),('204a560bc08d1d4261f5773fd8a2e2340e257e32',11,'TASK_TEST_FILE','2018-11-29 16:34:02','2018-11-29 16:29:02',0),('24957c6bd2e80d9fe84a3ed8fa229a0ab65a51de',4,'TASK_TEST_FILE','2018-11-29 16:26:24','2018-11-29 16:21:24',0),('3fae976c877097920d6d78863f7b721c3cc2e0cf',4,'TASK_TEST_FILE','2018-11-29 12:51:51','2018-11-29 12:46:51',1),('44681858c4d6cff2ee0ed34e4562ff4a133bd8d4',4,'TASK_TEST_FILE','2018-11-29 16:20:57','2018-11-29 16:15:57',0),('5aaa955cbc13608cc3224b6b9f221bb28dde1516',10,'TASK_TEST_FILE','2018-11-29 16:33:49','2018-11-29 16:28:49',0),('8ad1c3c7750906a4004852a065fe6b1d1ea90397',4,'TASK_TEST_FILE','2018-11-29 16:26:14','2018-11-29 16:21:14',0),('9dbdac72c2085e3d2c4f2a12bca0c505d0277a62',8,'TASK_TEST_FILE','2018-11-29 16:33:48','2018-11-29 16:28:48',0),('aea507658661e106493734ff8e5d29b0047d594d',4,'TASK_TEST_FILE','2018-11-29 16:21:11','2018-11-29 16:16:11',0),('aed06bc5906654b75826471ba6e5317f55da64c4',5,'TASK_TEST_FILE','2018-11-29 12:53:38','2018-11-29 12:48:38',1),('bab6383462367fb66d1c80ca54dbfe66b9d6d6bf',4,'TASK_TEST_FILE','2018-11-29 16:19:44','2018-11-29 16:14:44',0),('bfa121fe100d8a21b921e2553b26c8945c0e07d3',4,'TASK_TEST_FILE','2018-11-29 16:19:26','2018-11-29 16:14:26',0),('c3702de268d6d6c5edf61da9a5e2a11f3aff4e5e',4,'TASK_TEST_FILE','2018-11-29 16:21:05','2018-11-29 16:16:05',0),('d93f3a0f0fa1cac7fab9deed311412bfc056e4c4',64,'SUBMISSION_TEST_FILE','2018-11-29 11:25:22','2018-11-29 11:20:22',1),('d9be5fd7bb857d4b078496dd978bcf66e9d87aad',-1,'SUBMISSION_TEST_FILE','2018-11-29 11:24:07','2018-11-29 11:19:07',1),('ddc39a3889f7c3b1f95fbbeacc0cfd76c5f153a6',4,'TASK_TEST_FILE','2018-11-29 16:21:52','2018-11-29 16:16:52',0),('e265b6b08373bed760e7cef68e479985be882b25',66,'SUBMISSION_TEST_FILE','2018-11-29 14:19:31','2018-11-29 14:14:31',0),('e7dc493be07030daeda04c8439fb7046ed30685a',9,'TASK_TEST_FILE','2018-11-29 16:33:48','2018-11-29 16:28:48',0),('f38de1dd17f4c1a2cc59b547dda8577189e9f54a',4,'TASK_TEST_FILE','2018-11-29 16:26:21','2018-11-29 16:21:21',0),('f9629c97afce9656ac335de5fdb5a66bbccfb0c3',7,'TASK_TEST_FILE','2018-11-29 16:33:46','2018-11-29 16:28:46',0),('huiwqfgduiegfdui',3,'TASK_TEST_FILE','2018-12-01 12:03:05','2018-11-29 07:17:39',1);
/*!40000 ALTER TABLE `token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `user` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `prename` varchar(100) DEFAULT NULL,
  `surname` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `role_id` int(11) DEFAULT NULL,
  `username` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  KEY `user_role_role_id_fk` (`role_id`),
  CONSTRAINT `user_role_role_id_fk` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'Admin','Admin',NULL,1,'admin'),(2,'TEST','super','test',4,'hiwi'),(53,NULL,NULL,NULL,8,'bmnn57'),(54,'prof','prof',NULL,2,'prof');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_course`
--

DROP TABLE IF EXISTS `user_course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `user_course` (
  `course_id` int(1) NOT NULL,
  `user_id` int(11) NOT NULL,
  `typ` enum('SUBSCRIBE','EDIT') NOT NULL DEFAULT 'SUBSCRIBE',
  PRIMARY KEY (`course_id`,`user_id`),
  KEY `user_has_courses_users_user_id_fk` (`user_id`),
  CONSTRAINT `user_course_course_course_id_fk` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_has_courses_users_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_course`
--

LOCK TABLES `user_course` WRITE;
/*!40000 ALTER TABLE `user_course` DISABLE KEYS */;
INSERT INTO `user_course` VALUES (1,2,'EDIT'),(1,53,'EDIT'),(2,53,'SUBSCRIBE'),(2,54,'EDIT'),(4,53,'SUBSCRIBE'),(5,53,'SUBSCRIBE'),(6,53,'SUBSCRIBE'),(7,53,'SUBSCRIBE');
/*!40000 ALTER TABLE `user_course` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-11-29 19:05:19
