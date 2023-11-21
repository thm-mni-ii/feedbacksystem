package de.thm.ii.fbs.model.v2.security
import java.time.LocalDateTime
import javax.persistence.Entity
import javax.persistence.Id

@Entity
class SharePlaygroundToken(
    @Id
    val token: String,
    val userId: Int,
    val dbId: Int,
    val expiryTime: LocalDateTime,
    val uri: String
)