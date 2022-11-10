package de.thm.ii.fbs.services.v2.security

import org.springframework.stereotype.Service
import java.nio.ByteBuffer
import java.security.SecureRandom
import java.security.MessageDigest

@Service
class HashTokenService {
    private val rng = SecureRandom()

    data class GenerationResult(val token: String, val hash: String)

    fun generate(): GenerationResult = baToHex(random(32)).let {token -> GenerationResult(token, hash(token)) }
    fun hash(input: String): String = MessageDigest.getInstance("SHA-512").let {md ->
        md.update(input.toByteArray())
        baToHex(md.digest())
    }

    private fun baToHex(ba: ByteArray): String = String.format("%X", ByteBuffer.wrap(ba).long)
    private fun random(length: Int) = ByteArray(length).also { ba -> rng.nextBytes(ba) }
}
