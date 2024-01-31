package de.thm.ii.fbs.mathParser.marshal

import de.thm.ii.fbs.mathParser.ast.Ast

interface Marshal {
    fun marshal(input: Ast): String
    fun unmarshal(input: String): Ast
}
