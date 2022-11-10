package de.thm.ii.fbs.controller.v2

import de.thm.ii.fbs.common.types.checkerApi.*
import de.thm.ii.fbs.common.types.checkerApi.Result
import de.thm.ii.fbs.controller.v2.resolvers.TokenFromAuthorization
import de.thm.ii.fbs.services.v2.messaging.MessageServiceFactory
import de.thm.ii.fbs.services.v2.persistence.*
import de.thm.ii.fbs.services.v2.security.*
import org.springframework.web.bind.annotation.*

@RestController
@CrossOrigin
@RequestMapping(path = ["/api/v2/checker"])
class CheckerApiV2Controller(
    private val checkerRepository: CheckerRepository,
    private val tokenRepository: TokenRepository,
    private val formRepository: FormRepository,
    private val resultRepository: ResultRepository,
    private val tokenService: HashTokenService,
    msf: MessageServiceFactory,
) {
    private val messageService = msf()

    @PostMapping(value = ["/checker"])
    @ResponseBody
    fun createChecker(
        @RequestBody checker: Checker,
    ): Token {
        checkerRepository.save(checker)
        val generated = tokenService.generate()
        tokenRepository.save(Token(generated.hash, checker))
        return Token(generated.token, checker)
    }

    @GetMapping(value = ["/poll"])
    @ResponseBody
    fun pool(
        @TokenFromAuthorization token: Token,
    ): PollResponse {
        val id = token.checker.id!!
        return messageService.poll(id)
    }

    @PostMapping(value = ["/taskCreationForm"])
    @ResponseBody
    fun setTaskForm(
        @RequestBody formDefinition: FormDefinition,
        @TokenFromAuthorization token: Token,
        ): Unit {
        formRepository.save(Form(formDefinition, token.checker.id!!, null, null))
    }

    @PostMapping(value = ["/task/{taskID}"])
    @ResponseBody
    fun setSubmissionForm(
        @RequestParam taskID: Int,
        @RequestBody formDefinition: FormDefinition,
        @TokenFromAuthorization token: Token,
        ): Unit {
        formRepository.save(Form(formDefinition, token.checker.id!!, taskID, null))
    }

    @PostMapping(value = ["/task/{taskID}/{userID}"])
    @ResponseBody
    fun setUserSubmissionForm(
        @RequestParam taskID: Int,
        @RequestParam userID: Int,
        @RequestBody formDefinition: FormDefinition,
        @TokenFromAuthorization token: Token,
        ): Unit {
        formRepository.save(Form(formDefinition, token.checker.id!!, taskID, userID))
    }

    @PostMapping(value = ["/result/{submissionID}"])
    @ResponseBody
    fun submitResult(
        @RequestParam submissionID: Int,
        @RequestBody submissionResult: SubmissionResult,
        @TokenFromAuthorization token: Token,
    ): Unit {
        resultRepository.save(Result(submissionResult, token.checker.id!!, submissionID))
    }
}
