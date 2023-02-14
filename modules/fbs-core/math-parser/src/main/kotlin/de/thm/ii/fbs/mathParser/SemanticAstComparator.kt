package de.thm.ii.fbs.mathParser

import de.thm.ii.fbs.mathParser.ast.*
import de.thm.ii.fbs.mathParser.transformers.*
import java.math.RoundingMode

class SemanticAstComparator(
    decimals: Int = 2,
    roundingMode: RoundingMode = RoundingMode.HALF_UP,
    ignoreNeutralElements: Boolean = false,
    applyInverseElements: Boolean = false,
    applyCommutativeLaw: Boolean = false,
) {
    class Builder {
        private var decimals: Int = 2
        private var roundingMode: RoundingMode = RoundingMode.HALF_UP
        private var ignoreNeutralElements: Boolean = false
        private var applyInverseElements: Boolean = false
        private var applyCommutativeLaw: Boolean = false

        fun decimals(decimals: Int) = apply { this.decimals = decimals }
        fun roundingMode(roundingMode: RoundingMode) = apply { this.roundingMode = roundingMode }
        fun ignoreNeutralElements(ignoreNeutralElements: Boolean) = apply { this.ignoreNeutralElements = ignoreNeutralElements }
        fun applyInverseElements(applyInverseElements: Boolean) = apply { this.applyInverseElements = applyInverseElements }
        fun applyCommutativeLaw(applyCommutativeLaw: Boolean) = apply { this.applyCommutativeLaw = applyCommutativeLaw }

        fun build(): SemanticAstComparator =
            SemanticAstComparator(decimals, roundingMode, ignoreNeutralElements, applyInverseElements, applyCommutativeLaw)
    }

    private val transformerConfig = TransformerConfig(decimals, roundingMode)

    fun compare(base: Ast, other: Ast): Boolean {
        val l = normalize(base)
        val r = normalize(other)
        return l == r
    }
    private fun normalize(ast: Ast): Ast = transformer.transform(ast)

    private val transformer = run {
        val transformers: MutableList<Transformer> = mutableListOf(NumberScalingTransformer(transformerConfig))
        if (ignoreNeutralElements) {
            transformers += listOf(NeutralElementTransformer(transformerConfig))
        }
        if (applyInverseElements) {
            transformers += listOf(InverseElementTransformer(transformerConfig))
        }
        if (applyCommutativeLaw) {
            transformers += listOf(
                SubReplacingTransformer(),
                CommutativeLawTransformer()
            )
        }
        ChainTransformer(
            *transformers.toTypedArray()
        )
    }
}
