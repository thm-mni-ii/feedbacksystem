package de.thm.ii.fbs.util

import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.test.context.junit4.SpringRunner
import java.time.{LocalDate, Month}
import org.assertj.core.api.Assertions;

/**
  * Tests DateParser
  *
  * @author Andrej Sajenko
  */
@RunWith(classOf[SpringRunner])
class DateParserTest {
  /**
    * Tests DateParser::dateParser
    */
  @Test
  def dateParserTest01(): Unit = {
    val isoDate = "2014-01-24 14:30:10"
    val expectedParsedIsoDate = LocalDate.of(2014, Month.JANUARY, 24)
    val currentParsedIsoDate = DateParser.dateParser(isoDate)
    Assertions.assertThat(currentParsedIsoDate).isEqualTo(expectedParsedIsoDate)
  }

  /**
    * Tests DateParser::dateParser
    */
  @Test
  def dateParserTest02(): Unit = {
    val isoDate = "2013-12-23"
    val expectedParsedIsoDate = LocalDate.of(2013, Month.DECEMBER, 23)
    val currentParsedIsoDate = DateParser.dateParser(isoDate)
    Assertions.assertThat(currentParsedIsoDate).isEqualTo(expectedParsedIsoDate)
  }

  /**
    * Tests DateParser::dateParser
    */
  @Test
  def dateParserTest03(): Unit = {
    val isoDate = "28/12/2013"
    val expectedParsedIsoDate = LocalDate.of(2013, Month.DECEMBER, 28)
    val currentParsedIsoDate = DateParser.dateParser(isoDate)
    Assertions.assertThat(currentParsedIsoDate).isEqualTo(expectedParsedIsoDate)
  }

  /**
    * Tests DateParser::dateParser
    */
  @Test
  def dateParserTest04(): Unit = {
    val isoDate = "21-12-2013"
    val expectedParsedIsoDate = LocalDate.of(2013, Month.DECEMBER, 21)
    val currentParsedIsoDate = DateParser.dateParser(isoDate)
    Assertions.assertThat(currentParsedIsoDate).isEqualTo(expectedParsedIsoDate)
  }

  /**
    * Tests DateParser::dateParser
    */
  @Test
  def dateParserTest05(): Unit = {
    val isoDate = "21.12.2013"
    val expectedParsedIsoDate = LocalDate.of(2013, Month.DECEMBER, 21)
    val currentParsedIsoDate = DateParser.dateParser(isoDate)
    Assertions.assertThat(currentParsedIsoDate).isEqualTo(expectedParsedIsoDate)
  }

  /**
    * Tests DateParser::dateParser
    */
  @Test
  def dateParserTest06(): Unit = {
    val isoDate = "21.12.2013"
    val expectedParsedIsoDate = LocalDate.of(2013, Month.DECEMBER, 21)
    val currentParsedIsoDate = DateParser.dateParser(isoDate)
    Assertions.assertThat(currentParsedIsoDate).isEqualTo(expectedParsedIsoDate)
  }
}
