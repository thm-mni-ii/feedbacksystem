package de.thm.ii.fbs.common.types.checkerApi

import de.thm.ii.fbs.common.types.utils.JpaJsonConverter
import jakarta.persistence.*

@Entity
data class Form(
    @Convert(converter = Converter::class)
    val definition: FormDefinition,
    val checkerID: Int,
    val taskID: Int?,
    val userID: Int?,
    val id: Int? = null,
) {
    private class Converter : JpaJsonConverter<Form>(Form::class)
}
