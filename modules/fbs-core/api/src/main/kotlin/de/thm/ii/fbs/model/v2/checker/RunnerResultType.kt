package de.thm.ii.fbs.model.v2.checker

import com.fasterxml.jackson.annotation.JsonValue

enum class RunnerResultType(@JsonValue val label: String) {
    PLAYGROUND("playground")
}
