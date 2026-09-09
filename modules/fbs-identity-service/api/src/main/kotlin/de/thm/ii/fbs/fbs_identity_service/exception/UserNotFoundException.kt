package de.thm.ii.fbs.fbs_identity_service.exception

class UserNotFoundException(userId: Long) : RuntimeException("User with ID $userId not found")
