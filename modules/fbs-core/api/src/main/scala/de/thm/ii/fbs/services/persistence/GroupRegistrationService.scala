package de.thm.ii.fbs.services.persistence

import de.thm.ii.fbs.model._
import de.thm.ii.fbs.util.DB
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

import java.sql.ResultSet
import org.springframework.jdbc.core.RowMapper

/**
  * Handles group registration and participants.
  */
@Component
class GroupRegistrationService {
  @Autowired
  private implicit val jdbc: JdbcTemplate = null

  /**
    * Add a user to a group
    *
    * @param uid User id
    * @param cid Course id
    * @param gid Group id
    * @return True if successful
    */
  def addUserToGroup(uid: Int, cid: Int, gid: Int): Boolean =
    1 == DB.update("INSERT INTO user_group (user_id, course_id, group_id) VALUES (?,?,?);", uid, cid, gid)

  /**
    * Remove a user from a group
    *
    * @param uid User id
    * @param cid Course id
    * @param gid Group id
    * @return True if successfully deregistered
    */
  def removeUserFromGroup(uid: Int, cid: Int, gid: Int): Boolean =
    1 == DB.update("DELETE FROM user_group WHERE user_id = ? AND course_id = ? AND group_id = ?", uid, cid, gid)

  /**
    * Remove all users from a group
    *
    * @param cid Course id
    * @param gid Group id
    * @return True if successfully deregistered
    */
  def removeAllUsersFromGroup(cid: Int, gid: Int): Boolean =
    1 == DB.update("DELETE FROM user_group WHERE course_id = ? AND group_id = ?", cid, gid)

  /**
    * Retrieve all groups of a specific user
    *
    * @param uid User id
    * @param ignoreHidden True if hidden groups should be ignored
    * @return List of groups
    */
  def getUserGroups(uid: Int, ignoreHidden: Boolean = true): List[Group] = DB.query(
    "SELECT g.group_id, g.course_id, g.name, g.membership, g.visible " +
      "FROM `group` g JOIN user_group ug ON g.group_id = ug.group_id WHERE ug.user_id = ? ORDER BY g.course_id ASC"
      + (if (ignoreHidden) " AND g.visible = 1" else ""),
    (res, _) => parseResult(res), uid)

  /**
    * Get all members of a group
    *
    * @param cid Course id
    * @param gid Group id
    * @return List of members
    */
  def getMembers(cid: Int, gid: Int): List[Participant] = DB.query(
    "SELECT u.user_id, u.prename, u.surname, u.email, u.username, u.alias, u.global_role, uc.course_role " +
      "FROM user u " +
      "JOIN user_course uc ON u.user_id = uc.user_id " +
      "JOIN user_group ug ON uc.course_id = ug.course_id AND uc.user_id = ug.user_id " +
      "WHERE u.deleted = 0 AND ug.course_id = ? AND ug.group_id = ?",
    (res, _) => Participant(parseUserResult(res), CourseRole.parse(res.getInt("course_role"))), cid, gid)

  /**
    * Gets current number of members of a group
    *
    * @param cid Course id
    * @param gid Group id
    * @return Number of members
    */
  def getGroupMembership(cid: Int, gid: Int): Int = {
    val groupMembershipRowMapper: RowMapper[Int] = (rs: ResultSet, _) => rs.getInt(1)
    val sql = "SELECT COUNT(*) FROM user_group  WHERE course_id = ? AND group_id = ?"
    jdbc.queryForObject(sql, groupMembershipRowMapper, cid, gid)
  }

  private def parseResult(res: ResultSet): Group = Group(
    id = res.getInt("group_id"),
    courseId = res.getInt("course_id"),
    name = res.getString("name"),
    membership = res.getInt("membership"),
    visible = res.getBoolean("visible"),
  )

  private def parseUserResult(res: ResultSet): User = new User(
    prename = res.getString("prename"),
    surname = res.getString("surname"),
    email = res.getString("email"),
    username = res.getString("username"),
    globalRole = GlobalRole.parse(res.getInt("global_role")),
    alias = Option(res.getString("alias")),
    id = res.getInt("user_id")
  )
}
