package de.thm.ii.fbs.controller.v2

import com.fasterxml.jackson.databind.JsonNode
import com.google.gson.Gson
import de.thm.ii.fbs.model.v2.GlobalRole
import de.thm.ii.fbs.model.v2.security.LegacyToken
import de.thm.ii.fbs.model.v2.security.User
import de.thm.ii.fbs.services.v2.persistence.UserRepository
import de.thm.ii.fbs.utils.v2.annotations.CurrentToken
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
    @CurrentToken
    fun getAll(@CurrentToken currentToken: LegacyToken, req: HttpServletRequest, res: HttpServletResponse): List<User> {
        val isDocent = courseRegistrationService.getCoursePrivileges(currentToken.id).exists(e => e . _2 == CourseRole . DOCENT)
        if (currentToken.globalRole == GlobalRole.ADMIN || currentToken.globalRole == GlobalRole.MODERATOR || isDocent) {
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
    fun getOne(@CurrentToken currentToken: LegacyToken, @PathVariable uid: Int, req: HttpServletRequest, res: HttpServletResponse): User {
        val selfRequest = currentToken.id == uid
        val isDocent = courseRegistrationService.getCoursePrivileges(currentToken.id).exists(e => e . _2 == CourseRole . DOCENT)
        if (currentToken.globalRole == GlobalRole.ADMIN || currentToken.globalRole == GlobalRole.MODERATOR || isDocent || selfRequest) {
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
    fun updatePassword(@CurrentToken currentToken: LegacyToken, @PathVariable uid: Int, req: HttpServletRequest
                       , res: HttpServletResponse, @RequestBody body: JsonNode) {
        val password = body["passwd"].asText()
        val passwordRepeat = body["passwdRepeat"].asText()

        if (password.isBlank() || password != passwordRepeat) throw BadRequestException("Malformed Request Body")

        if (currentToken.globalRole == GlobalRole.ADMIN || currentToken.id == uid) {
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
    fun updateGlobalRole(@CurrentToken currentToken: LegacyToken, @PathVariable uid: Int, req: HttpServletRequest, res: HttpServletResponse, @RequestBody body: JsonNode) {
        if (body["roleName"] == null) throw BadRequestException("Malformed Request Body")
        val newRole = GlobalRole.parse(body["roleName"].asText())

        if (currentToken.globalRole == GlobalRole.ADMIN || currentToken.id == uid) {
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
    fun create(@CurrentToken currentToken: LegacyToken, req: HttpServletRequest, res: HttpServletResponse, @RequestBody body: JsonNode): User {
        if (currentToken.globalRole != GlobalRole.ADMIN) {
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
    fun delete(@CurrentToken currentToken: LegacyToken, @PathVariable uid: Int, req: HttpServletRequest, res: HttpServletResponse) {
        if (currentToken.globalRole == GlobalRole.ADMIN) {
            userRepository.deleteById(uid)
        } else {
            throw ForbiddenException()
        }
    }
}