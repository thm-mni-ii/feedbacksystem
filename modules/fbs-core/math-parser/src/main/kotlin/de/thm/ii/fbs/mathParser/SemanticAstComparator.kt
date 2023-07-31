@file:Suppress("ktlint:no-wildcard-imports")

package de.thm.ii.fbs.mathParser

import de.thm.ii.fbs.mathParser.ast.*
import de.thm.ii.fbs.mathParser.transformers.*
import java.math.RoundingMode
import kotlin.reflect.KClass
import kotlin.reflect.full.createType
import kotlin.reflect.full.primaryConstructor

class SemanticAstComparator(
    decimals: Int = 2,
    roundingMode: RoundingMode = RoundingMode.HALF_UP,
    ignoreNeutralElements: Boolean = false,
    applyInverseElements: Boolean = false,
    applyCommutativeLaw: Boolean = false,
    applyExponentLaws: Boolean = false
) {
    class Builder {
        private var decimals: Int = 2
        private var roundingMode: RoundingMode = RoundingMode.HALF_UP
        private var ignoreNeutralElements: Boolean = false
        private var applyInverseElements: Boolean = false
        private var applyCommutativeLaw: Boolean = false
        private var applyExponentLaws: Boolean = false

        fun decimals(decimals: Int) = apply { this.decimals = decimals }
        fun roundingMode(roundingMode: RoundingMode) = apply { this.roundingMode = roundingMode }
        fun ignoreNeutralElements(ignoreNeutralElements: Boolean) = apply { this.ignoreNeutralElements = ignoreNeutralElements }
        fun applyInverseElements(applyInverseElements: Boolean) = apply { this.applyInverseElements = applyInverseElements }
        fun applyCommutativeLaw(applyCommutativeLaw: Boolean) = apply { this.applyCommutativeLaw = applyCommutativeLaw }
        fun applyExponentLaws(applyExponentLaws: Boolean) = apply { this.applyExponentLaws = applyExponentLaws }

        fun build(): SemanticAstComparator =
            SemanticAstComparator(
                decimals,
                roundingMode,
                ignoreNeutralElements,
                applyInverseElements,
                applyCommutativeLaw,
                applyExponentLaws
            )
    }

    private val transformerConfig = TransformerConfig(decimals, roundingMode)

    fun compare(base: Ast, other: Ast): Boolean {
        val l = normalize(base)
        val r = normalize(other)

        return l == r
    }
    private fun normalize(ast: Ast): Ast = transformer.transform(ast)

    private val transformer = run {
        val cleaners: MutableList<KClass<*>> = mutableListOf()
        if (ignoreNeutralElements) {
            cleaners += listOf(NeutralElementTransformer::class)
        }
        if (applyInverseElements) {
            cleaners += listOf(InverseElementTransformer::class)
        }

        val transformers: MutableList<KClass<*>> = mutableListOf(NumberScalingTransformer::class)
        if (applyCommutativeLaw) {
            transformers += listOf(
                NegativeNumberTransformer::class,
                MultiplicationSubTransformer::class,
                SubReplacingTransformer::class,
                DivisionReplacingTransformer::class,
                CommutativeLawTransformer::class
            )
        }
        if (applyExponentLaws) {
            transformers += listOf(ExponentTransformer::class)
        }
        ChainTransformer(
            *(
                listOf(NumberScalingTransformer::class) +
                    cleaners +
                    transformers +
                    cleaners
                ).map { createTransformer(it) as Transformer }.toTypedArray()
        )
    }

    private fun <T : Any> createTransformer(c: KClass<T>): T {
        val constructor = c.primaryConstructor!!
        val transformer = if (constructor.parameters.isEmpty()) {
            constructor.call()
        } else if (constructor.parameters.size == 1 && constructor.parameters[0].type == TransformerConfig::class.createType()) {
            constructor.call(transformerConfig)
        } else {
            throw IllegalArgumentException("failed to invoke constructor for ${c.qualifiedName}")
        }
        return transformer
    }
}
