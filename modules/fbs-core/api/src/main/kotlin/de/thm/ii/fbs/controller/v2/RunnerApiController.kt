package de.thm.ii.fbs.controller.v2

import de.thm.ii.fbs.model.v2.checker.SqlPlaygroundRunnerResult
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@RestController
class RunnerApiController {
    @PostMapping("/results/playground", "/api/v2/results")
    fun handlePlaygroundResult(@RequestBody result: SqlPlaygroundRunnerResult) {
        println(result)
    }
}
