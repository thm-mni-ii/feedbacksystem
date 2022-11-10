package de.thm.ii.fbs.common.types.checkerApi

import jakarta.persistence.Entity
import jakarta.persistence.OneToMany

@Entity
data class Checker(
    val name: String,
    @OneToMany
    val tokens: List<Token>,
    val id: Int? = null,
)
