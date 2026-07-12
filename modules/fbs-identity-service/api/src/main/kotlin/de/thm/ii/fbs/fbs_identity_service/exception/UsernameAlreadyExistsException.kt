package de.thm.ii.fbs.fbs_identity_service.exception

class UsernameAlreadyExistsException(
    username: String
) : RuntimeException("Username `$username` already exists")
