package de.thm.ii.fbs.mathParser.transformer

import de.thm.ii.fbs.mathParser.ast.Ast

class ChainTransformer(private vararg val transformers: Transformer) : Transformer {
    override fun transform(input: Ast): Ast {
        var current = input
        for (transformer in transformers) {
            current = transformer.transform(current)
        }
        return current
    }
}
