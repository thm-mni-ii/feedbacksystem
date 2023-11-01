package de.thm.ii.fbs.services.checker.excel
import scala.collection.JavaConverters._
import de.thm.ii.fbs.model.checker.excel.SpreadsheetCell
import de.thm.ii.fbs.model.{ExcelMediaInformation, ExcelMediaInformationChange, ExcelMediaInformationCheck, ExcelMediaInformationTasks}
import org.apache.poi.ss.usermodel.{Cell, CellType, FormulaEvaluator, WorkbookFactory}
import org.apache.poi.xssf.usermodel.{XSSFFormulaEvaluator, XSSFSheet, XSSFWorkbook}
import org.springframework.stereotype.Service
import org.apache.poi.ss.formula.WorkbookEvaluator
import org.apache.poi.ss.formula.eval.FunctionEval

import scala.collection.mutable.{ArrayBuffer, ListBuffer}
import java.io.{File, FileInputStream}
import java.text.NumberFormat
import java.util.Locale
import scala.util.matching.Regex
import org.matheclipse.core.eval.ExprEvaluator
import org.matheclipse.core.expression.F
import org.matheclipse.core.interfaces.IAST
import org.matheclipse.core.interfaces.IExpr
import org.matheclipse.core.interfaces.ISymbol
import org.matheclipse.parser.client.SyntaxError
import org.matheclipse.parser.client.math.MathException

import scala.collection.convert.ImplicitConversions.`collection AsScalaIterable`
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
    //print(getFormula(sheet, end.col, start.row, end.row))
    val values = this.getInCol(sheet, end.col, start.row, end.row)

    values
  }

  def getFormula(spreadsheet: File, excelMediaInformation: ExcelMediaInformation, checkFields: ExcelMediaInformationCheck): Seq[sheetCell] = {
    val sheet = this.initSheet(spreadsheet, excelMediaInformation)
    val (start, end) = this.parseCellRange(checkFields.range)
    //print(getFormula(sheet, end.col, start.row, end.row))
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
           //print("this is the cellval : ", cell.getNumericCellValue.toString, "\n")
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

  def compareForm(seq1: Seq[sheetCell], seq2: Seq[sheetCell], invalidFields: List[String]): (String, List[String]) = {
    print("here the compareform was entered \n")
    val util = new ExprEvaluator(false, 100)
    var isFunc = false
    val stringBuilder = new StringBuilder()
    var updatedInvalidFields = invalidFields
    var differentVals = List[String]()
    for ((cell1, cell2) <- seq1.zip(seq2)) {
        //normalize the formulas using the eval function
        val result1 = util.eval(cell1.formula)
        val result2 = util.eval(cell2.formula)
      print(f"the formula of the teacher : ${cell1.reference}  ${cell1.formula}\n")
      print(f"the formula of the student : ${cell2.reference}  ${cell2.formula}\n")
        if(cell1.value != cell2.value){
          differentVals = differentVals :+ cell1.reference
        }
      print(s"the list of unmatching values ---> ${differentVals} \n")
        print(f"====>Normalised-teacher-formula := ${result1} --- Normalised-Student-Formula := ${result2}" +
          f" \n====>teacher-formula := ${cell1.formula} --- Student-formula := ${cell2.formula} \n")
        print(f"the test of results : ", result1 == result2, "\n")
        var tokens1 = tokenizeFormula(cell1.formula)
        var tokens2 = tokenizeFormula(cell2.formula)
        print(f"token2 here :${tokens2} \n")
        if (tokens2.exists { case ("function", _) => true; case _ => false }) {
          isFunc = true
          print(s"${cell2.reference} this token contains a func \n")
          print(f"if func: was entered ${cell2.reference}===> its tokens : {${tokens2}}\n ")
          if (containsReferenceWithColon(tokens2).isDefined) {
            containsReferenceWithColon(tokens2) match {
              case Some((ref1, ref2)) =>
                print(s"containsRef References found: $ref1 : $ref2 \n")
              val refs = printCellsInRange(f"${ref1}:${ref2}")
                print(s"this is the extended refs ${refs} \n")
                // Check if any of the strings in refs exist in updatedInvalidFields
                val commonRefs = refs.filter(updatedInvalidFields.contains)
               //test unmatching refs
                print(s"the tokens1 check : ${tokens1} \n")
                // Extract references from tokens1 and refs
                val refsInTokens1 = tokens1.collect { case ("reference", ref) => ref }
                val refsInRefs = refs

                // Find missing and excessive references
                val missingRefs = refsInTokens1.diff(refsInRefs)
                val excessiveRefs = refsInRefs.diff(refsInTokens1)
                var differences = ""
                if (missingRefs.nonEmpty || excessiveRefs.nonEmpty) {
                  stringBuilder.append(s"+Zelle: ${cell1.reference} Die verwendeten Referenzen sind nicht korrekt \n")
                }
                // Print missing references
                if (missingRefs.nonEmpty) {
                  print("Missing references in refs:\n")
                  missingRefs.foreach { ref =>
                    differences = differences + ref
                  }
                  updatedInvalidFields = updatedInvalidFields :+ cell1.reference
                  stringBuilder.append(s" -Zelle: ${cell1.reference} Fehlende Referenz(en) ==>[ ${differences} ] \n")
                  print(s"Missing reference: $differences in refs \n")
                  differences = ""
                }

                // Print excessive references
                if (excessiveRefs.nonEmpty) {
                  print(" Excessive references in refs: \n")
                  excessiveRefs.foreach { ref =>
                    differences = differences + ref
                  }
                  updatedInvalidFields = updatedInvalidFields :+ cell1.reference
                  stringBuilder.append(s" -Zelle: ${cell1.reference} Exzessive Referenz(en) ==>[ ${differences} ] \n")
                  differences = ""
                }
                if (commonRefs.nonEmpty) {
                  updatedInvalidFields = updatedInvalidFields :+ cell1.reference
                  // Do something with commonRefs if needed
                  print("Common references found in updatedInvalidFields:\n")
                  stringBuilder.append(s" -Zelle: ${cell1.reference} Bitte korrigieren Sie zuerst die falschen Zellen  ==>[ ${commonRefs.mkString(", ")} ] \n")
                }
              case None =>
                print("Pattern not found.\n")
            }
          } else {
            print("Pattern not found.\n")
          }
        }
        else {
          print(f"else not func: was entered ${cell2.reference}\n")
          tokens1 = tokenizeFormula(result1.toString)
          tokens2 = tokenizeFormula(result2.toString)
        }


      if (tokens1 != tokens2 && isFunc == false) {
        print(f"else not equal: was entered ${cell2.reference}\n")
        /*
            if  cell1.getNumericCellValue.toString==cell2.getNumericCellValue.toString && category of token2 contains "function"
            then consider this correct and don t add it to the string builder
             */
        val diff = findTokenDifferences(tokens1, tokens2)
        if(diff.length>0) stringBuilder.append(s"+Zelle: ${cell1.reference} ==>[ ${diff} ] \n")

       // stringBuilder.append(s"Differences in tokens: $diff\n")

        // Append cell1.reference to updatedInvalidFields
        updatedInvalidFields = updatedInvalidFields :+ cell1.reference
      }
      //stringBuilder.append("\n")
        if (cell1.value != cell2.value) {
          print("there are unmatching values \n")
        }

        if (tokens2 == tokens1){
          print("there are matching cases \n")
        }

        if (cell1.value != cell2.value && tokens1 == tokens2) {
          print("true case here  \n")
        }
        print(s"#student-tokens : ${tokens2} \n#teacher-tokens : ${tokens1}  \n student-result: ${cell2.value} --- teacher-result: ${cell1.value}\n")

         if (tokens2 == tokens1){
           if (cell1.value != cell2.value){
          print(s"the last if was entered ===> ${tokens2} and \t ${cell2.value}")
        val matchingTuples: Seq[(String, String)] = tokens2.filter { case (_, value) =>
          updatedInvalidFields.contains(value)
        }
        print(s"this is the matching tuples ${matchingTuples} \n")
        if(matchingTuples.nonEmpty){
          stringBuilder.append(s"+Zelle: ${cell1.reference} ==> please correct the previous cells first ( ${matchingTuples} )\n")
        }
        else {
        //stringBuilder.append(s"+Zelle: ${cell1.reference} ==> hat nicht den richtigen Wert \n")
        }
      }
         }
       //print(s"tokens2 at the end ${tokens2} \n  tokens1 at the end ${tokens1}  \n cell1: ${cell1.value} --- cell2: ${cell2.value}\n")
        isFunc = false
      }


    (stringBuilder.toString(), updatedInvalidFields)
  }
  def containsReferenceWithColon(tokens: Seq[(String, String)]): Option[(String, String)] = {
    tokens.sliding(3).collectFirst {
      case Seq(("reference", ref1), ("operator", ":"), ("reference", ref2)) => (ref1, ref2)
    }
  }


  def findTokenDifferences(tokens1: Seq[(String, String)], tokens2: Seq[(String, String)]): String = {
    val diffBuilder = new StringBuilder()

    val minLength = math.min(tokens1.length, tokens2.length)
    for (i <- 0 until minLength) {
      val (category1, token1) = tokens1(i)
      val (category2, token2) = tokens2(i)

      if (category1 != category2 || token1 != token2) {
       // diffBuilder.append(s"Position $i: $category1='$token1' vs $category2='$token2'\n")
        diffBuilder.append(s"Ein $category2='$token2' ist nicht korrekt . benutze '$token1' stattdessen  ")


        /* if(category2=="function"){
           if (!functionNames.contains(token2)) {
             val closestKeyword = findMostSimilarKeyword(token2, functionNames)
             print(s"Did you mean $closestKeyword? \n")
           }
         }*/

      }
    }

    if (tokens1.length > tokens2.length) {
      for (i <- minLength until tokens1.length) {
        val (category, token) = tokens1(i)
       // diffBuilder.append(s"Position $i: $category='$token' vs -\n")
        if (category=="reference"){
        diffBuilder.append(s"\n -Ein $category='$token' fehlt")
        }
        }
    } else if (tokens2.length > tokens1.length) {
      for (i <- minLength until tokens2.length) {
        val (category, token) = tokens2(i)
        //diffBuilder.append(s"Position $i: - vs $category='$token'\n")
        diffBuilder.append(s"Ein $category='$token' ist nicht korrekt ")
      }
    }

    diffBuilder.toString()
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




  private def normalizeForm(formula: String): String = {
    // Normalize the formula by removing spaces and ensuring consistent order of constants
    val normalizedFormula = formula.replaceAll("\\s", "")
    val sortedConstants = normalizedFormula.split("[+-/*()]")
      .filter(_.nonEmpty)
      .sorted
      .mkString

    sortedConstants
  }

  def compareFormulas(solution: String, form: String): String = {
    // Extract variable names from the solution formula using regular expressions
    val solutionVariables = "\\b[A-Za-z]+\\d+\\b".r.findAllIn(solution).toSet

    // Extract variable names from the given formula
    val formVariables = "\\b[A-Za-z]+\\d+\\b".r.findAllIn(form).toSet

    // Check for missing variables in the given formula
    val missingVariables = solutionVariables.diff(formVariables)

    // Check for invalid constants in the given formula
    val invalidConstants = "\\d+".r.findAllIn(form).filterNot(constant => solution.contains(constant)).toSet

    // Prepare the result message
    val result =
      if (missingVariables.nonEmpty || invalidConstants.nonEmpty) {
        val missingVarsMsg = if (missingVariables.nonEmpty) s"Missing variables: ${missingVariables.mkString(", ")}\n" else ""
        val invalidConstantsMsg = if (invalidConstants.nonEmpty) s"Invalid constants: ${invalidConstants.mkString(", ")}\n" else ""
        s"$missingVarsMsg$invalidConstantsMsg"
      } else {
        "Formulas match."
      }

    result
  }

  val solution = "(C4+B4+D5)/2"
  val form = "(B4+4)/2"
  val result = compareFormulas(solution, form)
  print("here the the new compare :\n")
  print(result)
/*
  print("\n")
  private def findDifference(value1: String, value2: String): String = {
    val diffBuilder = new StringBuilder()

    val minLength = math.min(value1.length, value2.length)
    for (i <- 0 until minLength) {
      val char1 = value1.charAt(i)
      val char2 = value2.charAt(i)

      if (char1 != char2) {
        diffBuilder.append(s"Position $i: '$char1' vss '$char2'\n")
      }
    }

    if (value1.length > value2.length) {
      for (i <- minLength until value1.length) {
        diffBuilder.append(s"Position $i: '${value1.charAt(i)}' vs -\n")
      }
    } else if (value2.length > value1.length) {
      for (i <- minLength until value2.length) {
        diffBuilder.append(s"Position $i: - vs '${value2.charAt(i)}'\n")
      }
    }

    diffBuilder.toString()
  }
*/

  /**
   * Compares the formulas in the same cell reference between two Seq[SpreadsheetCell]
   * Prints the cell references where the formulas don't match
   *
   * @param cells1 Seq[SpreadsheetCell] representing the first set of cells
   * @param cells2 Seq[SpreadsheetCell] representing the second set of cells
   * @return true if the formulas match in the same cell reference, false otherwise
   */
    /**
  def compareFormulas(cells1: Seq[SpreadsheetCell], cells2: Seq[SpreadsheetCell]): Boolean = {
    val formulaPairs = cells1.zip(cells2).filter { case (cell1, cell2) =>
      cell1.reference == cell2.reference && cell1.value.trim.nonEmpty && cell2.value.trim.nonEmpty
    }

    val formulasMatch = formulaPairs.forall { case (cell1, cell2) =>
      val formula1 = cell1.value.trim
      val formula2 = cell2.value.trim
      val normalizedFormula1 = normalizeFormula(formula1)
      val normalizedFormula2 = normalizeFormula(formula2)
      normalizedFormula1 == normalizedFormula2
    }

    if (!formulasMatch) {
      formulaPairs.foreach { case (cell1, cell2) =>
        val formula1 = cell1.value.trim
        val formula2 = cell2.value.trim
        val normalizedFormula1 = normalizeFormula(formula1)
        val normalizedFormula2 = normalizeFormula(formula2)
        if (normalizedFormula1 != normalizedFormula2) {
          print(s"Formulas do not match in cell reference ${cell1.reference}: \n")
          print(s"Formula 1: $formula1 \n")
          print(s"Formula 2: $formula2 \n")
        }
      }
    }

    formulasMatch
  }
*/

      /*
  private def normalizeFormula(formula: String): String = {
    // Normalize the formula by removing leading and trailing whitespaces and converting to uppercase
    formula.trim.toUpperCase
  }
*/
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
      //print(s"Formula: $formula, Cell Reference: ${cell.getReference}")
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

  private val regexp = new Regex("([A-Z]+)(\\d+)")

  private def parseCellAddress(address: String): Cords = {
    val m = regexp.findFirstMatchIn(address) match {
      case Some(m) => m
      case _ => throw new IllegalArgumentException(address + " is not a valid cell address")
    }
    Cords(Integer.parseInt(m.group(2)) - 1, this.colToInt(m.group(1).charAt(0)) - 1)
  }

  private def colToInt(col: Char): Int =
    col.toInt - 64

  private def getCell(sheet: XSSFSheet, cell: String) = {
    val cords = this.parseCellAddress(cell)
    val col = sheet.getRow(cords.row).getCell(cords.col)
    if (col == null) throw new Exception(cords.row, cords.col, s"Cell '$cell' Not Found")

    col
  }

  private val germanFormat = NumberFormat.getNumberInstance(Locale.GERMAN)
  //val keywords = List("AVG", "SUM", "MUL", "OPER", "APPEND", "DELETE")

  def levenshteinDistance(s1: String, s2: String): Int = {
    val m = s1.length
    val n = s2.length
    val dp = Array.ofDim[Int](m + 1, n + 1)

    for (i <- 0 to m) {
      dp(i)(0) = i
    }
    for (j <- 0 to n) {
      dp(0)(j) = j
    }
    for (i <- 1 to m; j <- 1 to n) {
      val substitutionCost = if (s1(i - 1) == s2(j - 1)) 0 else 1
      dp(i)(j) = Seq(
        dp(i - 1)(j) + 1,     // deletion
        dp(i)(j - 1) + 1,     // insertion
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
      val (closestKeyword, _) = distances.minBy(_._2)
      closestKeyword
    }
  }



  // List of all Excel supported functions
  val functionNames = FunctionEval.getSupportedFunctionNames.asScala.toList
  //print(s"The list of keys: $functionNames \n")

  val testInputs = List("VERGE")

  testInputs.foreach { input =>
    print(f"Function inputted by the student: ${input} ")
    if (!functionNames.contains(input)) {
      val closestKeyword = findMostSimilarKeyword(input, functionNames)
      print(f"\n: ${input} ")
      print(s"Did you mean $closestKeyword? \n")
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
