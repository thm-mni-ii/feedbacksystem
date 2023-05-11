package de.thm.ii.fbs.model.v2.checker.storage

import java.io.Serializable

data class CheckerStorageId(var configurationId: Int? = null, var storageKey: String? = null) : Serializable
