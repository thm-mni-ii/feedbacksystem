package de.thm.ii.fbs.services.checker.excel

import scala.jdk.CollectionConverters._
import de.thm.ii.fbs.model.checker.excel.SpreadsheetCell
import de.thm.ii.fbs.model.{ExcelMediaInformation, ExcelMediaInformationChange, ExcelMediaInformationCheck, ExcelMediaInformationTasks}
import org.apache.poi.ss.usermodel.CellType
import org.apache.poi.xssf.usermodel.{XSSFFormulaEvaluator, XSSFSheet, XSSFWorkbook}
import org.springframework.stereotype.Service
import org.apache.poi.ss.formula.eval.FunctionEval

import scala.collection.mutable.{ArrayBuffer, ListBuffer}
import java.io.{File, FileInputStream}
import java.text.NumberFormat
import java.util.Locale
import scala.util.matching.Regex
import org.matheclipse.core.eval.ExprEvaluator

/**
 * A Spreadsheet Service
 */
@Service
class ExcelService {
  private case class Cords(row: Int, col: Int)

  /**
   * Gets the values in the selected field range
   *
   * @param spreadsheet           the spreadsheet field
   * @param excelMediaInformation the spreadsheet Configurations
   * @return the values
   */
  def getFields(spreadsheet: File, excelMediaInformation: ExcelMediaInformation, checkFields: ExcelMediaInformationCheck): Seq[SpreadsheetCell] = {
    val sheet = this.initSheet(spreadsheet, excelMediaInformation)
    val (start, end) = this.parseCellRange(checkFields.range)
    val values = this.getInCol(sheet, end.col, start.row, end.row)

    values
  }

  def getFormula(spreadsheet: File, excelMediaInformation: ExcelMediaInformation, checkFields: ExcelMediaInformationCheck): Seq[sheetCell] = {
    val sheet = this.initSheet(spreadsheet, excelMediaInformation)
    val (start, end) = this.parseCellRange(checkFields.range)
    val values = this.hasFormula(sheet, start.row, end.row, start.col, end.col)

    values
  }

  private def hasFormula(sheet: XSSFSheet, startRow: Int, endRow: Int, startCol: Int, endCol: Int): Seq[sheetCell] = {
    (startRow to endRow).flatMap(rowIdx => {
      val row = sheet.getRow(rowIdx)
      if (row != null) {
        (startCol to endCol).flatMap(colIdx => {
          val cell = row.getCell(colIdx)
          if (cell != null && cell.getCellType == CellType.FORMULA) {
            val formula = cell.getCellFormula
            Some(sheetCell(formula, cell.getNumericCellValue.toString, cell.getReference))
          } else {
            None
          }
        })
      } else {
        Seq.empty[sheetCell]
      }
    })
  }

  def printCellsInRange(rangeReference: String): List[String] = {
    val (start, end) = this.parseCellRange(rangeReference)

    val cellReferences = ListBuffer.empty[String]

    for (rowIdx <- start.row to end.row) {
      for (colIdx <- start.col to end.col) {
        val cellRef = getCellReference(colIdx) + (rowIdx + 1)
        cellReferences += cellRef
      }
    }

    cellReferences.toList
  }

  //  method to convert column index to column letter (e.g., 0 -> A, 1 -> B, etc.)
  private def getCellReference(colIdx: Int): String = {
    val quotient = colIdx / 26
    val remainder = colIdx % 26
    if (quotient > 0) {
      ('A' + quotient - 1).toChar.toString + ('A' + remainder).toChar.toString
    } else {
      ('A' + colIdx).toChar.toString
    }
  }

  def normalizeNonFunctionTokens(formula: String): String = {
    // Tokenize the formula
    val tokens = tokenizeFormula(formula)

    // Identify function expressions and their ranges
    val functionRanges = tokens.foldLeft(Seq.empty[(Int, Int)]) { (acc, token) =>
      if (token._1 == "function") {
        // Find the range of the function expression
        val start = tokens.indexOf(token)
        val end = tokens.indexWhere(_._1 == "parenthesis", start) + 1
        acc :+ (start, end)
      } else {
        acc
      }
    }

    // Extract function expressions
    val functionExpressions = functionRanges.map { case (start, end) =>
      tokens.slice(start, end).map(_._2).mkString
    }

    // Remove function expressions from the original formula
    var formulaWithoutFunctions = formula
    functionExpressions.foreach { expr =>
      formulaWithoutFunctions = formulaWithoutFunctions.replace(expr, "")
    }

    // Normalize the remaining part of the formula
    val util = new ExprEvaluator(false, 100)
    val normalizedNonFunctionTokens = util.eval(formulaWithoutFunctions).toString
    // Reassemble the formula
    (functionExpressions.mkString + normalizedNonFunctionTokens).trim.toUpperCase

  }

  /*function(simplifyFormula) created to simplify arithmetic notations (for example 4-1/3 will turn to 3.66)
 however when called with ExprEvaluator it can lead to false results in the formulas
   */
  private def simplifyFormula(formula: String): String = {
    // Pattern to find and replace simple arithmetic operations that do not involve cell references
    val pattern = """(\d+(\.\d+)?)([+*/-])(\d+(\.\d+)?)""".r

    pattern.replaceAllIn(formula, m => {
      val leftOperand = m.group(1).toDouble
      val operator = m.group(3)
      val rightOperand = m.group(4).toDouble

      val result = operator match {
        case "+" => leftOperand + rightOperand
        case "-" => leftOperand - rightOperand
        case "*" => leftOperand * rightOperand
        case "/" => leftOperand / rightOperand
      }

      f"$result%.2f" // Format to 2 decimal places, you can adjust as needed
    })
  }

  def processFormula(formula: String): String = {
    //val simplifiedFormula = simplifyFormula(formula)
    normalizeNonFunctionTokens(formula)
  }


  def compareForm(teacher_sequence: Seq[sheetCell], student_sequence: Seq[sheetCell], invalidFields: List[String]): (String, List[String]) = {
    val stringBuilder = new StringBuilder()
    var updatedInvalidFields = invalidFields

    for ((teacher_cell, student_cell) <- teacher_sequence.zip(student_sequence)) {
      // Normalize non-function tokens in the formulas
      val normalizedTeacherFormula = processFormula((teacher_cell.formula))
      val normalizedStudentFormula = processFormula((student_cell.formula))
      if (isComplexNestedFunction(teacher_cell.formula) || isComplexNestedFunction(student_cell.formula)) {
        stringBuilder.append(s"#Komplexe verschachtelte Funktionen in Zelle '${teacher_cell.reference}' sind noch nicht unterstützt.\n\n")
      }
      if (isNonStandardFunctionFormat(teacher_cell.formula) || isNonStandardFunctionFormat(student_cell.formula)) {
        stringBuilder.append(s"#Funktion in Zelle '${teacher_cell.reference}' ist noch nicht unterstützt.Aktuell werden nur Funktionen akzeptiert, " +
          s"die das Format 'func(ref:ref)' aufweisen.\n\n")
      }
      else {
        // Tokenize the normalized formulas
        val teacher_tokens = tokenizeFormula(normalizedTeacherFormula)
        val student_tokens = tokenizeFormula(normalizedStudentFormula)

        // Find differences for the entire formula

        val differences = findTokenDifferences(teacher_tokens, student_tokens, teacher_cell.value, student_cell.value, updatedInvalidFields)
        if (differences.nonEmpty) {
          stringBuilder.append(s"#Fehler entdeckt in Zelle '${teacher_cell.reference}':{${normalizedStudentFormula}}\n$differences\n")
          updatedInvalidFields = updatedInvalidFields :+ teacher_cell.reference
        }
      }
    }

    (stringBuilder.toString(), updatedInvalidFields)
  }

  //check if the user submission contains any nested functions
  def isComplexNestedFunction(formula: String): Boolean = {
    // Regular expression to identify complex nested functions
    val complexNestedFunctionPattern = """([A-Z]+\(.*\(.*\).*\))""".r

    complexNestedFunctionPattern.findFirstIn(formula).isDefined
  }

  //check if the user submission contains unsupported functions
  def isNonStandardFunctionFormat(formula: String): Boolean = {
    // Regex to match the standard function format func(ref:ref)
    val standardFunctionPattern = """[A-Z]+\(.*:.*\)""".r

    // Regex to match any Excel function
    val anyFunctionPattern = """[A-Z]+\(.*\)""".r

    // Check if the formula matches the standard function format
    val isStandard = standardFunctionPattern.findFirstIn(formula).isDefined

    // Check if the formula contains any function
    val containsFunction = anyFunctionPattern.findFirstIn(formula).isDefined

    // If the formula contains a function and it's not in the standard format, it's non-standard
    containsFunction && !isStandard
  }

  def containsReferenceWithColon
  (tokens: Seq[(String, String)]): Option[(String, String)] = {
    tokens.sliding(3).collectFirst {
      case Seq(("reference", ref1), ("operator", ":"), ("reference", ref2)) => (ref1, ref2)
    }
  }

  // Function to extract references from a range within a function
  def extractReferences(tokens: Seq[(String, String)]): Set[String] = {
    containsReferenceWithColon(tokens).map { case (ref1, ref2) =>
      printCellsInRange(s"$ref1:$ref2").toSet
    }.getOrElse(tokens.collect { case ("reference", ref) => ref }.toSet)
  }

  //  a method to extract references from normal arithmetic formulas
  def extractArithmeticReferences(tokens: Seq[(String, String)]): Set[String] = {
    tokens.collect { case ("reference", ref) => ref }.toSet
  }

  def findTokenDifferences(tokens1: Seq[(String, String)], tokens2: Seq[(String, String)],
                           teacher_cell_value: String, student_cell_value: String, invalidFields: List[String]): String = {
    val diffBuilder = new StringBuilder()
    var counter = 0;
    val functionNames = FunctionEval.getSupportedFunctionNames.asScala.map(_.toUpperCase).toList

    // Check if either of the formulas has a function
    val eitherIsFunction = tokens1.exists(_._1 == "function") ^ tokens2.exists(_._1 == "function")

    if (eitherIsFunction) {
      diffBuilder.append(compareEitherIsFunction(tokens1, tokens2, teacher_cell_value, student_cell_value, invalidFields))
    } else {
      val refs2 = extractReferences(tokens2)
      val studentInvalidRefs = refs2.intersect(invalidFields.toSet)

      // Separate tokens into function parts and non-function parts
      val (funcTokens1, nonFuncTokens1) = separateFunctionAndNonFunctionTokens(tokens1)
      val (funcTokens2, nonFuncTokens2) = separateFunctionAndNonFunctionTokens(tokens2)

      // Compare function parts
      if (funcTokens1 != funcTokens2) {
        diffBuilder.append(compareFunctionParts(funcTokens1, funcTokens2, studentInvalidRefs, teacher_cell_value, student_cell_value))
      }
      // Compare non-function parts (constants, operators, references)
      val nonFuncDiff = compareNonFunctionParts(nonFuncTokens1, nonFuncTokens2)
      if (nonFuncDiff.nonEmpty) {
        diffBuilder.append(nonFuncDiff)
      }
      // Check for incorrect function names in both teacher's and student's formulas
      val allFunctionTokens = (tokens1 ++ tokens2).filter(_._1 == "function").map(_._2).distinct
      allFunctionTokens.foreach { funcName =>
        if (!functionNames.contains(funcName.toUpperCase)) {
          val suggestedFunction = findMostSimilarKeyword(funcName, functionNames)
          diffBuilder.append(s"Unrecognized function '$funcName'. Did you mean '$suggestedFunction'?\n")
        }
      }
      counter = 0;
    }
    diffBuilder.toString()
  }

  def separateFunctionAndNonFunctionTokens(tokens: Seq[(String, String)]): (Seq[(String, String)], Seq[(String, String)]) = {
    val functionTokens = ArrayBuffer[(String, String)]()
    val nonFunctionTokens = ArrayBuffer[(String, String)]()
    var insideFunction = false
    var parenthesisDepth = 0

    tokens.foreach { case (tokenType, tokenValue) =>
      if (insideFunction) {
        functionTokens += ((tokenType, tokenValue))
        if (tokenType == "parenthesis") {
          if (tokenValue == "(") parenthesisDepth += 1
          if (tokenValue == ")") parenthesisDepth -= 1

          if (parenthesisDepth == 0) {
            insideFunction = false
          }
        }
      } else {
        if (tokenType == "function") {
          insideFunction = true
          parenthesisDepth = 0
          functionTokens += ((tokenType, tokenValue))
        } else {
          nonFunctionTokens += ((tokenType, tokenValue))
        }
      }
    }

    (functionTokens.toSeq, nonFunctionTokens.toSeq)
  }

  def compareEitherIsFunction(tokens1: Seq[(String, String)], tokens2: Seq[(String, String)],
                              teacher_cell_value: String, student_cell_value: String, invalidFields: List[String]): String = {
    val diffBuilder = new StringBuilder()

    val refs1 = if (tokens1.exists(_._1 == "function")) extractFunctionReferences(tokens1) else extractArithmeticReferences(tokens1)
    val refs2 = if (tokens2.exists(_._1 == "function")) extractFunctionReferences(tokens2) else extractArithmeticReferences(tokens2)

    val studentInvalidRefs = refs2.intersect(invalidFields.toSet)

    if (studentInvalidRefs.nonEmpty) {
      diffBuilder.append(s"->Bitte korrigieren Sie zuerst die falsche(n) Referenz(en): ${studentInvalidRefs.mkString(", ")}.\n");
    }

    if (teacher_cell_value != student_cell_value && refs1 == refs2) {
      diffBuilder.append(s"->Falsche Excel-Funktion verwendet\n");
    }
    if (refs1 != refs2) {
      val missingRefs = refs1.diff(refs2)
      val excessiveRefs = refs2.diff(refs1)

      if (missingRefs.nonEmpty) {
        diffBuilder.append(s"->Fehlende Referenz(en) in der Funktion: ${missingRefs.mkString(", ")}\n")
      }
      if (excessiveRefs.nonEmpty) {
        diffBuilder.append(s"->Exzessive Referenz(en) in der Funktion: ${excessiveRefs.mkString(", ")}\n")
      }
    }

    diffBuilder.toString()
  }

  def compareFunctionParts(tokens1: Seq[(String, String)], tokens2: Seq[(String, String)], invalidFields: Set[String],
                           teacher_cell_value: String, student_cell_value: String): String = {
    val diffBuilder = new StringBuilder()

    val bothAreFunctions = tokens1.exists(_._1 == "function") && tokens2.exists(_._1 == "function")

    val refs1 = if (tokens1.exists(_._1 == "function")) extractFunctionReferences(tokens1) else extractArithmeticReferences(tokens1)
    val refs2 = if (tokens2.exists(_._1 == "function")) extractFunctionReferences(tokens2) else extractArithmeticReferences(tokens2)

    if (bothAreFunctions) {
      val functionName1 = tokens1.find(_._1 == "function").map(_._2)
      val functionName2 = tokens2.find(_._1 == "function").map(_._2)
      if (functionName1 != functionName2) {
        diffBuilder.append(s"->Falsche Funktion verwendet, Benutze ${functionName1.getOrElse("")} statessen\n")
      } else if (refs1 != refs2) {
        val missingRefs = refs1.diff(refs2)
        val excessiveRefs = refs2.diff(refs1)
        if (missingRefs.nonEmpty) {
          diffBuilder.append(s"->Fehlende Referenz(en) in der Funktion: ${missingRefs.mkString(", ")}\n")
        }
        if (excessiveRefs.nonEmpty) {
          diffBuilder.append(s"->Exzessive Referenz(en) in der Funktion: ${excessiveRefs.mkString(", ")}\n")
        }
      }
    }
    diffBuilder.toString()
  }

  def compareNonFunctionParts(nonFuncTokens1: Seq[(String, String)], nonFuncTokens2: Seq[(String, String)]): String = {
    val diffBuilder = new StringBuilder()

    // Group tokens by their categories (like operators, constants, references)
    val tokens1Grouped = nonFuncTokens1.groupBy(_._1).view.mapValues(_.map(_._2)).toMap
    val tokens2Grouped = nonFuncTokens2.groupBy(_._1).view.mapValues(_.map(_._2)).toMap

    // Get all categories present in either of the token lists
    val allCategories = tokens1Grouped.keys.toSet ++ tokens2Grouped.keys.toSet

    allCategories.foreach { category =>
      val tokens1InCategory = tokens1Grouped.getOrElse(category, Seq.empty)
      val tokens2InCategory = tokens2Grouped.getOrElse(category, Seq.empty)

      val missingTokens = tokens1InCategory.diff(tokens2InCategory)
      val unnecessaryTokens = tokens2InCategory.diff(tokens1InCategory)

      missingTokens.foreach { token =>
        diffBuilder.append(s"->Fehlende $category: $token\n")
      }
      unnecessaryTokens.foreach { token =>
        diffBuilder.append(s"->Unnötige $category: $token\n")
      }
    }

    diffBuilder.toString()
  }


  def extractFunctionReferences(tokens: Seq[(String, String)]): Set[String] = {
    tokens.flatMap {
      case ("function", _) => containsReferenceWithColon(tokens).toList.flatMap {
        case (ref1, ref2) => printCellsInRange(s"$ref1:$ref2")
      }
      case _ => Seq.empty[String]
    }.toSet
  }


  def tokenizeFormula(formula: String): Seq[(String, String)] = {
    // Remove whitespace from the formula
    val formulaWithoutWhitespace = formula.replaceAll("\\s+", "")

    // Define the regular expression pattern for tokens
    val pattern = """(\+|-|\*|:|/|\(|\)|,)|(\$?[A-Za-z]+\$?\d+)|([A-Z][A-Z0-9_]*)|([0-9]+(?:\.[0-9]*)?)|(".*?")""".r

    // Tokenize the formula
    val tokens = pattern.findAllMatchIn(formulaWithoutWhitespace)

    // Categorize the tokens based on their types
    val categorizedTokens = tokens.map { m =>
      m.subgroups.zipWithIndex.collectFirst {
        case (token, index) if token != null => (getTokenCategory(index), token)
      }
    }.flatten.toSeq

    categorizedTokens
  }

  def getTokenCategory(index: Int): String = index match {
    case 0 => "operator"
    case 1 => "reference"
    case 2 => "function"
    case 3 => "constant"
    case 4 => "string"
    case _ => "unknown"
  }


  def initWorkBook(spreadsheet: File, excelMediaInformation: ExcelMediaInformationTasks): XSSFWorkbook = {
    val input = new FileInputStream(spreadsheet)
    val workbook = new XSSFWorkbook(input)
    excelMediaInformation.tasks.foreach(t => {
      this.setCells(workbook, t.changeFields)
      XSSFFormulaEvaluator.evaluateAllFormulaCells(workbook)
    })

    workbook
  }

  private def initSheet(spreadsheet: File, excelMediaInformation: ExcelMediaInformation): XSSFSheet = {
    val input = new FileInputStream(spreadsheet)
    val workbook = new XSSFWorkbook(input)
    val sheet = getSheetOrThrow(excelMediaInformation.sheetIdx, workbook)
    this.setCells(workbook, excelMediaInformation.changeFields)
    XSSFFormulaEvaluator.evaluateAllFormulaCells(workbook)
    sheet
  }

  private def getSheetOrThrow(sheetIdx: Int, workbook: XSSFWorkbook) = {
    try {
      workbook.getSheetAt(sheetIdx)
    } catch {
      case _: IllegalArgumentException => throw new ExcelSheetNotFoundException(sheetIdx)
    }
  }

  private def getInCol(sheet: XSSFSheet, col: Int, start: Int, end: Int): Seq[SpreadsheetCell] =
    (start to end).map(i => {
      val row = sheet.getRow(i)
      val cell = if (row != null) {
        row.getCell(col)
      } else {
        null
      }
      val formula = if (cell.getCellType == CellType.FORMULA) cell.getCellFormula else ""
      val res = if (cell == null) {
        ""
      } else {
        cell.getCellType match {
          case CellType.FORMULA => try {
            germanFormat.format(cell.getNumericCellValue)
          } catch {
            case _: IllegalStateException => try {
              cell.getStringCellValue
            } catch {
              case _: IllegalStateException =>
                throw new Exception(i, col, cell.getErrorCellString)
            }
          }
          case CellType.NUMERIC => germanFormat.format(cell.getNumericCellValue)
          case CellType.STRING => cell.getStringCellValue
          case _ => ""
        }

      }
      SpreadsheetCell(res, cell.getReference)
    })

  private def setCells(workbook: XSSFWorkbook, changeFields: List[ExcelMediaInformationChange]): Unit = {
    changeFields.foreach(f => {
      val sheet = workbook.getSheetAt(f.sheetIdx)
      f.newValue.toDoubleOption match {
        case Some(v) => this.getCell(sheet, f.cell).setCellValue(v)
        case _ => this.getCell(sheet, f.cell).setCellValue(f.newValue)
      }
    })
  }

  private def parseCellRange(range: String): (Cords, Cords) = {
    val split = range.split(':')
    if (split.length != 2) {
      throw new IllegalArgumentException("expected range to have 2 components got " + split.length)
    }
    (this.parseCellAddress(split(0)), this.parseCellAddress(split(1)))
  }

  private val regexp = new Regex("([A-Za-z]+)(\\d+)")

  private def parseCellAddress(address: String): Cords = {
    val m = regexp.findFirstMatchIn(address.toUpperCase) match {
      case Some(m) => m
      case _ => throw new IllegalArgumentException(s"$address is not a valid cell address")
    }
    Cords(Integer.parseInt(m.group(2)) - 1, colToInt(m.group(1)) - 1)
  }

  private def colToInt(col: String): Int = {
    col.toUpperCase.foldLeft(0) { (result, char) =>
      result * 26 + (char - 'A' + 1)
    }
  }

  private def getCell(sheet: XSSFSheet, cell: String) = {
    val cords = this.parseCellAddress(cell)
    val col = sheet.getRow(cords.row).getCell(cords.col)
    if (col == null) throw new Exception(cords.row, cords.col, s"Cell '$cell' Not Found")

    col
  }

  private val germanFormat = NumberFormat.getNumberInstance(Locale.GERMAN)

  def levenshteinDistance(s1: String, s2: String): Int = {
    val lowerS1 = s1.toLowerCase
    val lowerS2 = s2.toLowerCase
    val m = lowerS1.length
    val n = lowerS2.length
    val dp = Array.ofDim[Int](m + 1, n + 1)

    for (i <- 0 to m) {
      dp(i)(0) = i
    }
    for (j <- 0 to n) {
      dp(0)(j) = j
    }
    for (i <- 1 to m; j <- 1 to n) {
      val substitutionCost = if (lowerS1(i - 1) == lowerS2(j - 1)) 0 else 1
      dp(i)(j) = Seq(
        dp(i - 1)(j) + 1, // deletion
        dp(i)(j - 1) + 1, // insertion
        dp(i - 1)(j - 1) + substitutionCost
      ).min
    }

    dp(m)(n)
  }

  def findMostSimilarKeyword(input: String, keywordList: List[String]): String = {
    val exactMatch = keywordList.find(keyword => keyword.equalsIgnoreCase(input))
    if (exactMatch.isDefined) {
      exactMatch.get
    } else {
      val distances = keywordList.map(keyword => (keyword, levenshteinDistance(input, keyword)))
      val minDistance = distances.minBy(_._2)._2
      val closestKeywords = distances.filter(_._2 == minDistance)
      val (closestKeyword, _) = closestKeywords.minBy(_._1.length)
      closestKeyword
    }
  }


  // List of all Excel supported functions
  val functionNames = FunctionEval.getSupportedFunctionNames.asScala.toList
  val testInputs = List("VERGE")

  testInputs.foreach { input =>
    if (!functionNames.contains(input)) {
      val closestKeyword = findMostSimilarKeyword(input, functionNames)

    }
  }


  /**
   * @param row     the row where the errror occured
   * @param col     the col where the error occured
   * @param message the error returned by the spreadsheet
   */
  class Exception(row: Int, col: Int, message: String) extends RuntimeException("SpreadsheetException@" + row.toString + "," + col.toString + ": " + message)

  case class sheetCell(formula: String, value: String, reference: String)

}