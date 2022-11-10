package de.thm.ii.fbs.common.types.checkerApi

abstract class FormFieldDefinition<T> {
    abstract val type: String
    abstract val label: String;
    abstract val placeholder: String;
    abstract val default: T;

    data class TextFieldDefinition(
            override val label: String,
            override val placeholder: String,
            override val default: String,
            val minLength: Int,
            val maxLength: Int,
            val matching: String,
    ) : FormFieldDefinition<String>() {
        override val type: String = "text"
    }

    data class NumberFieldDefinition(
            override val label: String,
            override val placeholder: String,
            override val default: Double,
            val min: Double,
            val max: Double,
            val precision: Int,
    ) : FormFieldDefinition<Double>() {
        override val type: String = "number"
    }

    data class BooleanFieldDefinition(
            override val label: String,
            override val placeholder: String,
            override val default: Boolean,
    ) : FormFieldDefinition<Boolean>() {
        override val type: String = "boolean"

    }

    data class FileFieldDefinition(
            override val label: String,
            override val placeholder: String,
            override val default: String,
            val allowedType: List<String>,
            val maxSize: Long
    ) : FormFieldDefinition<String>() {
        override val type: String = "file"
    }
}
