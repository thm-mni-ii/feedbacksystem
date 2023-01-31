package de.thm.ii.fbs.mathParser.ast

enum class Operator {
    ADD,
    SUB,
    MUL,
    DIV,
    MOD,
    EXP,
    RAD,
    LOG,
}

data class UnaryOperation(val operator: Operator, val target: Expr) : Expr()
