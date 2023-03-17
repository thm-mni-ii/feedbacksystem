package de.thm.ii.fbs.controller.v2

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.google.gson.Gson
import de.thm.ii.fbs.model.v2.GlobalRole
import de.thm.ii.fbs.model.v2.security.User
import de.thm.ii.fbs.services.v2.persistence.UserRepository
import de.thm.ii.fbs.utils.v2.exceptions.BadRequestException
import de.thm.ii.fbs.utils.v2.exceptions.ForbiddenException
import de.thm.ii.fbs.utils.v2.exceptions.NotFoundException
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.*
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

@RestController
@CrossOrigin
@RequestMapping("/api/v1", produces = [MediaType.APPLICATION_JSON_VALUE])
class UserController(
        private val userRepository: UserRepository,
) {
    /**
     * Get all users of the system
     * @param req http request
     * @param res http response
     * @return A list of users
     */
    @GetMapping("users")
    @ResponseBody
    fun getAll(req: HttpServletRequest, res: HttpServletResponse): List<User> {
        val user = authService.authorize(req, res)
        val isDocent = courseRegistrationService.getCoursePrivileges(user.id).exists(e => e . _2 == CourseRole . DOCENT)
        if (user.globalRole == GlobalRole.ADMIN || user.globalRole == GlobalRole.MODERATOR || isDocent) {
            return userRepository.findAll()
        } else {
            throw ForbiddenException()
        }
    }

    /**
     * Get a single user
     * @param uid unique user ide
     * @param req http request
     * @param res http response
     * @return A single user
     */
    @GetMapping("users/{uid}")
    @ResponseBody
    fun getOne(@PathVariable uid: Int, req: HttpServletRequest, res: HttpServletResponse): User {
        val user = authService.authorize(req, res)
        val selfRequest = user.id == uid
        val isDocent = courseRegistrationService.getCoursePrivileges(user.id).exists(e => e . _2 == CourseRole . DOCENT)
        if (user.globalRole == GlobalRole.ADMIN || user.globalRole == GlobalRole.MODERATOR || isDocent || selfRequest) {
            return userRepository.findById(uid).orElse(throw NotFoundException())
        } else {
            throw ForbiddenException()
        }
    }


    /**
     * Update password of user
     * @param uid user identification
     * @param req http request
     * @param res http response
     * @param body Content
     */
    @PutMapping("users/{uid}/passwd", consumes = [MediaType.APPLICATION_JSON_VALUE])
    fun updatePassword(@PathVariable uid: Int, req: HttpServletRequest, res: HttpServletResponse, @RequestBody body: JsonNode): Void {
        val user = authService.authorize(req, res)
        val password = body["passwd"].asText()
        val passwordRepeat = body["passwdRepeat"].asText()

        if (password.isBlank() || password != passwordRepeat) throw BadRequestException("Malformed Request Body")

        if (user.globalRole == GlobalRole.ADMIN || user.id == uid) {
            userRepository.updateUserPassword(uid, password)
        } else {
            throw ForbiddenException()
        }
    }


    /**
     * Update global role of user
     * @param uid user identification
     * @param req http request
     * @param res http response
     * @param body Content
     */
    @PutMapping("users/{uid}/global-role", consumes = [MediaType.APPLICATION_JSON_VALUE])
    fun updateGlobalRole(@PathVariable uid: Int, req: HttpServletRequest, res: HttpServletResponse, @RequestBody body: JsonNode) {
        val user = authService.authorize(req, res)
        if (body["roleName"] == null) throw BadRequestException("Malformed Request Body")
        val newRole = GlobalRole.parse(body["roleName"].asText())

        if (user.globalRole == GlobalRole.ADMIN || user.id == uid) {
            userRepository.updateUserGlobalRole(uid, newRole)
        } else {
            throw ForbiddenException()
        }
    }

    /**
     * Create a new user
     * @param req http request
     * @param res http response
     * @param body Content
     * @return The created user
     */
    @PostMapping("users", consumes = [MediaType.APPLICATION_JSON_VALUE],
            produces = [MediaType.APPLICATION_JSON_VALUE])
    @ResponseBody
    fun create(req: HttpServletRequest, res: HttpServletResponse, @RequestBody body: JsonNode): User {
        val user = authService.authorize(req, res)
        if (user.globalRole != GlobalRole.ADMIN) {
            throw ForbiddenException()
        }
        try {
            val savedUser = Gson().fromJson(body.toString(), User::class.java)
            return userRepository.save(savedUser)
        } catch (e: Exception) {
            throw BadRequestException("Malformed Request Body")
        }
    }

    /**
     * Delete a user
     * @param uid which user has to be deleted
     * @param req http request
     * @param res http response
     */
    @DeleteMapping("users/{uid}")
    fun delete(@PathVariable uid: Int, req: HttpServletRequest, res: HttpServletResponse): Void {
        //val auth =
        // authService.authorize(req, res).globalRole match {
        if (auth.globalRole == GlobalRole.ADMIN) {
            userRepository.deleteById(uid)
        } else {
            throw ForbiddenException()
        }
    }
}