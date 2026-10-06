package de.thm.ii.fbs.fbs_identity_service.service.auth

import com.nimbusds.jose.JOSEObjectType
import com.nimbusds.jose.JWSAlgorithm
import com.nimbusds.jose.JWSHeader
import com.nimbusds.jose.crypto.RSASSASigner
import com.nimbusds.jose.jwk.RSAKey
import com.nimbusds.jwt.JWTClaimsSet
import com.nimbusds.jwt.SignedJWT
import de.thm.ii.fbs.fbs_identity_service.dto.auth.TokenExchangeRequest
import de.thm.ii.fbs.fbs_identity_service.dto.auth.TokenExchangeResponse
import de.thm.ii.fbs.fbs_identity_service.persistence.repository.ApplicationProviderRepository
import de.thm.ii.fbs.fbs_identity_service.service.CurrentUserService
import de.thm.ii.fbs.fbs_identity_service.util.toCleanList
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.web.servlet.support.ServletUriComponentsBuilder
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.util.Date
import java.util.UUID

@Service
class TokenExchangeService(
    private val currentUserService: CurrentUserService,
    private val applicationProviderRepository: ApplicationProviderRepository,
    private val rsaKey: RSAKey,

    @param:Value("\${security.oidc.issuer:}")
    private val configuredIssuer: String = "",

    @param:Value("\${security.oidc.client.id:fbs-web-shell}")
    private val configuredClientIds: String,

    @param:Value("\${security.oidc.client.access-token-ttl-minutes:10}")
    private val accessTokenTtlMinutes: Long = 10
) {
    private val logger = LoggerFactory.getLogger(TokenExchangeService::class.java)

    fun exchangeToken(request: TokenExchangeRequest): TokenExchangeResponse {
        val currentUser = currentUserService.getCurrentUser()
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not authenticated")

        val targetAudience = request.targetAudience.trim()
        if (targetAudience.isBlank()) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Target audience must not be blank")
        }

        val baseInternalClients = configuredClientIds.toCleanList().toSet() +
            setOf("fbs-web-shell", "course-management", "sql-playground", "fbs-qcm", "fbs-test-client")

        val provider = applicationProviderRepository.findById(targetAudience).orElse(null)
            ?: applicationProviderRepository.findByClientId(targetAudience)

        val isInternal: Boolean
        if (provider != null) {
            if (!provider.isActive) {
                throw ResponseStatusException(HttpStatus.FORBIDDEN, "Application provider '$targetAudience' is inactive")
            }
            if (!provider.requiredGlobalRole.isAccessibleBy(currentUser.globalRole)) {
                logger.warn(
                    "User '{}' (role: {}) attempted to access provider '{}' requiring role '{}'",
                    currentUser.username,
                    currentUser.globalRole,
                    targetAudience,
                    provider.requiredGlobalRole
                )
                throw ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Access denied: provider requires role ${provider.requiredGlobalRole}"
                )
            }
            isInternal = provider.isInternal
        } else if (baseInternalClients.contains(targetAudience)) {
            isInternal = true
        } else {
            logger.warn("Token exchange failed: unknown target audience '{}'", targetAudience)
            throw ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Target audience '$targetAudience' is not a registered application provider"
            )
        }

        val effectiveIssuer = if (configuredIssuer.isNotBlank()) {
            configuredIssuer.trim()
        } else {
            try {
                ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString()
            } catch (_: Exception) {
                "http://localhost:8080"
            }
        }

        val subjectValue = if (isInternal) currentUser.id.toString() else currentUser.username
        val fullName = listOf(currentUser.prename, currentUser.surname)
            .filter { it.isNotBlank() }
            .joinToString(" ")
            .ifBlank { currentUser.username }

        val now = Date()
        val expiryDate = Date(now.time + (accessTokenTtlMinutes * 60 * 1000L))

        val claimsBuilder = JWTClaimsSet.Builder()
            .issuer(effectiveIssuer)
            .subject(subjectValue)
            .audience(listOf(targetAudience))
            .issueTime(now)
            .expirationTime(expiryDate)
            .jwtID(UUID.randomUUID().toString())
            .claim("azp", "fbs-web-shell")
            .claim("client_id", "fbs-web-shell")
            .claim("id", currentUser.id)
            .claim("userId", currentUser.id)
            .claim("username", currentUser.username)
            .claim("preferred_username", currentUser.username)
            .claim("globalRole", currentUser.globalRole.name)
            .claim("global_role", currentUser.globalRole.name)
            .claim("roles", listOf("ROLE_${currentUser.globalRole.name}"))
            .claim("given_name", currentUser.prename)
            .claim("family_name", currentUser.surname)
            .claim("name", fullName)

        if (!currentUser.email.isNullOrBlank()) {
            claimsBuilder.claim("email", currentUser.email)
        }

        val header = JWSHeader.Builder(JWSAlgorithm.RS256)
            .keyID(rsaKey.keyID)
            .type(JOSEObjectType.JWT)
            .build()

        val signedJWT = SignedJWT(header, claimsBuilder.build())
        val signer = RSASSASigner(rsaKey.toRSAPrivateKey())
        signedJWT.sign(signer)

        val serializedToken = signedJWT.serialize()
        logger.debug(
            "Issued audience-scoped token for user '{}' targeting audience '{}'",
            currentUser.username,
            targetAudience
        )

        return TokenExchangeResponse(
            accessToken = serializedToken,
            tokenType = "Bearer",
            expiresIn = accessTokenTtlMinutes * 60,
            audience = targetAudience
        )
    }
}
