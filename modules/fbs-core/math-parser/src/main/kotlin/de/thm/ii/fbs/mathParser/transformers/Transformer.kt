package de.thm.ii.fbs.mathParser.transformers

import de.thm.ii.fbs.mathParser.ast.Ast

interface Transformer {
    fun transform(input: Ast): Ast
}
