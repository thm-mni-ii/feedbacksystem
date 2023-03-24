package de.thm.ii.fbs.controller.v2

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.model.v2.Participant
import de.thm.ii.fbs.model.v2.Course
import de.thm.ii.fbs.model.v2.CourseRole
import de.thm.ii.fbs.model.v2.GlobalRole
import de.thm.ii.fbs.model.v2.security.LegacyToken
import de.thm.ii.fbs.services.v2.persistence.CourseRegistrationRepository
import de.thm.ii.fbs.utils.v2.annotations.CurrentToken
import de.thm.ii.fbs.utils.v2.exceptions.ForbiddenException
import de.thm.ii.fbs.utils.v2.exceptions.UnauthorizedException
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.ResponseBody
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody

@RestController
@CrossOrigin
@RequestMapping(path = ["/api/v2/"], produces = [MediaType.APPLICATION_JSON_VALUE])
class CourseRegistrationController(
        private val courseRegistrationRepository: CourseRegistrationRepository,
) {
    /**
     * Get registered courses
     * @param uid User id
     * @param req http request
     * @param res http response
     * @return List of courses
     */
    @GetMapping("/users/{uid}/courses")
    @ResponseBody
    fun getRegisteredCourses(@CurrentToken currentToken: LegacyToken, @PathVariable("uid") uid: Int): List<Course> {
        val globalRole = currentToken.globalRole

        if (globalRole == GlobalRole.ADMIN || globalRole == GlobalRole.MODERATOR || currentToken.id == uid) {
            return courseRegistrationRepository.getRegisteredCourses(uid, false)
        } else {
            throw ForbiddenException()
        }
    }

    /**
     * Get participants of a course
     * @param cid Course id
     * @param req http request
     * @param res http response
     * @return List of courses
     */
    @GetMapping("/courses/{cid}/participants")
    @ResponseBody
    fun getParticipants(@CurrentToken currentToken: LegacyToken, @PathVariable("cid") cid: Int): List<Participant> {
        val globalRole = currentToken.globalRole
        val participants = courseRegistrationRepository.getParticipants(cid)

        val privilegedByCourse: CourseRole = participants.find { participant: Participant -> participant.user.id == currentToken.id }?.role
                ?: throw UnauthorizedException()

        if (privilegedByCourse != CourseRole.STUDENT || globalRole != GlobalRole.USER) {
            return participants
        } else {
            throw ForbiddenException()
        }
    }

    /**
     * Register a user into a course
     * @param uid User id
     * @param cid Course id
     * @param req http request
     * @param res http response
     * @param body Content
     */
    @PutMapping("/users/{uid}/courses/{cid}", consumes = [MediaType.APPLICATION_JSON_VALUE])
    fun register(@CurrentToken currentToken: LegacyToken, @PathVariable("uid") uid: Int, @PathVariable("cid") cid: Int,
                 @RequestBody body: JsonNode) {

        val role: CourseRole = CourseRole.valueOf(body["roleName"].asText())
        val privileged = (currentToken.globalRole == GlobalRole.ADMIN || currentToken.globalRole == GlobalRole.MODERATOR) ||
                courseRegistrationRepository.getCoursePrivileges(currentToken.id).getOrElse(cid) { CourseRole.STUDENT } == CourseRole.DOCENT

        if (privileged) courseRegistrationRepository.register(cid, uid, role)
        else if (uid == currentToken.id) courseRegistrationRepository.register(cid, uid, CourseRole.STUDENT)
        else throw ForbiddenException()
    }

    /**
     * Deregister a user from a course
     * @param uid Course id
     * @param cid Course id
     * @param req http request
     * @param res http response
     */
    @DeleteMapping("/users/{uid}/courses/{cid}")
    fun deregister(@CurrentToken currentToken: LegacyToken, @PathVariable("uid") uid: Int, @PathVariable("cid") cid: Int) {

        val privileged = currentToken.globalRole.hasRole(GlobalRole.ADMIN, GlobalRole.MODERATOR) ||
                courseRegistrationRepository.getCoursePrivileges(currentToken.id).getOrElse(cid) { CourseRole.STUDENT } == CourseRole.DOCENT

        if (privileged || uid == currentToken.id) courseRegistrationRepository.deregister(cid, uid)
        else throw ForbiddenException()
    }

    /**
     * Deregister all users with a specific role from a course
     * @param cid Course id
     * @param req http request
     * @param res http response
     * @param body Content
     */
    @PutMapping("/courses/{cid}/deregisterrole", consumes = [MediaType.APPLICATION_JSON_VALUE])
    fun deregisterRole(@CurrentToken currentToken: LegacyToken, @PathVariable("cid") cid: Int, @RequestBody body: JsonNode) {
        val role: CourseRole = CourseRole.valueOf(body["roleName"].asText())

        val privileged = currentToken.globalRole.hasRole(GlobalRole.ADMIN, GlobalRole.MODERATOR) ||
                courseRegistrationRepository.getCoursePrivileges(currentToken.id).getOrElse(cid) { CourseRole.STUDENT } == CourseRole.DOCENT

        if (privileged) courseRegistrationRepository.deregisterRole(cid, role)
        else throw ForbiddenException()
    }

    /**
     * Deregister all user except the current user
     * @param cid Course id
     * @param req http request
     * @param res http response
     */
    @GetMapping("/courses/{cid}/deregisterall")
    fun deregisterAll(@CurrentToken currentToken: LegacyToken, @PathVariable("cid") cid: Int) {
        val privileged = currentToken.globalRole.hasRole(GlobalRole.ADMIN, GlobalRole.MODERATOR) ||
                courseRegistrationRepository.getCoursePrivileges(currentToken.id).getOrElse(cid) { CourseRole.STUDENT } == CourseRole.DOCENT

        if (privileged) courseRegistrationRepository.deregisterAll(cid, currentToken.id)
        else throw ForbiddenException()
    }
}
