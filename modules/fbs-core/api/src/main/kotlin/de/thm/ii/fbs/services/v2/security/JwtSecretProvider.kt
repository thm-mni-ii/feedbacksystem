package de.thm.ii.fbs.services.v2.security

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.nio.charset.StandardCharsets
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.attribute.PosixFilePermissions
import java.security.SecureRandom
import java.util.Base64

/**
 * Provides the secret for signing and verifying internal HS256 tokens.
 * Uses the configured secret if set, otherwise loads it from a file
 * or generates a new one and saves it there.
 */
@Component
class JwtSecretProvider(
    @Value("\${jwt.secret:}")
    private val configuredSecret: String,
    @Value("\${jwt.secret-file:/usr/local/fbs-core.api/conf/jwt-secret}")
    private val secretFile: String
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    val secret: ByteArray = loadSecret()

    private fun loadSecret(): ByteArray {
        val path = Path.of(secretFile)
        val bytes = when {
            configuredSecret.isNotEmpty() -> configuredSecret.toByteArray(StandardCharsets.UTF_8)
            Files.exists(path) -> Base64.getDecoder().decode(Files.readString(path).trim())
            else -> generateSecret(path)
        }
        check(bytes.size >= MIN_SECRET_BYTES) {
            "jwt.secret must be at least $MIN_SECRET_BYTES bytes (256 bits)"
        }
        return bytes
    }

    private fun generateSecret(path: Path): ByteArray {
        val bytes = ByteArray(MIN_SECRET_BYTES)
        SecureRandom().nextBytes(bytes)
        Files.createDirectories(path.parent)
        Files.createFile(path, PosixFilePermissions.asFileAttribute(PosixFilePermissions.fromString("rw-------")))
        Files.writeString(path, Base64.getEncoder().encodeToString(bytes))
        logger.info("Generated new JWT secret and saved it to {}", path)
        return bytes
    }

    companion object {
        private const val MIN_SECRET_BYTES = 32
    }
}
