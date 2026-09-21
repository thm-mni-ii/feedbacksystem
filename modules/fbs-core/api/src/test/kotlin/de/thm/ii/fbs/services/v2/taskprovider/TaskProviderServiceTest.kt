package de.thm.ii.fbs.services.v2.taskprovider

import com.fasterxml.jackson.databind.ObjectMapper
import de.thm.ii.fbs.model.v2.taskprovider.CreateTaskProviderRequest
import de.thm.ii.fbs.model.v2.taskprovider.TaskProviderEntity
import de.thm.ii.fbs.model.v2.taskprovider.UpdateTaskProviderRequest
import de.thm.ii.fbs.services.v2.persistence.TaskProviderRepository
import de.thm.ii.fbs.utils.v2.exceptions.NotFoundException
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.mockito.Mockito.`when`
import org.mockito.Mockito.mock
import java.util.Optional

class TaskProviderServiceTest {
    private val repository: TaskProviderRepository = mock(TaskProviderRepository::class.java)
    private val objectMapper = ObjectMapper()
    private val service = TaskProviderService(repository, objectMapper)

    @Test
    fun testGetAllActive() {
        val entity = TaskProviderEntity(
            id = "sql-checker",
            displayName = "SQL Checker",
            description = "SQL Evaluator",
            icon = "code",
            version = "1.0.0",
            evaluationEndpointUrl = "http://sql-checker:5000/evaluate",
            healthEndpointUrl = "http://sql-checker:5000/health",
            supportedMediaTypes = "[\"application/sql\"]",
            hasSubtasks = true,
            supportsStagedFeedback = true,
            isActive = true
        )

        `when`(repository.findAllByIsActiveTrue()).thenReturn(listOf(entity))

        val result = service.getAllActive()
        assertEquals(1, result.size)
        assertEquals("sql-checker", result[0].id)
        assertEquals("SQL Checker", result[0].displayName)
        assertEquals(listOf("application/sql"), result[0].supportedMediaTypes)
    }

    @Test
    fun testGetById() {
        val entity = TaskProviderEntity(
            id = "bash-checker",
            displayName = "Bash Sandbox",
            icon = "terminal",
            version = "1.0.0",
            evaluationEndpointUrl = "http://bash-checker:5000/evaluate",
            healthEndpointUrl = "http://bash-checker:5000/health",
            supportedMediaTypes = "[\"text/x-shellscript\"]"
        )

        `when`(repository.findById("bash-checker")).thenReturn(Optional.of(entity))

        val dto = service.getById("bash-checker")
        assertNotNull(dto)
        assertEquals("Bash Sandbox", dto.displayName)
        assertEquals("terminal", dto.icon)
    }

    @Test(expected = NotFoundException::class)
    fun testGetByIdNotFound() {
        `when`(repository.findById("non-existent")).thenReturn(Optional.empty())
        service.getById("non-existent")
    }

    @Test
    fun testCreate() {
        val req = CreateTaskProviderRequest(
            id = "custom-checker",
            displayName = "Custom Checker",
            icon = "extension",
            version = "1.0.0",
            evaluationEndpointUrl = "http://custom:5000/evaluate",
            healthEndpointUrl = "http://custom:5000/health",
            supportedMediaTypes = listOf("application/json")
        )

        `when`(repository.existsById("custom-checker")).thenReturn(false)
        `when`(repository.save(org.mockito.ArgumentMatchers.any(TaskProviderEntity::class.java))).thenAnswer {
            it.arguments[0] as TaskProviderEntity
        }

        val created = service.create(req)
        assertEquals("custom-checker", created.id)
        assertEquals("Custom Checker", created.displayName)
        assertTrue(created.isActive)
    }

    @Test
    fun testUpdate() {
        val entity = TaskProviderEntity(
            id = "sql-checker",
            displayName = "Old Name",
            icon = "code",
            version = "1.0.0",
            evaluationEndpointUrl = "http://sql-checker:5000/evaluate",
            healthEndpointUrl = "http://sql-checker:5000/health",
            supportedMediaTypes = "[]"
        )

        `when`(repository.findById("sql-checker")).thenReturn(Optional.of(entity))
        `when`(repository.save(org.mockito.ArgumentMatchers.any(TaskProviderEntity::class.java))).thenAnswer {
            it.arguments[0] as TaskProviderEntity
        }

        val updated = service.update("sql-checker", UpdateTaskProviderRequest(displayName = "New Name"))
        assertEquals("New Name", updated.displayName)
    }
}
