package de.thm.ii.fbs.services.v2.security

import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.nio.charset.StandardCharsets
import java.security.MessageDigest
import java.util.Date

@Service
class ScopedTaskTokenService(
    private val jwtSecretProvider: JwtSecretProvider,
    @Value("\${services.self.url:\${server.host:https://feedback.thm.de/course-management}}")
    private val issuer: String
) {

    /**
     * Issues a scoped task token for solve/config view access.
     */
    fun issueTaskToken(
        userId: Int,
        username: String,
        courseId: Int,
        taskId: Int,
        submissionId: Int? = null,
        courseRole: String = "STUDENT",
        scope: String = "fbs:task:solve fbs:storage:read",
        validityMinutes: Long = 30
    ): String {
        val now = Date()
        val expiry = Date(now.time + validityMinutes * 60 * 1000)
        val pseudonym = generatePseudonym(userId, courseId)

        val builder = Jwts.builder()
            .issuer(issuer)
            .subject(userId.toString())
            .issuedAt(now)
            .expiration(expiry)
            .claim("pseudonym", pseudonym)
            .claim("username", username)
            .claim("cid", courseId)
            .claim("tid", taskId)
            .claim("course_role", courseRole)
            .claim("scope", scope)

        if (submissionId != null) {
            builder.claim("sid", submissionId)
        }

        return builder
            .signWith(jwtSecretProvider.key, Jwts.SIG.HS256)
            .compact()
    }

    /**
     * Issues a callback authentication token for the async evaluation webhook.
     */
    fun issueEvaluationCallbackToken(
        submissionId: Int,
        checkerConfigId: Int,
        taskId: Int,
        courseId: Int,
        validityMinutes: Long = 60
    ): String {
        val now = Date()
        val expiry = Date(now.time + validityMinutes * 60 * 1000)

        val builder = Jwts.builder()
            .issuer(issuer)
            .subject("fbs:evaluator")
            .issuedAt(now)
            .expiration(expiry)
            .claim("sid", submissionId)
            .claim("ccid", checkerConfigId)
            .claim("tid", taskId)
            .claim("cid", courseId)
            .claim("scope", "fbs:task:evaluate")

        return builder
            .signWith(jwtSecretProvider.key, Jwts.SIG.HS256)
            .compact()
    }

    /**
     * Validates a scoped callback token and extracts its claims.
     */
    fun validateCallbackToken(token: String, expectedSubmissionId: Int, expectedCheckerConfigId: Int): Boolean {
        return try {
            val claims = Jwts.parser()
                .verifyWith(jwtSecretProvider.key)
                .build()
                .parseSignedClaims(token.replace("Bearer ", "").trim())
                .payload

            val sid = claims["sid"]?.toString()?.toIntOrNull()
            val ccid = claims["ccid"]?.toString()?.toIntOrNull()
            val scope = claims["scope"]?.toString()

            sid == expectedSubmissionId && ccid == expectedCheckerConfigId && (scope == "fbs:task:evaluate" || scope == "fbs:result:ingest")
        } catch (e: Exception) {
            false
        }
    }

    fun validateSubmissionToken(token: String, expectedSubmissionId: Int): Boolean {
        return try {
            val claims = parseToken(token) ?: return false
            val sid = claims["sid"]?.toString()?.toIntOrNull()
            val scope = claims["scope"]?.toString() ?: ""
            sid == expectedSubmissionId && (scope.contains("fbs:task:evaluate") || scope.contains("fbs:storage:read"))
        } catch (e: Exception) {
            false
        }
    }

    fun validateCheckerConfigToken(token: String, expectedCheckerConfigId: Int): Boolean {
        return try {
            val claims = parseToken(token) ?: return false
            val ccid = claims["ccid"]?.toString()?.toIntOrNull()
            val scope = claims["scope"]?.toString() ?: ""
            ccid == expectedCheckerConfigId && (scope.contains("fbs:task:evaluate") || scope.contains("fbs:storage:read"))
        } catch (e: Exception) {
            false
        }
    }

    fun parseToken(token: String): Claims? {
        return try {
            Jwts.parser()
                .verifyWith(jwtSecretProvider.key)
                .build()
                .parseSignedClaims(token.replace("Bearer ", "").trim())
                .payload
        } catch (e: Exception) {
            null
        }
    }

    fun generatePseudonym(userId: Int, courseId: Int): String {
        val input = "usr-$userId-course-$courseId-salt"
        val md = MessageDigest.getInstance("MD5")
        val digest = md.digest(input.toByteArray(StandardCharsets.UTF_8))
        val hex = digest.take(4).joinToString("") { "%02x".format(it) }
        return "anon-usr-$hex"
    }
}
