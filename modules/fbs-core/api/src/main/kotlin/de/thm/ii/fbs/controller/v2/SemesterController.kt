package de.thm.ii.fbs.controller.v2

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.model.v2.GlobalRole
import de.thm.ii.fbs.model.v2.Semester
import de.thm.ii.fbs.model.v2.security.LegacyToken
import de.thm.ii.fbs.services.v2.persistence.SemesterRepository
import de.thm.ii.fbs.utils.v2.annotations.CurrentToken
import de.thm.ii.fbs.utils.v2.exceptions.BadRequestException
import de.thm.ii.fbs.utils.v2.exceptions.ForbiddenException
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseBody
import org.springframework.web.bind.annotation.RestController

@RestController
@CrossOrigin
@RequestMapping(path = ["/api/v1/semester"], produces = [MediaType.APPLICATION_JSON_VALUE])
class SemesterController(
    private val semesterRepository: SemesterRepository
) {
    /**
     * Get a semester list
     *
     * @param req http request
     * @param res http response
     * @return semester list
     */
    @GetMapping("")
    @ResponseBody
    fun getAll(@CurrentToken currentToken: LegacyToken): List<Semester> {
        currentToken.hasNotRole(GlobalRole.ADMIN, GlobalRole.MODERATOR)
        return semesterRepository.findAll()
/*        if (currentToken.globalRole == GlobalRole.ADMIN || currentToken.globalRole == GlobalRole.MODERATOR) {
            return semesterRepository.findAll()
        } else {
            throw ForbiddenException()
        }*/
    }

    /**
     * Create a new semester
     *
     * @param req  http request
     * @param res  http response
     * @param body contains JSON request
     * @return JSON
     */
    @PostMapping("", consumes = [MediaType.APPLICATION_JSON_VALUE])
    @ResponseBody
    fun create(@CurrentToken currentToken: LegacyToken, @RequestBody body: JsonNode): Semester {
        currentToken.hasRole(GlobalRole.ADMIN)
        return createOrUpdateSemester(0, body)
/*        if (currentToken.globalRole != GlobalRole.ADMIN) {
            throw ForbiddenException()
        }
        return createOrUpdateSemester(0, body)*/
    }

    /**
     * Get a single semester
     *
     * @param sid semester id
     * @param req http request
     * @param res http response
     * @return A course
     */
    @GetMapping("/{sid}")
    @ResponseBody
    fun getOne(@CurrentToken currentToken: LegacyToken, @PathVariable("sid") sid: Int): Semester {
        currentToken.hasRole(GlobalRole.ADMIN, GlobalRole.MODERATOR)
        return semesterRepository.findById(sid).orElseThrow { throw ForbiddenException() }
        /*if (!(currentToken.globalRole == GlobalRole.ADMIN || currentToken.globalRole == GlobalRole.MODERATOR)) {
            throw ForbiddenException()
        } else {
            return semesterRepository.findById(sid).orElseThrow { throw ForbiddenException() }
        }*/
    }

    /**
     * Update semester
     *
     * @param sid  Semester id
     * @param req  http request
     * @param res  http response
     * @param body Request Body
     */
    @PutMapping("/{sid}")
    fun update(@CurrentToken currentToken: LegacyToken, @PathVariable("sid") sid: Int, @RequestBody body: JsonNode): Semester {
        currentToken.hasNotRole(GlobalRole.ADMIN)
        return createOrUpdateSemester(sid, body)
/*        if (currentToken.globalRole == GlobalRole.ADMIN) {
            return createOrUpdateSemester(sid, body)
        } else {
            throw ForbiddenException()
        }*/
    }

    /**
     * Delete Semester
     *
     * @param sid Semester id
     * @param req http request
     * @param res http response
     */
    @DeleteMapping("/{sid}")
    fun delete(@CurrentToken currentToken: LegacyToken, @PathVariable("sid") sid: Int) {
        currentToken.hasNotRole(GlobalRole.ADMIN)
        semesterRepository.deleteById(sid)
/*        if (currentToken.globalRole == GlobalRole.ADMIN) {
            semesterRepository.deleteById(sid)
        } else {
            throw ForbiddenException()
        }*/
    }

    private fun createOrUpdateSemester(sid: Int, body: JsonNode): Semester {
        if (body.has("name")) {
            return semesterRepository.save(Semester(sid, body["name"].asText()))
        } else {
            throw BadRequestException()
        }
    }
}
