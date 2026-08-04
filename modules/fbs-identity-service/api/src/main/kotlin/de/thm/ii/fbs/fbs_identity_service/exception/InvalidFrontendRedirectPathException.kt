package de.thm.ii.fbs.fbs_identity_service.exception

class InvalidFrontendRedirectPathException(
    path: String
) : RuntimeException("Invalid frontend redirect path: $path")
