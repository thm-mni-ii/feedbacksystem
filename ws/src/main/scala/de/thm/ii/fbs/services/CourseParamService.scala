package de.thm.ii.fbs.services

import de.thm.ii.fbs.model.User
import de.thm.ii.fbs.util.DB
import de.thm.ii.fbs.services.labels.{CourseParameterDBLabels, CourseParameterUserDBLabels}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

/**
  * CourseParamService provides interaction with DB
  *
  * @author Benjamin Manns
  */
@Component
class CourseParamService {
  @Autowired
  private implicit val jdbc: JdbcTemplate = null
  private final val LABEL_SUCCESS = "success"
  /**
    * Get all parameter a course has
    * @param courseid unique course idetification
    * @return MAP
    */
  def getAllCourseParams(courseid: Int): List[Map[String, Any]] = {
    DB.query("select * from course_parameter where course_id = ? ", (res, _) => {
        Map(CourseParameterDBLabels.course_id -> res.getInt(CourseParameterDBLabels.course_id),
        CourseParameterDBLabels.c_param_desc -> res.getString(CourseParameterDBLabels.c_param_desc),
        CourseParameterDBLabels.c_param_key -> res.getString(CourseParameterDBLabels.c_param_key))
    }, courseid)
  }

  /**
    * set course parameter
    * @param courseid unique course idetification
    * @param key parameter uniq key
    * @param description parameter description
    * @return MAP
    */
  def setCourseParams(courseid: Int, key: String, description: String): Map[String, Boolean] = {
    val num = DB.update("insert into course_parameter (course_id, c_param_desc, c_param_key) VALUES (?,?,?) ON DUPLICATE " +
      "KEY UPDATE c_param_desc=?, c_param_key=?",
      courseid, description, key, description, key)
    Map(LABEL_SUCCESS -> (num == 1))
  }

  /**
    * delete a course parameter
    * @param courseid unique course idetification
    * @param key parameter uniq key
    * @return MAP of success
    */
  def deleteCourseParams(courseid: Int, key: String): Map[String, Boolean] = {
    val num = DB.update("delete from course_parameter where course_id = ? and c_param_key = ? ",
      courseid, key)
    Map(LABEL_SUCCESS -> (num == 1))
  }

  /**
    * add / update a concrete value of course parameter for user
    * @param courseid unique course idetification
    * @param key parameter unique key
    * @param value parameter value of user
    * @param user subscribed user
    * @return JSON Map of success
    */
  def setCourseParamsForUser(courseid: Int, key: String, value: String, user: User): Map[String, Boolean] = {
    val num = DB.update("insert into course_parameter_user (course_id, user_id, c_param_key, value) VALUES (?,?,?,?) ON DUPLICATE " +
      "KEY UPDATE value=?, c_param_key=?",
      courseid, user.userid, key, value, value, key)
    Map(LABEL_SUCCESS -> (num == 1))
  }

  /**
    * delete a set course parameter of user
    * @param courseid unique course identification
    * @param key parameter unique key
    * @param user subscribed user
    * @return JSON Map of success
    */
  def deleteCourseParamsForUser(courseid: Int, key: String, user: User): Map[String, Boolean] = {
    val num = DB.update("delete from course_parameter_user where course_id = ? and user_id = ? and c_param_key = ?",
      courseid, user.userid, key)
    Map(LABEL_SUCCESS -> (num == 1))
  }

  /**
    * get all course parameter a user has
    * @param courseid unique course identification
    * @param user subscribed user
    * @return JSON Map of data
    */
  def getAllCourseParamsForUser(courseid: Int, user: User): List[Map[String, Any]] = {
    DB.query("select * from course_parameter_user where course_id = ? and user_id = ? ", (res, _) => {
      Map(CourseParameterUserDBLabels.course_id -> res.getInt(CourseParameterUserDBLabels.course_id),
        CourseParameterUserDBLabels.user_id -> res.getInt(CourseParameterUserDBLabels.user_id),
        CourseParameterUserDBLabels.c_param_key -> res.getString(CourseParameterUserDBLabels.c_param_key),
        CourseParameterUserDBLabels.value -> res.getString(CourseParameterUserDBLabels.value))
    }, courseid, user.userid)
  }
}
