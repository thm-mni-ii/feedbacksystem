package de.thm.ii.fbs.mathParser.ast

import java.lang.StringBuilder

data class Ast(val root: Expr) {
    fun toDot(): String = "strict graph {\nrankdir=BT\n${StringBuilder().let {root.toDot(it, 0); return@let it.toString()}}}"
}
