@file:Suppress("ktlint:no-wildcard-imports")

package de.thm.ii.fbs.mathParser.transformer

import de.thm.ii.fbs.mathParser.transformers.TransformerConfig
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.math.RoundingMode

internal class TransformerConfigTest {
    @Test
    fun testConstruct() {
        assertEquals(
            TransformerConfig(2, RoundingMode.HALF_UP),
            TransformerConfig(2)
        )
    }
}
