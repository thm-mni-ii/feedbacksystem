package de.thm.ii.fbs.fbs_identity_service.security.oidc

import com.nimbusds.jose.jwk.JWKSet
import com.nimbusds.jose.jwk.RSAKey
import com.nimbusds.jose.jwk.source.ImmutableJWKSet
import com.nimbusds.jose.jwk.source.JWKSource
import com.nimbusds.jose.proc.SecurityContext
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.io.FileInputStream
import java.security.KeyStore
import java.security.interfaces.RSAPrivateKey
import java.security.interfaces.RSAPublicKey

@Configuration
class AuthorizationServerKeyConfig(
    @param:Value("\${security.oidc.signing-key.location}")
    private val keyStoreLocation: String,

    @param:Value("\${security.oidc.signing-key.store-password}")
    private val keyStorePassword: String,

    @param:Value("\${security.oidc.signing-key.alias}")
    private val keyAlias: String,

    @param:Value("\${security.oidc.signing-key.key-password}")
    private val keyPassword: String
) {

    @Bean
    fun jwkSource(): JWKSource<SecurityContext> {
        val keyStore = KeyStore.getInstance("PKCS12")

        FileInputStream(keyStoreLocation).use { inputStream ->
            keyStore.load(inputStream, keyStorePassword.toCharArray())
        }

        val privateKey = checkNotNull(
            keyStore.getKey(keyAlias, keyPassword.toCharArray())
        ) {
            "No key found for alias '$keyAlias'"
        }

        check(privateKey is RSAPrivateKey) {
            "Key for alias '$keyAlias' is not an RSA private key"
        }

        val certificate = checkNotNull(keyStore.getCertificate(keyAlias)) {
            "No certificate found for alias '$keyAlias'"
        }

        val publicKey = certificate.publicKey

        check(publicKey is RSAPublicKey) {
            "Certificate for alias '$keyAlias' does not contain an RSA public key"
        }

        val rsaKey = RSAKey.Builder(publicKey)
            .privateKey(privateKey)
            .keyID(keyAlias)
            .build()

        return ImmutableJWKSet(JWKSet(rsaKey))
    }
}
