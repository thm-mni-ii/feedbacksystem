package de.thm.ii.fbs.model.v2.checker

import com.fasterxml.jackson.annotation.JsonValue

enum class RunnerDbType(@JsonValue val label: String) {
    POSTGRES("postgresql"),
    MYSQL("mysql")
}
