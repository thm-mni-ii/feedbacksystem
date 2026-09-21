package de.thm.ii.fbs.services.v2.security

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class ScopedTaskTokenServiceTest {
    private val service = ScopedTaskTokenService(
        jwtSecret = "verysecretjwtkeyforunitandintegrationtesting12345",
        issuer = "https://feedback.thm.de/course-management"
    )

    @Test
    fun testIssueAndParseTaskToken() {
        val token = service.issueTaskToken(
            userId = 42,
            username = "jdoe23",
            courseId = 105,
            taskId = 2048,
            submissionId = 8192,
            courseRole = "STUDENT"
        )

        assertNotNull(token)
        val claims = service.parseToken(token)
        assertNotNull(claims)
        assertEquals("42", claims?.subject)
        assertEquals("jdoe23", claims?.get("username"))
        assertEquals(105, claims?.get("cid"))
        assertEquals(2048, claims?.get("tid"))
        assertEquals(8192, claims?.get("sid"))
        assertEquals("STUDENT", claims?.get("course_role"))
        assertTrue(claims?.get("scope").toString().contains("fbs:task:solve"))
    }

    @Test
    fun testIssueAndValidateEvaluationCallbackToken() {
        val token = service.issueEvaluationCallbackToken(
            submissionId = 8192,
            checkerConfigId = 142,
            taskId = 2048,
            courseId = 105
        )

        assertNotNull(token)
        assertTrue(service.validateCallbackToken(token, 8192, 142))
        assertFalse(service.validateCallbackToken(token, 9999, 142))
        assertFalse(service.validateCallbackToken(token, 8192, 9999))
        assertFalse(service.validateCallbackToken("invalid.token.here", 8192, 142))
    }

    @Test
    fun testGeneratePseudonym() {
        val p1 = service.generatePseudonym(42, 105)
        val p2 = service.generatePseudonym(42, 105)
        val p3 = service.generatePseudonym(43, 105)

        assertEquals(p1, p2)
        assertNotNull(p1)
        assertTrue(p1.startsWith("anon-usr-"))
        assertFalse(p1 == p3)
    }
}
