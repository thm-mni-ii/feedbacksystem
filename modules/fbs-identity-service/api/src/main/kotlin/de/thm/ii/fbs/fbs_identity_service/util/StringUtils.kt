package de.thm.ii.fbs.fbs_identity_service.util

fun String?.toCleanList(delimiter: String = ","): List<String> =
    this?.split(delimiter)?.map { it.trim() }?.filter { it.isNotEmpty() } ?: emptyList()
