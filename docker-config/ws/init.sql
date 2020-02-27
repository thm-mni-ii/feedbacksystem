-- MySQL dump 10.13  Distrib 8.0.13, for macos10.14 (x86_64)
--
-- Host: 127.0.0.1    Database: submissionchecker
-- ------------------------------------------------------
-- Server version	8.0.16

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
  `course_name` varchar(100) DEFAULT NULL,
  `course_description` text,
  `creator` int(11) NOT NULL,
  `standard_task_typ` varchar(200) DEFAULT NULL,
  `course_modul_id` varchar(255) DEFAULT NULL,
  `course_semester` varchar(255) DEFAULT NULL,
  `course_end_date` date DEFAULT NULL,
  `personalised_submission` tinyint(1) DEFAULT '0',
  `course_visibility` enum('HIDDEN','VISIBLE') DEFAULT 'VISIBLE',
  `plagiarism_script` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`course_id`),
  UNIQUE KEY `courses_courseid_uindex` (`course_id`),
  KEY `courses_users_userid_fk` (`creator`),
  CONSTRAINT `courses_users_userid_fk` FOREIGN KEY (`creator`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `course_parameter`
--

DROP TABLE IF EXISTS `course_parameter`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `course_parameter` (
  `course_id` int(11) NOT NULL,
  `c_param_desc` text,
  `c_param_key` varchar(500) NOT NULL,
  PRIMARY KEY (`course_id`,`c_param_key`),
  KEY `course_parameter_c_param_key_index` (`c_param_key`),
  CONSTRAINT `course_parameter_course_course_id_fk` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


DROP TABLE IF EXISTS `course_parameter_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `course_parameter_user` (
  `course_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `c_param_key` varchar(500) NOT NULL,
  `value` text,
  PRIMARY KEY (`course_id`,`user_id`,`c_param_key`),
  KEY `course_parameter_user_user_user_id_fk` (`user_id`),
  KEY `course_parameter_user_course_parameter_c_param_key_fk` (`c_param_key`),
  CONSTRAINT `course_parameter_user_course_course_id_fk` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`),
  CONSTRAINT `course_parameter_user_course_parameter_c_param_key_fk` FOREIGN KEY (`c_param_key`) REFERENCES `course_parameter` (`c_param_key`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `course_parameter_user_user_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;



DROP TABLE IF EXISTS `login_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `login_log` (
  `login_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` int(11) DEFAULT NULL,
  KEY `login_log_user_user_id_fk` (`user_id`),
  CONSTRAINT `login_log_user_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `notification` (
  `n_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `message` text,
  `datetime` datetime DEFAULT NULL,
  `testsystem_id` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`n_id`),
  KEY `notification_user_user_id_fk` (`user_id`),
  KEY `notification_testsystem_testsystem_id_fk` (`testsystem_id`),
  CONSTRAINT `notification_testsystem_testsystem_id_fk` FOREIGN KEY (`testsystem_id`) REFERENCES `testsystem` (`testsystem_id`),
  CONSTRAINT `notification_user_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `notification` (
  `n_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `message` text,
  `datetime` datetime DEFAULT NULL,
  `testsystem_id` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`n_id`),
  KEY `notification_user_user_id_fk` (`user_id`),
  KEY `notification_testsystem_testsystem_id_fk` (`testsystem_id`),
  CONSTRAINT `notification_testsystem_testsystem_id_fk` FOREIGN KEY (`testsystem_id`) REFERENCES `testsystem` (`testsystem_id`),
  CONSTRAINT `notification_user_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;



DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `role` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(30) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL,
  `role_description` varchar(200) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL,
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES (1,'admin','Can delete and grand users. Can create courses'),(2,'moderator','Can create courses'),(4,'docent','Can edit course, can create task for course, grant tutor to other course'),(8,'tutor','Can edit course, can create task for course'),(16,'student',NULL);
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;


DROP TABLE IF EXISTS `setting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `setting` (
  `setting_key` varchar(200) NOT NULL,
  `setting_val` text,
  `setting_typ` enum('TEXT','BOOL','STRING','INT','FLOAT','DATE','TIMESTAMP') DEFAULT NULL,
  PRIMARY KEY (`setting_key`),
  UNIQUE KEY `setting_setting_key_uindex` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `setting`
--

LOCK TABLES `setting` WRITE;
/*!40000 ALTER TABLE `setting` DISABLE KEYS */;
/*!40000 ALTER TABLE `setting` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `submission`
--

DROP TABLE IF EXISTS `submission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `submission` (
  `submission_id` int(11) NOT NULL AUTO_INCREMENT,
  `submit_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` int(11) DEFAULT NULL,
  `task_id` int(11) DEFAULT NULL,
  `filename` varchar(255) DEFAULT NULL,
  `submission_data` text,
  `plagiat_passed` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`submission_id`),
  KEY `submission_task_taskid_fk` (`task_id`),
  KEY `submission_users_userid_fk` (`user_id`),
  CONSTRAINT `submission_task_taskid_fk` FOREIGN KEY (`task_id`) REFERENCES `task` (`task_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `submission_users_userid_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17252 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `submission_testsystem`
--

DROP TABLE IF EXISTS `submission_testsystem`;

CREATE TABLE `submission_testsystem` (
  `submission_id` int(11) NOT NULL,
  `testsystem_id` varchar(500) NOT NULL,
  `exitcode` int(11) DEFAULT NULL,
  `passed` tinyint(1) DEFAULT NULL,
  `result_date` datetime DEFAULT NULL,
  `step` int(11) DEFAULT NULL,
  `result` text,
  `result_type` varchar(50) DEFAULT NULL,
  `choice_best_result_fit` text,
  `calculate_pre_result` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

alter table submission_testsystem add constraint submission_testsystem_pk unique (submission_id, testsystem_id);

DROP TABLE IF EXISTS `task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `task` (
  `task_id` int(11) NOT NULL AUTO_INCREMENT,
  `task_name` varchar(200) DEFAULT NULL,
  `task_description` text,
  `course_id` int(11) DEFAULT NULL,
  `test_file_name` varchar(255) DEFAULT NULL,
  `testsystem_id` varchar(30) DEFAULT NULL,
  `deadline` datetime DEFAULT NULL,
  `test_file_accept` tinyint(1) DEFAULT NULL COMMENT 'Tasksystem will return true or false if provided testfile(s) are acceptable for selected testsystem',
  `test_file_accept_error` text,
  `plagiat_check_done` tinyint(1) DEFAULT '0',
  `testsystem_modus` enum('SEQ','MULTI') NOT NULL,
  `load_external_description` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`task_id`),
  KEY `task_courses_courseid_fk` (`course_id`),
  KEY `task_testsystem_testsystem_id_fk` (`testsystem_id`),
  CONSTRAINT `task_course_course_id_fk` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `task_testsystem_testsystem_id_fk` FOREIGN KEY (`testsystem_id`) REFERENCES `testsystem` (`testsystem_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task`
--


--
-- Table structure for table `task_testsystem`
--

DROP TABLE IF EXISTS `task_testsystem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `task_testsystem` (
  `task_id` int(11) NOT NULL,
  `testsystem_id` int(11) NOT NULL,
  `ordnr` int(11) NOT NULL,
  `test_file_accept` tinyint(1) DEFAULT NULL,
  `test_file_accept_error` text,
  `test_file_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`task_id`,`testsystem_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_testsystem`
--

LOCK TABLES `task_testsystem` WRITE;
/*!40000 ALTER TABLE `task_testsystem` DISABLE KEYS */;
/*!40000 ALTER TABLE `task_testsystem` ENABLE KEYS */;
UNLOCK TABLES;

DROP TABLE IF EXISTS `task_external_description`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `task_external_description` (
  `task_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `testsystem_id` varchar(100) NOT NULL,
  `description` text,
  PRIMARY KEY (`user_id`,`task_id`,`testsystem_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;



--
-- Table structure for table `task_testsystem`
--

DROP TABLE IF EXISTS `task_testsystem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `task_testsystem` (
  `task_id` int(11) NOT NULL,
  `testsystem_id` varchar(500) NOT NULL,
  `ordnr` int(11) NOT NULL,
  `test_file_accept` tinyint(1) DEFAULT NULL,
  `test_file_accept_error` text,
  `test_file_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`task_id`,`ordnr`,`testsystem_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


DROP TABLE IF EXISTS `testsystem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `testsystem` (
  `testsystem_id` varchar(30) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `supported_formats` varchar(255) DEFAULT NULL COMMENT 'has to be a comma seperated list of values, like: sql, java, php, bash',
  `machine_port` int(11) DEFAULT NULL,
  `machine_ip` varchar(255) DEFAULT NULL,
  `accepted_input` int(11) DEFAULT NULL COMMENT '0 - nothing\n1 - text\n2 - file\n4 - choice',
  PRIMARY KEY (`testsystem_id`),
  UNIQUE KEY `testsystem_testsystem_id_uindex` (`testsystem_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `testsystem`
--

LOCK TABLES `testsystem` WRITE;
/*!40000 ALTER TABLE `testsystem` DISABLE KEYS */;
INSERT INTO `testsystem` VALUES ('gitchecker','gitchecker',NULL,NULL,NULL,NULL,1), ('gitstatschecker','gitstatschecker',NULL,NULL,NULL,NULL,4),('multiplechoicechecker','Multiplechoice Checker',NULL,NULL,NULL,NULL,4),('nodechecker','Node Checker','Provides Node Docker with Pupeteer for Testing JavaScript',NULL,NULL,NULL,2),('plagiarismchecker','plagiarismchecker',NULL,NULL,NULL,NULL,0),('sapabapchecker','ABAP Testsystem','ABAP code will be executed in a real SAP system','',NULL,NULL,3),('secrettokenchecker','Secretoken Checker','Sectretoken','BASH',8000,'000.000.000.000',3),('sqlchecker','SQL Checker','XXXXX','.sql, ',1234,'000.000.000.000',3);
/*!40000 ALTER TABLE `testsystem` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

--
-- Table structure for table `testsystem_testfile`
--

DROP TABLE IF EXISTS `testsystem_testfile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `testsystem_testfile` (
  `testsystem_id` varchar(30) DEFAULT NULL,
  `filename` varchar(500) DEFAULT NULL,
  `required` tinyint(1) DEFAULT '1',
  KEY `testsystem_testfile_testsystem_testsystem_id_fk` (`testsystem_id`),
  CONSTRAINT `testsystem_testfile_testsystem_testsystem_id_fk` FOREIGN KEY (`testsystem_id`) REFERENCES `testsystem` (`testsystem_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


LOCK TABLES `testsystem_testfile` WRITE;
/*!40000 ALTER TABLE `testsystem_testfile` DISABLE KEYS */;
INSERT INTO `testsystem_testfile` VALUES ('gitchecker',	'config.json',	0), ('gitchecker', 'structurecheck', 1), ('secrettokenchecker','scriptfile',1),('secrettokenchecker','testfile',0),('sqlchecker', 'sections.json', 1),('sqlchecker', 'db.sql', 1);
/*!40000 ALTER TABLE `testsystem_testfile` ENABLE KEYS */;
UNLOCK TABLES;


--
-- Table structure for table `resubmission`
--

DROP TABLE IF EXISTS `resubmission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resubmission` (
  `subid` int(11) DEFAULT NULL,
  `ordnr` int(11) DEFAULT NULL,
  `testsystem_id` varchar(500) DEFAULT NULL,
  `result` text,
  `test_file_accept` tinyint(1) DEFAULT NULL,
  `test_file_accept_error` text,
  `test_file_name` varchar(255) DEFAULT NULL,
  `result_type` varchar(50) DEFAULT NULL,
  KEY `resubmission_submission_submission_id_fk` (`subid`),
  KEY `resubmission_testsystem_testsystem_id_fk` (`testsystem_id`),
  CONSTRAINT `resubmission_submission_submission_id_fk` FOREIGN KEY (`subid`) REFERENCES `submission` (`submission_id`),
  CONSTRAINT `resubmission_testsystem_testsystem_id_fk` FOREIGN KEY (`testsystem_id`) REFERENCES `testsystem` (`testsystem_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


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
  `password` varchar(255) DEFAULT NULL,
  `username` varchar(200) DEFAULT NULL,
  `role_id` int(11) DEFAULT NULL COMMENT 'it is his global role_id',
  `privacy_checked` tinyint(1) DEFAULT '0',
  `status` int(11) DEFAULT '1',
  PRIMARY KEY (`user_id`),
  KEY `user_role_role_id_fk` (`role_id`),
  CONSTRAINT `user_role_role_id_fk` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'Admin','Admin',NULL,'2c8e25270865a74e374db1ad6e7005b406f23cb6','admin',1, 0, 1);
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
  `role_id` int(11) NOT NULL,
  PRIMARY KEY (`course_id`,`user_id`),
  KEY `user_has_courses_users_user_id_fk` (`user_id`),
  KEY `user_course_role_role_id_fk` (`role_id`),
  CONSTRAINT `user_course_course_course_id_fk` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_course_role_role_id_fk` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_has_courses_users_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

DROP TABLE IF EXISTS `task_extension`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_extension` (
  `taskid` int NOT NULL,
  `userid` int NOT NULL,
  `subject` varchar(255) NOT NULL,
  `data` text,
  `info_typ` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`taskid`,`userid`,`subject`),
  KEY `task_extension_user_user_id_fk` (`userid`),
  CONSTRAINT `task_extension_task_task_id_fk` FOREIGN KEY (`taskid`) REFERENCES `task` (`task_id`),
  CONSTRAINT `task_extension_user_user_id_fk` FOREIGN KEY (`userid`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;