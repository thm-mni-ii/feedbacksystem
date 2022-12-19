package de.thm.ii.fbs.model.v2.checker

import com.fasterxml.jackson.annotation.JsonValue

enum class RunnerMode(@JsonValue val label: String) {
    EXECUTE("execute"),
    DELETE_DB("deleteDb"),
}
