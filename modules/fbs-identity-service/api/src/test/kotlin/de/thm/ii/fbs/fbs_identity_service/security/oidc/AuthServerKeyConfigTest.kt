package de.thm.ii.fbs.fbs_identity_service.security.oidc

import com.nimbusds.jose.jwk.JWKMatcher
import com.nimbusds.jose.jwk.JWKSelector
import com.nimbusds.jose.jwk.RSAKey
import org.junit.jupiter.api.Assertions.assertThrows
import java.nio.file.Paths
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class AuthServerKeyConfigTest {

    private val keyStoreLocation =
        Paths.get(
            requireNotNull(
                javaClass.classLoader.getResource("identity-signing-test.p12")
            ).toURI()
        ).toString()

    @Test
    fun `loads RSA signing key from PKCS12 keystore`() {
        val config = AuthorizationServerKeyConfig(
            keyStoreLocation = keyStoreLocation,
            keyStorePassword = "changeit",
            keyAlias = "identity-signing-test",
            keyPassword = "changeit"
        )

        val jwkSource = config.jwkSource()

        val keys = jwkSource.get(
            JWKSelector(
                JWKMatcher.Builder()
                    .keyID("identity-signing-test")
                    .build()
            ),
            null
        )

        assertEquals(1, keys.size)

        val rsaKey = keys.single()

        assertTrue(rsaKey is RSAKey)
        assertEquals("identity-signing-test", rsaKey.keyID)
        assertTrue(rsaKey.isPrivate)
        assertEquals(4096, rsaKey.size())
    }

    @Test
    fun `fails when configured key alias does not exist`() {
        val config = AuthorizationServerKeyConfig(
            keyStoreLocation = keyStoreLocation,
            keyStorePassword = "changeit",
            keyAlias = "missing-alias",
            keyPassword = "changeit"
        )

        val exception = assertThrows(IllegalStateException::class.java) {
            config.jwkSource()
        }

        assertTrue(
            exception.message!!.contains("No key found for alias 'missing-alias'")
        )
    }
}
