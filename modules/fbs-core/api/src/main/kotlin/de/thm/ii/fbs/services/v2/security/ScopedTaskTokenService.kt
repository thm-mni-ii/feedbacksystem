package de.thm.ii.fbs.services.v2.security

import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.SignatureAlgorithm
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.nio.charset.StandardCharsets
import java.security.MessageDigest
import java.util.Date

@Service
class ScopedTaskTokenService(
    @Value("\${jwt.secret:8Dsupersecurekeydf0}")
    private val jwtSecret: String,
    @Value("\${services.self.url:https://feedback.thm.de/course-management}")
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

        val claimsBuilder = Jwts.claims()
            .setIssuer(issuer)
            .setSubject(userId.toString())
            .setIssuedAt(now)
            .setExpiration(expiry)

        claimsBuilder["pseudonym"] = pseudonym
        claimsBuilder["username"] = username
        claimsBuilder["cid"] = courseId
        claimsBuilder["tid"] = taskId
        if (submissionId != null) {
            claimsBuilder["sid"] = submissionId
        }
        claimsBuilder["course_role"] = courseRole
        claimsBuilder["scope"] = scope

        return Jwts.builder()
            .setClaims(claimsBuilder)
            .signWith(SignatureAlgorithm.HS256, jwtSecret.toByteArray(StandardCharsets.UTF_8))
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

        val claims = Jwts.claims()
            .setIssuer(issuer)
            .setSubject("fbs:evaluator")
            .setIssuedAt(now)
            .setExpiration(expiry)

        claims["sid"] = submissionId
        claims["ccid"] = checkerConfigId
        claims["tid"] = taskId
        claims["cid"] = courseId
        claims["scope"] = "fbs:task:evaluate"

        return Jwts.builder()
            .setClaims(claims)
            .signWith(SignatureAlgorithm.HS256, jwtSecret.toByteArray(StandardCharsets.UTF_8))
            .compact()
    }

    /**
     * Validates a scoped callback token and extracts its claims.
     */
    fun validateCallbackToken(token: String, expectedSubmissionId: Int, expectedCheckerConfigId: Int): Boolean {
        return try {
            val claims = Jwts.parser()
                .setSigningKey(jwtSecret.toByteArray(StandardCharsets.UTF_8))
                .parseClaimsJws(token.replace("Bearer ", "").trim())
                .body

            val sid = claims["sid"]?.toString()?.toIntOrNull()
            val ccid = claims["ccid"]?.toString()?.toIntOrNull()
            val scope = claims["scope"]?.toString()

            sid == expectedSubmissionId && ccid == expectedCheckerConfigId && (scope == "fbs:task:evaluate" || scope == "fbs:result:ingest")
        } catch (e: Exception) {
            false
        }
    }

    fun parseToken(token: String): Claims? {
        return try {
            Jwts.parser()
                .setSigningKey(jwtSecret.toByteArray(StandardCharsets.UTF_8))
                .parseClaimsJws(token.replace("Bearer ", "").trim())
                .body
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
