package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.Course
import de.thm.ii.fbs.model.v2.CourseRegisteration
import de.thm.ii.fbs.model.v2.CourseRole
import de.thm.ii.fbs.model.v2.Participant
import de.thm.ii.fbs.model.v2.security.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.sql.ResultSet

@Repository
interface CourseRegistrationRepository : JpaRepository<CourseRegisteration, Int> {
    // CourseRegistration
    @Query("REPLACE INTO user_course (course_id, user_id, course_role) VALUES (?1,?2,?3);")
    fun register(cid: Int, uid: Int, role: CourseRole): Boolean

    /**
     * Deregister a user from a course.
     *
     * @param cid The course id
     * @param uid The user id
     * @return True if sucessfully deregistered
     */
    @Query("DELETE FROM user_course WHERE course_id = ?1 AND user_id = ?2")
    fun deleteRegisteredUserByCourseId(cid: Int, uid: Int): Boolean

    /**
     * Deregister all users with a specific role from a course.
     *
     * @param cid  The course id
     * @param role The role
     * @return True if sucessfully deregistered
     */
    @Query("DELETE FROM user_course WHERE course_id = ?1 AND course_role = ?2")
    fun deleteRoleFromCourse(cid: Int, role: CourseRole): Boolean

    /**
     * Deregister all users except the current user.
     *
     * @param cid The course id
     * @param uid The user id
     * @return True if sucessfully deregistered
     */
    @Query("DELETE FROM user_course WHERE course_id = ?1 AND user_id <> ?2")
    fun deregisterAll(cid: Int, uid: Int): Boolean

    /**
     * Get all course for that the user with the user id uid is registered
     *
     * @param uid          User id
     * @param ignoreHidden True if hidden courses should be ignored
     * @return List of courses
     */
    /*@Query("SELECT course_id, semester_id, name, description, visible FROM course JOIN user_course using(course_id) WHERE user_id = ?"
            + (if (ignoreHidden) " AND visible = 1" else "")*/
    fun findAllCoursesByUserId(uid: Int, ignoreHidden: Boolean = true): List<Course>
    /*"SELECT course_id, semester_id, name, description, visible FROM course JOIN user_course using(course_id) WHERE user_id = ?"
    + (if (ignoreHidden) " AND visible = 1" else ""),
    (res, _) => parseCourseResult(res), uid)*/

    /*private fun parseCourseResult(res: ResultSet): Course
    {
        return Course(
                semesterId = res.getInt("semester_id"),
                name = res.getString("name"),
                description = res.getString("description"),
                visible = res.getBoolean("visible"),
                id = res.getInt("course_id")
    }*/

    /**
     * Get all participants of a course
     *
     * @param cid The course id
     * @return List of courses
     */
     @Query("SELECT user_id, prename, surname, email, username, alias, global_role, course_role FROM user " +
             "JOIN user_course using(user_id) where deleted = 0 and course_id = ?1")
    fun findAllParticipantsOfACourse(cid: Int): List<Participant>
    /*"SELECT user_id, prename, surname, email, username, alias, global_role, course_role FROM user JOIN user_course using(user_id) where deleted = 0" +
    " and course_id = ?",
    (res, _) => Participant(parseUserResult(res), CourseRole.parse(res.getInt("course_role"))), cid)*/

    /**
     * Parse SQL Query user result
     *
     * @param res SQL Query result
     * @return User Object
     */
    /*fun parseUserResult(res: ResultSet): User {
        return User(
                //prename = res.getString("prename"),
                //surname = res.getString("surname"),
                //email = res.getString("email"),
                username = res.getString("username"),
                //globalRole = GlobalRole.parse(res.getInt("global_role")),
                //alias = Option(res.getString("alias")),
                id = res.getInt("user_id")
        )
    }*/

    /**
     * Get the course privileges of a user.
     *
     * @param uid The user id
     * @return Map of course id to its course role. Note that courses where the user is a student are not listed here.
     */
    fun getCoursePrivileges(uid: Int): Map<Int, CourseRole>
    /*"SELECT course_id, course_role FROM user_course WHERE user_id = ?", (res, _) => {
    (res.getInt("course_id"), CourseRole.parse(res.getInt("course_role")))
}, uid)
    .foldLeft(Map[Int, CourseRole.Value]())((akku, value) => akku+value)
}

def getCourseRoleOfUser(cid: Int, uid: Int): Option[CourseRole.Value] =
{
    DB.query("SELECT course_role FROM user_course WHERE user_id = ? AND course_id = ?",
            (res, _) => CourseRole.parse(res.getInt("course_role")), uid, cid).headOption*/
}