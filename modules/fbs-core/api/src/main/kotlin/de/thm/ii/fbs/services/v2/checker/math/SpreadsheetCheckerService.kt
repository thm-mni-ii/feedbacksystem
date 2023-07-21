package de.thm.ii.fbs.services.v2.checker.math

import com.fasterxml.jackson.databind.json.JsonMapper
import de.thm.ii.fbs.mathParser.MathParserHelper
import de.thm.ii.fbs.mathParser.SemanticAstComparator
import de.thm.ii.fbs.model.v2.CheckrunnerConfiguration
import de.thm.ii.fbs.model.v2.SpreadsheetMediaInformation
import de.thm.ii.fbs.model.v2.Submission
import de.thm.ii.fbs.services.v2.checker.trait.CheckerService
import de.thm.ii.fbs.services.v2.persistence.TaskService
import de.thm.ii.fbs.util.Hash
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import scala.collection.Seq
import java.io.File
import java.math.BigDecimal
import java.math.RoundingMode
import java.text.NumberFormat
import java.text.ParsePosition
import java.util.Locale
import java.util.Optional
/**
 * A Spreadsheet Checker
 */
@Service
class SpreadsheetCheckerService: CheckerService() {
    private val logger: Logger = LoggerFactory.getLogger(this.javaClass)

    @Autowired
    lateinit var taskService: TaskService
    @Autowired
    private val submissionService: SubmissionService = null
    @Autowired
    lateinit var spreadsheetService: SpreadsheetService
    @Autowired
    private val spreadsheetFileService: SpreadsheetFileService = null
    @Autowired
    private val subTaskService: CheckrunnerSubTaskService = null

    /**
     * Handles the submission notification
     *
     * @param taskID       the taskID for the submission
     * @param submissionID the id of the sumission
     * @param cc           the check runner of the sumission
     * @param fu           the user which triggered the sumission
     */
    override fun notify(taskID: Int, submissionID: Int, cc: CheckrunnerConfiguration, fu: User): Unit {
        val task = taskService.getOne(taskID)
        val spreadsheetMediaInformation = task?.mediaInformation?.asInstanceOf[SpreadsheetMediaInformation]
        val submission = this.submissionService.getOne(submissionID, fu.id).get

        val fields = this.getFields(cc, spreadsheetMediaInformation, fu.username, spreadsheetMediaInformation.outputFields)
        val pointFields = spreadsheetMediaInformation.pointFields.map(pointsFields => this.getFields(cc, spreadsheetMediaInformation, fu.username, pointsFields))
        val submittedFields = this.getSubmittedFields(submission)

        val (correctCount, results) = this.check(fields, submittedFields, spreadsheetMediaInformation.decimals)

        val exitCode = if (correctCount == fields.length()) {
            0
        } else {
            1
        }
        val resultText = this.generateResultText(results)

        val extInfo = JsonMapper().writeValueAsString(submittedFields)
        submissionService.storeResult(submission.id, cc.id, exitCode, resultText, extInfo)
        this.submittSubTasks(cc.id, submissionID, results, pointFields)
    }

    private fun getFields(cc: CheckrunnerConfiguration, spreadsheetMediaInformation: SpreadsheetMediaInformation
            , username: String, fields: String): Seq<(String, String)>  {
        val spreadsheetFile: File = spreadsheetFileService.getMainFile(cc)

        val userID = Hash.decimalHash(username).abs().toString().slice( IntRange(0, 7))

        val field = spreadsheetService.getFields(spreadsheetFile, spreadsheetMediaInformation.idField, userID, fields)
        spreadsheetFileService.cleanup(cc.isInBlockStorage, spreadsheetFile)
        return field
    }

    private fun getSubmittedFields(submission: Submission): UtilMap<String, String> = {
        val submissionFile = spreadsheetFileService.getSubmissionFile(submission)

        val mapper = JsonMapper()
        val resultFields = mapper.readValue(submissionFile, classOf[UtilMap[String, String]])
        spreadsheetFileService.cleanup(submission.isInBlockStorage, submissionFile)
        resultFields
    }

    fun check(fields: Seq<String>, submittedFields: UtilMap<String, String>, decimals: Int): (Int, Seq<CheckResult>) {
        var result = mutable.ListBuffer[CheckResult]()
        var correctCount = 0

        for ((key, value) <- fields) {
        val enteredValue = submittedFields.get(key)
        var correct = false
        try {
            if (enteredValue != null && compare(enteredValue, value, decimals)) {
                correct = true
                correctCount += 1
            }
        } catch {
            case e: MathParserException => logger.error(e.toString) // TODO: give feedback about error to user
        }
        result = result.appended(CheckResult(key, value, enteredValue, correct))
    }

        (correctCount, result.toList)
    }

    private fun generateResultText(results: Seq<CheckResult>): String {
        val count = results.size()
        val correct = results.foldLeft(0,((acc: Int, result: CheckResult) => if (result.correct) {
        acc + 1
    } else {
        acc
    })

        s"$correct von $count Eingaben richtig."
    }

    private fun submittSubTasks(configurationId: Int, submissionId: Int, results: Seq<CheckResult>, points: Optional<Seq<String>>) {
        val pointsMap = points
        results.foreach {
            val maxPoints = pointsMap.flatMap{ it.get(key) }(pm => pm.get(key)).flatMap(str => str.toFloatOption).map(flo => flo.toInt)
            .getOrElse(1)
            val points = if (correct) {
                maxPoints
            } else {
                0
            }

            val subTask = subTaskService.getOrCrate(configurationId, key, maxPoints)
            subTaskService.createResult(configurationId, subTask.subTaskId, submissionId, points)
        }
        for (CheckResult(key, _, _, correct) <- results) {
        val maxPoints = pointsMap.flatMap(pm => pm.get(key))
        .flatMap(str => str.toFloatOption).map(flo => flo.toInt)
        .getOrElse(1)
        val points = if (correct) {
            maxPoints
        } else {
            0
        }

        val subTask = subTaskService.getOrCrate(configurationId, key, maxPoints)
        subTaskService.createResult(configurationId, subTask.subTaskId, submissionId, points)
    }
    }

    fun compare(enteredValue: String, value: String, decimals: Int): Boolean {
        val enteredAst = MathParserHelper.parse(enteredValue)
        val valueAst = MathParserHelper.parse(value)
        SemanticAstComparator.Builder()
                .decimals(decimals)
                .roundingMode(RoundingMode.HALF_UP)
                .ignoreNeutralElements(true)
                .applyInverseElements(true)
                .applyCommutativeLaw(true)
                .build()
                .compare(valueAst, enteredAst)
    }

    private fun round(input: Double, toDecimals: Int): String {
        return BigDecimal(input).setScale(toDecimals, RoundingMode.HALF_UP).toString()
    }

    private fun parseDouble(input: String, format: NumberFormat): Double? {
        val position = ParsePosition(0)
        val parsed = format.parse(input, position)
            // Check if full string is parsed and return None for invalid input
            return if (position.index == input.length) {
                parsed.toDouble()
            } else {
                null
            }
        }

    private val germanFormat = NumberFormat.getNumberInstance(Locale.GERMAN)

    data class CheckResult(val name: String, val expected: String, val entered: String, val correct: Boolean)
}

