package de.thm.ii.fbs.common.types.checkerApi

import jakarta.persistence.Entity
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany

@Entity
data class Token(
    val token: String,
    @ManyToOne
    val checker: Checker,
    val id: Int? = null,
)
