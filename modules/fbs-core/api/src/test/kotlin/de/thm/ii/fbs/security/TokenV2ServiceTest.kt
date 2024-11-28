package de.thm.ii.fbs.security

import de.thm.ii.fbs.services.v2.security.TokenV2Service
import org.junit.Test

class TokenV2ServiceTest() {
    private val tokenV2Service: TokenV2Service = TokenV2Service("123")

    @Test
    fun validToken() {
        val token = tokenV2Service.issue("Test", 30)
        val verified = tokenV2Service.verify(token)
        assert(verified != null)
    }

    @Test
    fun expiredToken() {
        val token = tokenV2Service.issue("Test", 2)
        Thread.sleep(5000)
        val verified = tokenV2Service.verify(token)
        assert(verified == null)
    }
}
