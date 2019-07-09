-- MySQL dump 10.13  Distrib 8.0.13, for macos10.14 (x86_64)
--
-- Host: mysql1    Database: submissionchecker
-- ------------------------------------------------------
-- Server version	8.0.15

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
  PRIMARY KEY (`course_id`),
  UNIQUE KEY `courses_courseid_uindex` (`course_id`),
  KEY `courses_users_userid_fk` (`creator`),
  CONSTRAINT `courses_users_userid_fk` FOREIGN KEY (`creator`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

ALTER TABLE course ADD plagiarism_script BOOLEAN DEFAULT false  NULL;

--
-- Table structure for table `login_log`
--

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


--
-- Table structure for table `role`
--

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

--
-- Table structure for table `setting`
--

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
-- Table structure for table `submission`
--

DROP TABLE IF EXISTS `submission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `submission` (
  `submission_id` int(11) NOT NULL AUTO_INCREMENT,
  `passed` tinyint(4) DEFAULT NULL,
  `exitcode` int(5) DEFAULT NULL,
  `result` text,
  `submit_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `result_date` timestamp NULL DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;



-- Table structure for table `task`
--

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

LOCK TABLES `task` WRITE;
/*!40000 ALTER TABLE `task` DISABLE KEYS */;
INSERT INTO `task` VALUES (204,'dxasd','SADasd',131,'','secrettokenchecker','2019-03-29 11:31:07',1,'',0),(209,'TEST me','sql',131,'hello world.sh','secrettokenchecker','2019-03-22 14:16:29',NULL,NULL,0),(222,'dsad','## Sample Table\n\n``code``\n\n| Tables        | Are           | Cool  |\n| ------------- |:-------------:| -----:|\n| col 3 is      | right-aligned | $1600 |\n| col 2 is      | centered      |   $12 |\n| zebra stripes | are neat      |    $1 |\n',133,'hello world.sh','secrettokenchecker','2019-03-29 08:19:52',1,'',0),(223,'2','2',133,'shasum.sh','secrettokenchecker','2019-03-30 08:24:32',1,'',0),(224,'Aufagabe No 3','3',133,'sections.json,db.sql','secrettokenchecker','2019-03-30 08:24:44',1,'',0),(225,'4','4',133,'hello world.sh','secrettokenchecker','2019-03-29 08:24:51',1,'',0),(226,'5','5',133,'hello world.sh','secrettokenchecker','2019-03-30 08:24:59',1,'',0),(227,'Eine andere Aufgabe','asdas',133,'abgabe.txt','secrettokenchecker','2019-03-27 08:32:59',1,'',0),(228,'dasd','aSD',133,'db.sql,sections.json','sqlchecker','2019-03-25 08:33:14',1,'',0),(229,'asdAS','DADSASD',133,'hello world.sh','secrettokenchecker','2019-03-29 08:34:05',1,'',0),(232,'Ein Name','Das ist zu tun',133,'md5sum.sh','secrettokenchecker','2019-03-29 11:47:24',1,'',0),(239,'Test ST 001','Test ST 001',133,'scriptfile','secrettokenchecker','2019-03-29 13:18:01',1,'',0),(240,'Test ST 001','Test ST 001',133,'scriptfile','secrettokenchecker','2019-03-29 13:18:01',1,'',0),(241,'Neuer Test 2','MD5 !!!',130,'testfile,scriptfile','secrettokenchecker','2019-04-20 07:23:52',1,'',0),(242,'Test ST 001','Test ST 001',130,'scriptfile','secrettokenchecker','2019-03-31 14:24:45',1,'',0),(243,'TESTFILE_PATH','TESTFILE_PATH',130,'scriptfile','secrettokenchecker','2019-03-29 13:31:14',1,'',0),(244,'neueue','zegug',130,'scriptfile','secrettokenchecker','2019-03-30 13:37:53',1,'',0),(245,'n','iojoijio',130,'scriptfile','secrettokenchecker','2019-05-04 16:38:59',1,'',0),(246,'I Like it','I like text',130,'scriptfile','secrettokenchecker','2019-03-29 21:32:47',1,'',0),(248,'test','test',133,'scriptfile','secrettokenchecker','2019-03-30 10:17:41',NULL,NULL,0),(249,'neue aufgabe','hdsihfi',133,'scriptfile','secrettokenchecker','2019-03-29 10:18:28',NULL,NULL,0),(250,'neueneueneuen','ueneuneueneeuen',133,'scriptfile','secrettokenchecker','2019-03-30 10:19:40',1,'',0),(251,'dasdsa','asdasd',133,'scriptfile','secrettokenchecker','2019-03-30 10:39:19',1,'',0),(252,'sad','ASDASD',133,'scriptfile','secrettokenchecker','2019-03-30 10:57:27',1,'',0),(253,'sqDS','SAD',133,'scriptfile','secrettokenchecker','2019-03-30 10:58:52',1,'',0),(254,'uuu','uuu',133,'scriptfile','secrettokenchecker','2019-03-30 11:02:07',1,'',0),(255,'dssdds','sdsdsd',133,'scriptfile','secrettokenchecker','2019-03-30 11:07:48',1,'',0),(256,'d kwfnkdndfD','DASDAS',133,'scriptfile','secrettokenchecker','2019-03-30 11:08:48',1,'',0),(257,'SUPPI','JOJOJO',133,'scriptfile','secrettokenchecker','2019-03-30 11:10:21',1,'',0),(258,'NEENEI','NEIENEI',133,'scriptfile','secrettokenchecker','2019-03-30 11:11:49',1,'',0),(259,'dsdsd','sdsd',133,'scriptfile','secrettokenchecker','2019-03-30 11:14:05',1,'',0),(260,'q','q',133,'scriptfile','secrettokenchecker','2019-03-30 11:14:52',1,'',0),(261,'dsds','dsds',133,'scriptfile','secrettokenchecker','2019-03-30 13:12:24',1,'',0),(262,'dsds','dsds',133,'scriptfile','secrettokenchecker','2019-03-30 13:13:29',1,'',0),(263,'dsdsd','dsds',133,'scriptfile','secrettokenchecker','2019-03-30 13:16:14',1,'',0),(264,'balab','balbal',133,'scriptfile','secrettokenchecker','2019-05-04 13:52:24',NULL,NULL,0),(265,'SQL SQL','SQL Aufgabe',130,'sections.json,db.sql','sqlchecker','2019-04-05 06:41:53',1,'',0),(267,'fdafds','fsdfsdf',130,NULL,'secrettokenchecker','2019-04-11 17:18:06',NULL,NULL,0),(268,'fdafds','fsdfsdf',130,NULL,'secrettokenchecker','2019-04-11 17:18:06',NULL,NULL,0),(269,'SQL','SQL',130,NULL,'sqlchecker','2019-04-10 17:30:39',NULL,NULL,0),(270,'sql','sql',130,NULL,'sqlchecker','2019-04-10 17:32:27',NULL,NULL,0),(291,'aSAS','asaS',139,'scriptfile','secrettokenchecker','2019-04-18 13:54:24',1,'',0),(292,'asdas','asdasd',139,'scriptfile','secrettokenchecker','2019-04-11 14:05:39',1,'',0),(293,'SQL','SQL',139,'sections.json,db.sql','sqlchecker','2019-05-24 14:25:47',1,'',0),(294,'dsasd','sadsad',133,'scriptfile','secrettokenchecker','2019-04-26 14:30:46',1,'',0),(295,'asdsad','sadsad',133,'scriptfile','secrettokenchecker','2019-05-25 14:31:19',1,'',0),(297,'SQL 2','SQL 2',133,'sections.json,db.sql','sqlchecker','2019-04-26 14:35:18',1,'',0),(298,'sadas','asdasd',133,'scriptfile','secrettokenchecker','2019-04-25 16:34:33',1,'',0),(299,'asdsd','sdsad',133,'scriptfile','secrettokenchecker','2019-04-10 16:34:49',1,'',0),(300,'test','test',141,'scriptfile','secrettokenchecker','2019-04-25 06:57:48',1,'',0),(304,'Aufgabe','## hello  world',143,'scriptfile','secrettokenchecker','2019-04-24 12:32:45',1,'',0),(305,'test','## test\n**test**',144,'scriptfile','secrettokenchecker','2019-04-30 15:25:21',1,'',0),(306,'test 2','## dsad',144,'scriptfile','secrettokenchecker','2019-04-30 16:50:17',1,'',0);
/*!40000 ALTER TABLE `task` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `testsystem`
--

DROP TABLE IF EXISTS `testsystem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `testsystem` (
  `testsystem_id` varchar(30) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `supported_formats` varchar(255) DEFAULT NULL COMMENT 'has to be a comma seperated list of values, like: sql, java, php, bash',
  `machine_port` int(11) DEFAULT NULL,
  `machine_ip` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`testsystem_id`),
  UNIQUE KEY `testsystem_testsystem_id_uindex` (`testsystem_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `testsystem`
--

LOCK TABLES `testsystem` WRITE;
/*!40000 ALTER TABLE `testsystem` DISABLE KEYS */;
INSERT INTO `testsystem` VALUES ('plagiarismchecker','plagiarismchecker',NULL,NULL,NULL,NULL),('secrettokenchecker','Secretoken Checker','Sectretoken','BASH',8000,'000.000.000.000'),('sqlchecker','SQL','XXXXX','.sql, ',1234,'000.000.000.000');
INSERT INTO submissionchecker.testsystem (testsystem_id, name, description, supported_formats, machine_port, machine_ip) VALUES ('sapabapchecker', 'ABAP Testsystem', 'ABAP code will be executed in a real SAP system', '', null, null);
/*!40000 ALTER TABLE `testsystem` ENABLE KEYS */;
UNLOCK TABLES;


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

--
-- Dumping data for table `testsystem_testfile`
--

LOCK TABLES `testsystem_testfile` WRITE;
/*!40000 ALTER TABLE `testsystem_testfile` DISABLE KEYS */;
INSERT INTO `testsystem_testfile` VALUES  ('gitchecker',	'config.json',	1), ('gitchecker', 'structurecheck', 0), ('secrettokenchecker','scriptfile',1),('secrettokenchecker','testfile',0),('sqlchecker', 'sections.json', 1),('sqlchecker', 'db.sql', 1);
/*!40000 ALTER TABLE `testsystem_testfile` ENABLE KEYS */;
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

CREATE TABLE notification
(
    n_id int PRIMARY KEY,
    user_id int,
    message TEXT,
    datetime DATETIME,
    testsystem_id varchar(30),
    CONSTRAINT notification_user_user_id_fk FOREIGN KEY (user_id) REFERENCES user (user_id),
    CONSTRAINT notification_testsystem_testsystem_id_fk FOREIGN KEY (testsystem_id) REFERENCES testsystem (testsystem_id)
);

ALTER TABLE notification MODIFY n_id int(11) NOT NULL auto_increment;