package de.thm.ii.fbs.mathParser.transformers

import de.thm.ii.fbs.mathParser.ast.Ast

class DebugTransformer : Transformer {
    override fun transform(input: Ast): Ast = input.also { println(it.toDot()) }
}
