package de.thm.ii.fbs.controller.v2

import org.springframework.web.bind.annotation.*

@RestController
@CrossOrigin
@RequestMapping(path = ["/api/v2/checker"])
class CheckerApiV2Controller {
    @GetMapping(value = ["/test"])
    @ResponseBody
    fun test(): String = "hi"
}
