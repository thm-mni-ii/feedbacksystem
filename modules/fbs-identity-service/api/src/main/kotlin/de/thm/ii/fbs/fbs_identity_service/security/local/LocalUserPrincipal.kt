package de.thm.ii.fbs.fbs_identity_service.security.local

import de.thm.ii.fbs.fbs_identity_service.model.user.GlobalRole
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.userdetails.UserDetails

data class LocalUserPrincipal(
    val userId: Long,
    private val username: String,
    private val password: String,
    val globalRole: GlobalRole,
    private val authorities: Collection<GrantedAuthority>
) : UserDetails {

    override fun getUsername(): String = username

    override fun getPassword(): String = password

    override fun getAuthorities(): Collection<GrantedAuthority> = authorities

    override fun isAccountNonExpired(): Boolean = true

    override fun isAccountNonLocked(): Boolean = true

    override fun isCredentialsNonExpired(): Boolean = true

    override fun isEnabled(): Boolean = true
}
