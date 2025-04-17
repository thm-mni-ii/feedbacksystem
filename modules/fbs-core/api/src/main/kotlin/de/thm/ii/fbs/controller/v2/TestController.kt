
package de.thm.ii.fbs.controller.v2

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseBody
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping(path = ["/api/v2/parser/test"])
class TestController {
    @GetMapping
    @ResponseBody
    fun test(): String = "Hello World"
}