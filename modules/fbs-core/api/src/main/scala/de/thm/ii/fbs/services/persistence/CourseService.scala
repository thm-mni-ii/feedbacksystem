package de.thm.ii.fbs.services.persistence

import java.math.BigInteger
import java.sql.{ResultSet, SQLException}

import de.thm.ii.fbs.model.Course
import de.thm.ii.fbs.util._
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

/**
  * CourseService provides interaction with DB
  */
@Component
class CourseService {
  @Autowired
  private implicit val jdbc: JdbcTemplate = null

  /**
    * Get all courses
    * @param ignoreHidden If true only visible courses will be returned
    * @return List of courses
    */
  def getAll(ignoreHidden: Boolean = true): List[Course] = DB.query(
    "SELECT course_id, semester_id, name, description, visible FROM course" + (if (ignoreHidden) " WHERE visible = 1" else ""),
    (res, _) => parseResult(res))

  /**
    * Search for a course whose name adhere to the pattern
    * @param pattern SQL like pattern, i.e., %like%
    * @param ignoreHidden If true only visible courses will be returned
    * @return List of courses
    */
  def findByPattern(pattern: String, ignoreHidden: Boolean = true): List[Course] = DB.query(
    "SELECT course_id, semester_id, name, description, visible FROM course WHERE name like ?" + (if (ignoreHidden) " AND visible = 1" else ""),
    (res, _) => parseResult(res), "%" + pattern + "%")

  /**
    * Lookup course by id
    * @param id The Course id
    * @return The found course
    */
  def find(id: Int): Option[Course] = DB.query(
    "SELECT course_id, semester_id, name, description, visible FROM course WHERE course_id = ?",
    (res, _) => parseResult(res), id).headOption

  /**
    * Create a new course
    * @param course The course
    * @return The created course with id
    */
  def create(course: Course): Course = {
    DB.insert("INSERT INTO course (semester_id, name, description, visible) VALUES (?,?,?,?);", course.semester_id, course.name, course.description, course.visible)
      .map(gk => gk(0).asInstanceOf[BigInteger].intValue())
      .flatMap(id => find(id)) match {
      case Some(course) => course
      case None => throw new SQLException("Course could not be created")
    }
  }

  /**
    * Update a course
    * @param cid The course id
    * @param course The course
    * @return True if successful
    */
  def update(cid: Int, course: Course): Boolean = {
    1 == DB.update("UPDATE course SET semester_id = ?, name = ?, description = ?, visible = ? WHERE course_id = ?",
      course.semester_id, course.name, course.description, course.visible, cid)
  }

  /**
    * Delete a course by id
    * @param id The course id
    * @return True if successful
    */
  def delete(id: Int): Boolean = 1 == DB.update("DELETE FROM course WHERE course_id = ?", id)

  private def parseResult(res: ResultSet): Course = Course(
    semester_id = res.getInt("semester_id"),
    name = res.getString("name"),
    description = res.getString("description"),
    visible = res.getBoolean("visible"),
    id = res.getInt("course_id")
  )
}
