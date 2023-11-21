package de.thm.ii.fbs.services.v2.checker

import com.fasterxml.jackson.databind.ObjectMapper
import de.thm.ii.fbs.model.v2.checker.RunnerArguments
import de.thm.ii.fbs.utils.v2.helpers.RestTemplateFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.http.converter.StringHttpMessageConverter
import org.springframework.web.client.RestTemplate
import java.nio.charset.StandardCharsets

abstract class RemoteCheckerV2Service(
    @Value("\${services.masterRunner.insecure}")
    insecure: Boolean,
    @Value("\${services.masterRunner.url}")
    private val masterRunnerURL: String
) {
    private val restTemplate: RestTemplate
    private val objectMapper = ObjectMapper()

    init {
        restTemplate = RestTemplateFactory.makeRestTemplate(insecure)
        // Use UTF-8 as the character set, as the checker requires this
        restTemplate.messageConverters
            .add(0, StringHttpMessageConverter(StandardCharsets.UTF_8))
    }

    protected fun sendToRunner(request: RunnerArguments) {
        val body = objectMapper.writeValueAsString(request)
        val res = restTemplate.postForEntity("$masterRunnerURL/runner/start", body, Unit::class.java)
        if (res.statusCode != HttpStatus.ACCEPTED) {
            throw Exception("invalid status code from runner: ${res.statusCode}")
        }
    }
}
