package de.thm.ii.submissioncheck.services

import java.sql.{Connection, ResultSet}
import java.util
import scala.collection.JavaConverters._
import de.thm.ii.submissioncheck.config.MySQLConfig
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
    * getCourseDetailes gives detailed infos about one course - later also task list
    * @param courseid unique course identification
    * @param user User object
    * @return Java Map
    */
  def getCourseDetailes(courseid: String, user: User): util.Map[String, String] = {
    val prparStmt = this.mysqlConnector.prepareStatement(
      "SELECT * FROM courses where course_id = ? and owner = ?")
    prparStmt.setString(1, courseid)
    prparStmt.setInt(2, user.userid)
    val resultSet = prparStmt.executeQuery()
    if(resultSet.next())
      {
        val courseMap = Map(courseLabels.courseid -> resultSet.getString(courseLabels.courseid),
          courseLabels.name -> resultSet.getString(courseLabels.name),
          courseLabels.description -> resultSet.getString(courseLabels.description),
          courseLabels.owner -> resultSet.getString(courseLabels.owner))

        var taskList = new ListBuffer[java.util.Map[String, String]]()

        // TODO Add Task List from Task Service
        courseMap.asJava

      }
    else{
      Map().asJava
    }
  }
}
