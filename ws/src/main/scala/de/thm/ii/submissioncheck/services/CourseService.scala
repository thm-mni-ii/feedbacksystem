package de.thm.ii.submissioncheck.services

import java.sql.{Connection, ResultSet}
import java.util

import scala.collection.JavaConverters._
import de.thm.ii.submissioncheck.config.MySQLConfig
import de.thm.ii.submissioncheck.misc.BadRequestException
import de.thm.ii.submissioncheck.model.User

import scala.collection.mutable.ListBuffer

/**
  * CourseService provides interaction with DB
  *
  * @author Benjamin Manns
  */
class CourseService {
  /** mysqlConnector establish connection to our mysql 8 DB */
  val mysqlConnector: Connection = new MySQLConfig().getConnector

  /**
    * CourseLabels holds all Course-Table lables
    * @author Benjamin Manns
    */
  class CourseLabels{
    /** holds label courseid*/
    val courseid: String = "course_id"
    /** holds label name*/
    val name: String = "name"
    /** holds label description*/
    val description: String = "description"
    /** holds label owner*/
    val owner: String = "owner"
  }

  /** holds all course-Table labels*/
  val courseLabels = new CourseLabels()

  /**
    * getCoursesByUser search courses by user object
    *
    * @author Benjamin Manns
    * @param user a User object
    * @return Java List of Maps
    */
  def getCoursesByUser(user: User): util.List[util.Map[String, String]] = {
    // TODO Check somehow if this is a course owner or a course participant
    val prparStmt = this.mysqlConnector.prepareStatement(
      "SELECT * FROM user_has_courses hc join course c using(course_id) where user_id = ?")
    prparStmt.setInt(1, user.userid)
    val resultSet = prparStmt.executeQuery()
    var courseList = new ListBuffer[java.util.Map[String, String]]()

    val resultIterator = new Iterator[ResultSet] {
      def hasNext: Boolean = resultSet.next()

      def next(): ResultSet = resultSet
    }.toStream

    for (res <- resultIterator.iterator) {
      courseList += Map(courseLabels.courseid -> res.getString(courseLabels.courseid),
        courseLabels.name -> res.getString(courseLabels.name),
        courseLabels.description -> res.getString(courseLabels.description),
        courseLabels.owner -> res.getString(courseLabels.owner)).asJava
    }
    courseList.toList.asJava
  }

  /**
    * Check if a given user is permitted to change course information, grand rights, add task, ...
    *
    * @author Benjamin Manns
    * @param courseid unique identification for a course
    * @param user a User object
    * @return Boolean, if a user is permitted for the course
    */
  def isPermittedForCourse(courseid: Integer, user: User):Boolean = {
    // TODO allow admin users here!
    val prparStmt = this.mysqlConnector.prepareStatement("SELECT ? IN (SELECT creator FROM course where course_id = ? UNION SELECT user_id from user_course where course_id = ? and typ = 'EDIT') as permitted")

    prparStmt.setInt(1, user.userid)
    prparStmt.setInt(2, courseid)
    prparStmt.setInt(3, courseid)

    val resultSet = prparStmt.executeQuery()

    if(resultSet.next()){
      resultSet.getInt("permitted") == 1
    }
    else{
      false
    }
  }

  /**
    *
    * @param courseid
    * @param user
    * @return
    */
  def isSubscriberForCourse(courseid: Integer, user: User):Boolean = {
    val prparStmt = this.mysqlConnector.prepareStatement("SELECT ? in (select user_id from user_course where course_id = ? and typ = 'SUBSCRIBE') as subscribed")
    prparStmt.setInt(1, user.userid)
    prparStmt.setInt(2, courseid)
    val resultSet = prparStmt.executeQuery()
    if(resultSet.next()){
      resultSet.getInt("subscribed") == 1
    }
    else{
      false
    }
  }

  /**
    * grant rights (spe
    * @param grandType which rights is specified here (we support just `edit` until now)
    * @param courseid unique identification for a course
    * @param user a user object
    * @return JSON if grant worked
    */
  def grandUserToACourse(grandType:String, courseid: Integer, user: User): util.Map[String, Boolean] = {
    val grandTypes = List("edit")
    if(!grandTypes.contains(grandType)){
      throw new BadRequestException("Please specify a valid grant_type.")
    }
    val prparStmt = this.mysqlConnector.prepareStatement(
      "insert ignore into user_course (user_id,course_id,typ) VALUES (?,?,'EDIT')")
    prparStmt.setInt(1, user.userid)
    prparStmt.setInt(2, courseid)

    Map("success" -> (prparStmt.executeUpdate() == 1)).asJava
  }


  /**
    * getCourseDetailes gives detailed infos about one course - later also task list
    *
    * @author Benjamin Manns
    * @param courseid unique course identification
    * @param user User object
    * @return Java Map
    */
  def getCourseDetailes(courseid: Integer, user: User):java.util.Map[String,String] = {

    var advanced_informations = "course_id, name, description"

    val isPermitted = this.isPermittedForCourse(courseid,user)

    if(isPermitted)
      {
        advanced_informations += ", creator" // TODO add more columns
      }

    val prparStmt = this.mysqlConnector.prepareStatement(
      "SELECT " + advanced_informations + " FROM course where course_id = ?")
    prparStmt.setInt(1, courseid)
    prparStmt.setInt(2, user.userid)
    val resultSet = prparStmt.executeQuery()

    var courseMap = Map[String,String]()
    if(resultSet.next())
      {
        courseMap += (courseLabels.courseid -> resultSet.getString(courseLabels.courseid),
          courseLabels.name -> resultSet.getString(courseLabels.name),
          courseLabels.description -> resultSet.getString(courseLabels.description),
          courseLabels.owner -> resultSet.getString(courseLabels.owner))
        println(courseMap)


        var taskList = new ListBuffer[java.util.Map[String, String]]()



        if(isPermitted || this.isSubscriberForCourse(courseid,user))
          {
            // TODO Add Task List from Task Service
          }
        Map(courseLabels.courseid -> resultSet.getString(courseLabels.courseid),
          courseLabels.name -> resultSet.getString(courseLabels.name),
          courseLabels.description -> resultSet.getString(courseLabels.description),
          courseLabels.owner -> resultSet.getString(courseLabels.owner)).asJava



      }
    else{
      Map().asJava
    }



  }
}
