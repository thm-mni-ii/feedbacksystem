package de.thm.ii.fbs.common.types.checkerApi

data class FormDefinition(val title: String, val helpText: String, val fields: List<FormFieldDefinition<Any>>)
