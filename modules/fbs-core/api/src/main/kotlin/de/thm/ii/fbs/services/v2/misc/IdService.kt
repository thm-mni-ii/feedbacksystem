package de.thm.ii.fbs.services.v2.misc

import org.hashids.Hashids
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service

@Service
class IdService(
    @Value("\${services.ids.salt}")
    salt: String,
    @Value("\${services.ids.length}")
    length: Int,
) {
    private val hashids = Hashids(salt, length)

    fun encode(id: Long): String =
        hashids.encode(id)

    fun encode(id: Int): String =
        encode(id.toLong())
}
