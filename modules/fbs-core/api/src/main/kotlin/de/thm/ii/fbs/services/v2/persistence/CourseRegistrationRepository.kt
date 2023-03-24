package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.Course
import de.thm.ii.fbs.model.v2.CourseRole
import de.thm.ii.fbs.model.v2.Participant
import de.thm.ii.fbs.model.v2.security.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.sql.ResultSet

interface CourseRegistrationRepository : JpaRepository<Course, Int> {
    @Query("REPLACE INTO user_course (course_id, user_id, course_role) VALUES (?,?,?);")
    fun register(cid: Int, uid: Int, role: CourseRole): Boolean // no way
    //def register(cid: Int, uid: Int, role: CourseRole.Value): Boolean =
    //1 == DB.update("REPLACE INTO user_course (course_id, user_id, course_role) VALUES (?,?,?);", cid, uid, role.id)

    /**
     * Deregister a user from a course.
     *
     * @param cid The course id
     * @param uid The user id
     * @return True if sucessfully deregistered
     */
    fun deregister(cid: Int, uid: Int): Boolean
    //1 == DB.update("DELETE FROM user_course WHERE course_id = ? AND user_id = ?", cid, uid)

    /**
     * Deregister all users with a specific role from a course.
     *
     * @param cid  The course id
     * @param role The role
     * @return True if sucessfully deregistered
     */
    fun deregisterRole(cid: Int, role: CourseRole): Boolean
    //1 == DB.update("DELETE FROM user_course WHERE course_id = ? AND course_role = ?", cid, role.id)

    /**
     * Deregister all users except the current user.
     *
     * @param cid The course id
     * @param uid The user id
     * @return True if sucessfully deregistered
     */
    fun deregisterAll(cid: Int, uid: Int): Boolean
    //1 == DB.update("DELETE FROM user_course WHERE course_id = ? AND user_id <> ?", cid, uid)

    /**
     * Get all course for that the user with the user id uid is registered
     *
     * @param uid          User id
     * @param ignoreHidden True if hidden courses should be ignored
     * @return List of courses
     */
    fun getRegisteredCourses(uid: Int, ignoreHidden: Boolean = true): List<Course>
    /*"SELECT course_id, semester_id, name, description, visible FROM course JOIN user_course using(course_id) WHERE user_id = ?"
    + (if (ignoreHidden) " AND visible = 1" else ""),
    (res, _) => parseCourseResult(res), uid)

    private def parseCourseResult(res: ResultSet): Course = Course(
    semesterId = Some(res.getInt("semester_id")),
    name = res.getString("name"),
    description = res.getString("description"),
    visible = res.getBoolean("visible"),
    id = res.getInt("course_id")*/

    /**
     * Get all participants of a course
     *
     * @param cid The course id
     * @return List of courses
     */
    fun getParticipants(cid: Int): List<Participant>
    /*"SELECT user_id, prename, surname, email, username, alias, global_role, course_role FROM user JOIN user_course using(user_id) where deleted = 0" +
    " and course_id = ?",
    (res, _) => Participant(parseUserResult(res), CourseRole.parse(res.getInt("course_role"))), cid)*/

    /**
     * Parse SQL Query user result
     *
     * @param res SQL Query result
     * @return User Object
     */
    fun parseUserResult(res: ResultSet): User {
        return User(
                //prename = res.getString("prename"),
                //surname = res.getString("surname"),
                //email = res.getString("email"),
                username = res.getString("username"),
                //globalRole = GlobalRole.parse(res.getInt("global_role")),
                //alias = Option(res.getString("alias")),
                id = res.getInt("user_id")
        )
    }

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