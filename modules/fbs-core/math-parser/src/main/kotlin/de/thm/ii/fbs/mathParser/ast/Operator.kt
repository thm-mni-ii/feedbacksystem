package de.thm.ii.fbs.mathParser.ast

import java.lang.StringBuilder

enum class Operator {
    ADD,
    SUB,
    MUL,
    DIV,
    MOD,
    EXP,
    RAD,
    LOG,
    EQ;

    fun toDot(sb: StringBuilder, i: Int): Int {
        val j = i + 1
        sb.append("$j [label=$this]\n")
        return j
    }
}
