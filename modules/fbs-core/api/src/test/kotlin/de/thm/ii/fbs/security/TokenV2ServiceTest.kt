package de.thm.ii.fbs.security

import de.thm.ii.fbs.model.v2.checker.excel.CellResult
import de.thm.ii.fbs.services.v2.security.TokenV2Service
import org.junit.Before
import org.junit.Test
import org.junit.jupiter.api.Assertions
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.test.context.SpringBootTest
import javax.annotation.PostConstruct


class TokenV2ServiceTest() {
    private val tokenV2Service: TokenV2Service = TokenV2Service("123")

    @Test
    fun validToken() {
        val token = tokenV2Service.issue("Test", 30)
        val verified = tokenV2Service.verify(token)
        val verifiedLegacy = tokenV2Service.verifyLegacyToken(token)
        assert(verified != null)
        assert(verifiedLegacy != null)
    }
    @Test
    fun expiredToken() {
        val token = tokenV2Service.issue("Test", 2)
        Thread.sleep(5000)
        val verified = tokenV2Service.verify(token)
        val verifiedLegacy = tokenV2Service.verifyLegacyToken(token)
        assert(verified == null)
        assert(verifiedLegacy == null)
    }
}
