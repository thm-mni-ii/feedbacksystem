package de.thm.ii.fbs.model.v2.checker

import com.fasterxml.jackson.annotation.JsonValue

enum class RunnerType(@JsonValue val label: String) {
    SQL_PLAYGROUND("sql-playground"),
    SHARE_PLAYGROUND("share")
}
