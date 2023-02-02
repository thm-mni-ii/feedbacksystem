package de.thm.ii.fbs.mathParser.transformer

import de.thm.ii.fbs.mathParser.ast.Ast

interface Transformer {
    fun transform(input: Ast): Ast
}
