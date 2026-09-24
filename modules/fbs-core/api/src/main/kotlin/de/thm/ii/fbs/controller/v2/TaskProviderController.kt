package de.thm.ii.fbs.controller.v2

import de.thm.ii.fbs.model.v2.taskprovider.CreateTaskProviderRequest
import de.thm.ii.fbs.model.v2.taskprovider.TaskProviderDTO
import de.thm.ii.fbs.model.v2.taskprovider.UpdateTaskProviderRequest
import de.thm.ii.fbs.services.v2.taskprovider.TaskProviderService
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@CrossOrigin
class TaskProviderController(
    private val taskProviderService: TaskProviderService
) {

    @GetMapping("/api/v2/providers/tasks")
    fun getAllActiveTaskProviders(): List<TaskProviderDTO> {
        return taskProviderService.getAllActive()
    }

    @GetMapping("/api/v2/providers/tasks/{id}")
    fun getTaskProviderById(@PathVariable("id") id: String): TaskProviderDTO {
        return taskProviderService.getById(id)
    }

    @GetMapping("/api/v2/admin/providers/tasks")
    @PreAuthorize("hasRole('ADMIN')")
    fun getAllTaskProvidersAdmin(): List<TaskProviderDTO> {
        return taskProviderService.getAll()
    }

    @PostMapping("/api/v2/admin/providers/tasks")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    fun createTaskProvider(@RequestBody request: CreateTaskProviderRequest): TaskProviderDTO {
        return taskProviderService.create(request)
    }

    @PutMapping("/api/v2/admin/providers/tasks/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun updateTaskProvider(
        @PathVariable("id") id: String,
        @RequestBody request: UpdateTaskProviderRequest
    ): TaskProviderDTO {
        return taskProviderService.update(id, request)
    }

    @DeleteMapping("/api/v2/admin/providers/tasks/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    fun deleteTaskProvider(@PathVariable("id") id: String) {
        taskProviderService.delete(id)
    }
}
