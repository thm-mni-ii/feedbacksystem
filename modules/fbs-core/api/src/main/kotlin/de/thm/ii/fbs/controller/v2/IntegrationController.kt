package de.thm.ii.fbs.controller.v2

import de.thm.ii.fbs.model.v2.misc.Integration
import de.thm.ii.fbs.services.v2.misc.IntegrationService
import de.thm.ii.fbs.utils.v2.exceptions.NotFoundException
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping(path = ["/api/v2/integrations"])
class IntegrationController(
    private val integrationService: IntegrationService,
) {

    @GetMapping()
    @ResponseBody
    fun index(): Map<String, Integration> = integrationService.getAll()

    @GetMapping("/{name}")
    @ResponseBody
    fun get(@PathVariable("name") name: String): Integration = integrationService.get(name) ?: throw NotFoundException()
}
