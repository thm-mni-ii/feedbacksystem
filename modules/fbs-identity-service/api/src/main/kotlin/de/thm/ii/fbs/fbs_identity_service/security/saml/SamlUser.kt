package de.thm.ii.fbs.fbs_identity_service.security.saml

data class SamlUser(
    val username: String,
    val prename: String,
    val surname: String,
    val email: String
)