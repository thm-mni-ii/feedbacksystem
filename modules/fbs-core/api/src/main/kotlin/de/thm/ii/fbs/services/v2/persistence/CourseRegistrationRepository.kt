package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.Course
import de.thm.ii.fbs.model.v2.CourseRegisteration
import de.thm.ii.fbs.model.v2.CourseRole
import de.thm.ii.fbs.model.v2.Participant
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.Optional
import javax.transaction.Transactional

interface CourseRegistrationRepository : JpaRepository<CourseRegisteration, Int> {
    // CourseRegistration
    @Modifying
    @Transactional
    @Query("REPLACE INTO user_course (course_id, user_id, course_role) VALUES (?1,?2,?3);", nativeQuery = true)
    fun register(cid: Int, uid: Int, role: Int): Int

    /**
     * Deregister a user from a course.
     *
     * @param cid The course id
     * @param uid The user id
     * @return True if sucessfully deregistered
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM user_course WHERE course_id = ?1 AND user_id = ?2", nativeQuery = true)
    fun deleteByCourseIdAndUserId(courseid: Int, userid: Int): Int

    /**
     * Deregister all users with a specific role from a course.
     *
     * @param cid  The course id
     * @param role The role
     * @return True if sucessfully deregistered
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM user_course WHERE course_id = ?1 AND course_role = ?2", nativeQuery = true)
    fun deleteCourseRoleByCidAndCourseRole(cid: Int, courseRole: Int): Int

    /**
     * Deregister all users except the current user.
     *
     * @param cid The course id
     * @param uid The user id
     * @return True if sucessfully deregistered
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM user_course WHERE course_id = ?1 AND user_id <> ?2", nativeQuery = true)
    fun deleteAllUsersByCourseId(cid: Int, uid: Int): Int

    /**
     * Get all course for that the user with the user id uid is registered
     *
     * @param uid          User id
     * @param ignoreHidden True if hidden courses should be ignored
     * @return List of courses
     */
    @Query(
        "SELECT course_id, semester_id, name, description, visible FROM course JOIN user_course using(course_id) " +
            "WHERE user_id = :uid AND visible = 1",
        nativeQuery = true
    )
    fun findByUidAndVisibleTrue(@Param("uid") uid: Int): List<Course>

    /**
     * Get all course for that the user with the user id uid is registered
     *
     * @param uid          User id
     * @param ignoreHidden True if hidden courses should be ignored
     * @return List of courses
     */
    @Query(
        "SELECT course_id, semester_id, name, description, visible FROM course JOIN user_course using(course_id) " +
            "WHERE user_id = :uid",
        nativeQuery = true
    )
    fun findAllCoursesByUid(@Param("uid") uid: Int): List<Course>

    /**
     * Get all participants of a course
     *
     * @param cid The course id
     * @return List of courses
     */
    @Query(
        "SELECT user_id, prename, surname, email, username, alias, global_role, course_role FROM user JOIN " +
            "user_course using(user_id) where deleted = 0 and course_id = ?1",
        nativeQuery = true
    )
    fun findAllParticipantsByCourseId(cid: Int): List<Participant>

    /**
     * Get the course privileges of a user.
     *
     * @param uid The user id
     * @return Map of course id to its course role. Note that courses where the user is a student are not listed here.
     */
    @Query("SELECT course_id, course_role FROM user_course WHERE user_id = ?1", nativeQuery = true)
    fun findAllCourseRolesOfCourseIdsByUser(uid: Int): Map<Int, CourseRole>

    @Query("SELECT course_role FROM user_course WHERE user_id = ?2 AND course_id = ?1", nativeQuery = true)
    fun findCourseRoleFromUserCourseByCourseIdAndUserId(cid: Int, uid: Int): Optional<CourseRole>
}
