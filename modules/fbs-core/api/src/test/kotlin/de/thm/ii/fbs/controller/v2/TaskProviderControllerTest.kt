package de.thm.ii.fbs.controller.v2

import de.thm.ii.fbs.model.v2.taskprovider.CreateTaskProviderRequest
import de.thm.ii.fbs.model.v2.taskprovider.TaskProviderDTO
import de.thm.ii.fbs.model.v2.taskprovider.UpdateTaskProviderRequest
import de.thm.ii.fbs.services.v2.taskprovider.TaskProviderService
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Test
import org.mockito.Mockito.`when`
import org.mockito.Mockito.mock
import org.mockito.Mockito.verify

class TaskProviderControllerTest {
    private val service: TaskProviderService = mock(TaskProviderService::class.java)
    private val controller = TaskProviderController(service)

    @Test
    fun testGetAllActive() {
        val dto = TaskProviderDTO(
            id = "sql-checker",
            displayName = "SQL Checker",
            description = null,
            icon = "code",
            version = "1.0.0",
            evaluationEndpointUrl = "http://sql-checker:5000/evaluate",
            healthEndpointUrl = "http://sql-checker:5000/health",
            configUiUrl = null,
            solveUiUrl = null,
            resultUiUrl = null,
            supportedMediaTypes = listOf("application/sql"),
            hasSubtasks = true,
            supportsStagedFeedback = true,
            configSchema = null,
            isActive = true
        )

        `when`(service.getAllActive()).thenReturn(listOf(dto))

        val result = controller.getAllActiveTaskProviders()
        assertEquals(1, result.size)
        assertEquals("sql-checker", result[0].id)
    }

    @Test
    fun testGetById() {
        val dto = TaskProviderDTO(
            id = "sql-checker",
            displayName = "SQL Checker",
            description = null,
            icon = "code",
            version = "1.0.0",
            evaluationEndpointUrl = "http://sql-checker:5000/evaluate",
            healthEndpointUrl = "http://sql-checker:5000/health",
            configUiUrl = null,
            solveUiUrl = null,
            resultUiUrl = null,
            supportedMediaTypes = listOf("application/sql"),
            hasSubtasks = true,
            supportsStagedFeedback = true,
            configSchema = null,
            isActive = true
        )

        `when`(service.getById("sql-checker")).thenReturn(dto)

        val result = controller.getTaskProviderById("sql-checker")
        assertNotNull(result)
        assertEquals("SQL Checker", result.displayName)
    }

    @Test
    fun testCreate() {
        val req = CreateTaskProviderRequest(
            id = "custom-checker",
            displayName = "Custom Checker",
            icon = "code",
            version = "1.0.0",
            evaluationEndpointUrl = "http://custom:5000/evaluate",
            healthEndpointUrl = "http://custom:5000/health"
        )
        val dto = TaskProviderDTO(
            id = "custom-checker",
            displayName = "Custom Checker",
            description = null,
            icon = "code",
            version = "1.0.0",
            evaluationEndpointUrl = "http://custom:5000/evaluate",
            healthEndpointUrl = "http://custom:5000/health",
            configUiUrl = null,
            solveUiUrl = null,
            resultUiUrl = null,
            supportedMediaTypes = emptyList(),
            hasSubtasks = false,
            supportsStagedFeedback = false,
            configSchema = null,
            isActive = true
        )

        `when`(service.create(req)).thenReturn(dto)

        val created = controller.createTaskProvider(req)
        assertEquals("custom-checker", created.id)
    }

    @Test
    fun testDelete() {
        controller.deleteTaskProvider("sql-checker")
        verify(service).delete("sql-checker")
    }
}
