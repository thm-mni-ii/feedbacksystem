package de.thm.ii.fbs.common.types.checkerApi

abstract class FormField<T>() {
    abstract val value: T
    data class TextField(override val value: String) : FormField<String>()
    data class NumberField(override val value: Double) : FormField<Double>()
    data class BooleanField(override val value: Boolean) : FormField<Boolean>()
    data class FileField(val url: String, val contentType: String, val size: Long) : FormField<String>() {
        override val value: String
            get() = url;
    }
}
