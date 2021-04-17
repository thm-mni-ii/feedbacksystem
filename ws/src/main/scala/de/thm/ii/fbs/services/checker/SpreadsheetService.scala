package de.thm.ii.fbs.services.checker

import java.io.{File, FileInputStream}

import org.apache.poi.ss.usermodel.CellRange
import org.apache.poi.xssf.usermodel.{XSSFSheet, XSSFWorkbook}
import org.springframework.stereotype.Service

/**
  * A Spreadsheet Service
  */
@Service
class SpreadsheetService {
  private case class Cords(col: Int, row: Int)

  def initSheet(spreadsheet: File, userIDField: String, userID: String): XSSFSheet = {
    val input = new FileInputStream(spreadsheet)
    val workbook = new XSSFWorkbook(input)
    val sheet = workbook.getSheetAt(0)
    this.setCell(sheet, this.parseCellAddress(userIDField), userID)
    sheet
  }

  def getFields(spreadsheet: File, userIDField: String, userID: String, fields: String): Map[String, String] = {
    val sheet = this.initSheet(spreadsheet, userIDField, userID)
    val (start, end) = this.parseCellRange(fields)
    val labels = this.getInCol(sheet, start.row, start.col, end.col)
    val values = this.getInCol(sheet, end.row, start.col, end.col)
    labels.zip(values).toMap
  }

  private def getInCol(sheet: XSSFSheet, col: Int, start: Int, end: Int): Seq[String] =
    (start to end).map(i => sheet.getRow(i).getCell(col).getStringCellValue)

  private def setCell(sheet: XSSFSheet, cords: Cords, value: String): Unit = {
    sheet.getRow(cords.row).getCell(cords.col).setCellValue(value)
  }

  private def parseCellRange(range: String): (Cords, Cords) = {
    val split = range.split(':')
    if (split.length != 2) {
      throw new IllegalArgumentException("expected range to have 2 components got " + split.length)
    }
    (this.parseCellAddress(split(0)), this.parseCellAddress(split(1)))
  }

  private def parseCellAddress(address: String): Cords = {
    val charray = address.toCharArray
    if (charray.length != 2) {
      throw new IllegalArgumentException("expected cell address to have 2 characters got " + charray.length)
    }
    val col = charray(0)
    val row = charray(1)
    Cords(this.colToInt(col), Integer.parseInt(row.toString)-1)
  }

  private def colToInt(col: Char): Int =
    col.intValue - 64
}
