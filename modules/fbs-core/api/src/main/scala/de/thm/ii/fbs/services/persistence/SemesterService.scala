package de.thm.ii.fbs.services.persistence

import java.math.BigInteger
import java.sql.{ResultSet, SQLException}
import de.thm.ii.fbs.model.Semester
import de.thm.ii.fbs.util._
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
class SemesterService {
  @Autowired
  private implicit val jdbc: JdbcTemplate = null

  /**
    * Get all semester
    *
    * @return List of semester
    */
  def getAll: List[Semester] = DB.query(
    "SELECT name FROM semester",
    (res, _) => parseResult(res))

  /**
    * Lookup semester by id
    *
    * @param id The Semester id
    * @return The found Semester
    */
  def find(id: Int): Option[Semester] = DB.query(
    "SELECT name FROM semester WHERE semester_id = ?",
    (res, _) => parseResult(res), id).headOption

  /**
    * Create a new semester
    *
    * @param semester The semester
    * @return The created semester with id
    */
  def create(semester: Semester): Semester = {
    DB.insert("INSERT INTO semester (name) VALUES (?);", semester.name)
      .map(gk => gk(0).asInstanceOf[BigInteger].intValue())
      .flatMap(id => find(id)) match {
      case Some(semester) => semester
      case None => throw new SQLException("Semester could not be created")
    }
  }

  /**
    * Update a semester
    *
    * @param sid    The semester id
    * @param semester The semester
    * @return True if successful
    */
  def update(sid: Int, semester: Semester): Boolean = {
    1 == DB.update("UPDATE semester SET name = ? WHERE semester_id = ?", semester.name, sid)
  }

  /**
    * Delete a semester by id
    *
    * @param id The semester id
    * @return True if successful
    */
  def delete(id: Int): Boolean = 1 == DB.update("DELETE FROM semester WHERE semester_id = ?", id)

  private def parseResult(res: ResultSet): Semester = Semester(
    id = res.getInt("semester_id"),
    name = res.getString("name"),
  )
}
