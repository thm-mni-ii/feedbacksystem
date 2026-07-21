package de.thm.ii.fbs.fbs_identity_service.config

import de.thm.ii.fbs.fbs_identity_service.service.auth.saml.SamlRouteService
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.saml2.provider.service.registration.RelyingPartyRegistrationRepository
import org.springframework.security.saml2.provider.service.web.DefaultRelyingPartyRegistrationResolver
import org.springframework.security.saml2.provider.service.web.RelyingPartyRegistrationResolver
import org.springframework.security.saml2.provider.service.web.authentication.OpenSaml4AuthenticationRequestResolver
import org.springframework.security.saml2.provider.service.web.authentication.Saml2AuthenticationRequestResolver

@Configuration
@ConditionalOnProperty(
    prefix = "app.saml",
    name = ["enabled"],
    havingValue = "true"
)
class SamlAuthenticationResolverConfig {

    @Bean
    fun authenticationRequestResolver(
        registrations: RelyingPartyRegistrationRepository,
        routeService: SamlRouteService
    ): Saml2AuthenticationRequestResolver {
        val registrationResolver: RelyingPartyRegistrationResolver =
            DefaultRelyingPartyRegistrationResolver(registrations)

        val resolver = OpenSaml4AuthenticationRequestResolver(registrationResolver)

        resolver.setRelayStateResolver { request ->
            routeService.sanitize(request.getParameter("route"))
        }

        return resolver
    }
}
