package de.thm.ii.fbs.model.v2.security

import de.thm.ii.fbs.model.v2.GlobalRole

class LegacyToken(
    val id: Int,
    val username: String,
    val globalRole: GlobalRole
)
