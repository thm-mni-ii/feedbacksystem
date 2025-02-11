package de.thm.ii.fbs.services.persistence

import java.math.BigInteger
import java.sql.{ResultSet, SQLException}

import de.thm.ii.fbs.model.Group
import de.thm.ii.fbs.util._
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

/**
  * Handles the creation, deletion and modifications of groups persistent state.
  */
@Component
class GroupService{
  @Autowired
  private implicit val jdbc: JdbcTemplate = null

  /**
    * Get a group list
    *
    * @param cid Course id
    * @param ignoreHidden If true only visible groups will be returned
    * @return List of groups
    */
  def getAll(cid: Int, ignoreHidden: Boolean = true): List[Group] = DB.query(
    s"SELECT group_id, course_id, name, membership, visible FROM `group` WHERE" + (if (ignoreHidden) " visible = 1 AND" else "") + s" course_id = $cid",
    (res, _) => parseResult(res)
  )

  /**
    * Create a new group
    *
    * @param  group The group
    * @return The created group with id
    */
  def create(group: Group): Group = {
    DB.insert("INSERT INTO `group` (course_id, name, membership, visible) VALUES (?, ?, ?, ?);", group.courseId, group.name, group.membership, group.visible)
      .map(gk => gk(0).asInstanceOf[BigInteger].intValue())
      .flatMap(id => get(group.courseId, id)) match {
        case Some(group) => group
        case None => throw new SQLException("Group could not be created")
      }
  }

  /**
    * Get a single group by id
    *
    * @param cid Course id
    * @param gid Group id
    * @return The found Group
    */
  def get(cid: Int, gid: Int): Option[Group] = DB.query(
    "SELECT group_id, course_id, name, membership, visible FROM `group` WHERE course_id = ? AND group_id = ?",
    (res, _) => parseResult(res), cid, gid).headOption

  /**
    * Update a single group by id
    *
    * @param cid Course id
    * @param gid Group id
    * @param group The group
    * @return True if successful
    */
  def update(cid: Int, gid: Int, group: Group): Boolean = {
    1 == DB.update("UPDATE `group` SET name = ?, membership = ?, visible = ? WHERE course_id = ? AND group_id = ?",
      group.name, group.membership, group.visible, cid, gid)
  }

  /**
    * Delete a single group by id
    *
    * param cid Course id
    * @param gid Group id
    * @return True if successful
    */
  def delete(cid: Int, gid: Int): Boolean = 1 == DB.update("DELETE FROM `group` WHERE course_id = ? AND group_id = ?", cid, gid)

  private def parseResult(res: ResultSet): Group = Group(
    id = res.getInt("group_id"),
    courseId = res.getInt("course_id"),
    name = res.getString("name"),
    membership = res.getInt("membership"),
    visible = res.getBoolean("visible"),
  )
}
