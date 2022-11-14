package de.thm.ii.fbs.controller.v2

import de.thm.ii.fbs.model.v2.checker.SqlPlaygroundRunnerResult
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping(path = ["/api/v2/results"])
class RunnerApiController {
    @PostMapping("/playground")
    fun handlePlaygroundResult(@RequestBody result: SqlPlaygroundRunnerResult) {
        println(result)
    }
}
