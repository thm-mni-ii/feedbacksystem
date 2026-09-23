package de.thm.ii.fbs.controller.v2

import org.junit.Assert.assertEquals
import org.junit.Test

class HealthControllerTest {
    private val controller = HealthController()

    @Test
    fun testHealth() {
        val result = controller.health()
        assertEquals("UP", result["status"])
    }
}
