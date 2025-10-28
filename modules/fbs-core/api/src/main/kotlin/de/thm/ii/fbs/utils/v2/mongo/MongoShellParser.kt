package de.thm.ii.fbs.utils.v2.mongo

import org.bson.Document

data class ParsedMongoShellCommand(
    val operation: String,
    val collection: String? = null,
    val document: Document? = null,
    val filter: Document? = null,
    val update: Document? = null,
    val pipeline: List<Document>? = null
)

object MongoShellParser {
    private val shellRegex = Regex("""db\.(\w+)\.(\w+)\(([\s\S]*)\)""", RegexOption.IGNORE_CASE)
    private val createViewRegex = Regex("""db\.createView\(([\s\S]+)\)""", RegexOption.IGNORE_CASE)
    private val splitRegex = Regex("""[\n;]""")

    fun batchParse(commands: String): List<ParsedMongoShellCommand> =
        commands.split(splitRegex). filter { cmd -> cmd.trim() != "" }.map { cmd -> parse(cmd) }

    fun parse(command: String): ParsedMongoShellCommand {
        val trimmed = command.trim()

        if (trimmed.lowercase() == "show collections") {
            return ParsedMongoShellCommand("showCollections")
        }

        val createViewMatch = createViewRegex.find(trimmed)
        if (createViewMatch != null) {
            val args = splitJsonArgs(createViewMatch.groupValues[1], 3)
            val viewName = args[0].trim().removeSurrounding("\"", "\"")
            val source = args[1].trim().removeSurrounding("\"", "\"")

            val json = "{\"pipeline\": ${args[2].trim()} }"
            val doc = Document.parse(json)
            val rawPipeline = doc["pipeline"] as? List<*>
                ?: throw IllegalArgumentException("Pipeline must be a list.")

            val pipeline = rawPipeline.map {
                if (it !is Document) {
                    throw IllegalArgumentException("Pipeline stage is not a Document.")
                }
                it
            }

            return ParsedMongoShellCommand(
                operation = "createView",
                collection = viewName,
                document = Document("source", source),
                pipeline = pipeline
            )
        }

        val match = shellRegex.find(trimmed)
            ?: throw IllegalArgumentException("Invalid mongo shell command: $command")

        val (collection, operation, args) = match.destructured

        return when (operation) {
            "find" -> ParsedMongoShellCommand(
                operation = "find",
                collection = collection,
                filter =
                if (args.isBlank()) {
                    Document()
                } else {
                    Document.parse(args)
                }
            )

            "insert" -> {
                val parsed = Document.parse("{ temp: $args }")["temp"]
                return if (parsed is List<*>) {
                    ParsedMongoShellCommand(
                        operation = "insertMany",
                        collection = collection,
                        pipeline = parsed.map { it as Document }
                    )
                } else {
                    ParsedMongoShellCommand(
                        operation = "insert",
                        collection = collection,
                        document = parsed as Document
                    )
                }
            }

            "insertMany" -> {
                val parsed = Document.parse("{ temp: $args }")["temp"]

                if (parsed !is List<*>) {
                    throw UnsupportedOperationException("$operation is only supported with arguments as list")
                }
                return ParsedMongoShellCommand(
                    operation = "insertMany",
                    collection = collection,
                    pipeline = parsed.map { it as Document }
                )
            }

            "update" -> {
                val args = splitJsonArgs(args, 2)
                ParsedMongoShellCommand(
                    operation = "update",
                    collection = collection,
                    filter = Document.parse(args[0]),
                    update = Document.parse(args[1])
                )
            }

            "delete" -> ParsedMongoShellCommand(
                operation = "deleteMany",
                collection = collection,
                filter = Document.parse(args)
            )

            "deleteOne" -> ParsedMongoShellCommand(
                operation = "deleteOne",
                collection = collection,
                filter = Document.parse(args)
            )

            "aggregate" -> {
                val full = "{pipeline: $args}"
                val doc = Document.parse(full)

                @Suppress("UNCHECKED_CAST")
                val pipeline = doc["pipeline"] as? List<Document>
                    ?: throw IllegalArgumentException("Invalid mongo shell aggregate command: $command")

                ParsedMongoShellCommand(
                    operation = "aggregate",
                    collection = collection,
                    pipeline = pipeline
                )
            }

            "createIndex" -> ParsedMongoShellCommand(
                operation = "createIndex",
                collection = collection,
                document = Document.parse(args)
            )

            "dropIndex" -> {
                val indexName = args.trim().removeSurrounding("\"", "\"").removeSurrounding("'", "'")
                ParsedMongoShellCommand(
                    operation = "dropIndex",
                    collection = collection,
                    document = Document("indexName", indexName)
                )
            }

            "countDocuments" -> ParsedMongoShellCommand(
                operation = "countDocuments",
                collection = collection,
                filter =
                if (args.isBlank()) {
                    Document()
                } else {
                    Document.parse(args)
                }
            )

            "drop" -> ParsedMongoShellCommand(
                operation = "dropCollection",
                collection = collection
            )

            else -> throw UnsupportedOperationException("Unsupported mongo shell operation: $operation")
        }
    }

    private fun splitJsonArgs(input: String, expected: Int): List<String> {
        val parts = mutableListOf<String>()
        var depthCurly = 0
        var depthSquare = 0
        var current = StringBuilder()
        val chars = input.trim()

        for (i in chars.indices) {
            val c = chars[i]

            when (c) {
                '{' -> {
                    depthCurly++
                    current.append(c)
                }
                '}' -> {
                    depthCurly--
                    current.append(c)
                }
                '[' -> {
                    depthSquare++
                    current.append(c)
                }
                ']' -> {
                    depthSquare--
                    current.append(c)
                }
                ',' -> {
                    if (depthCurly == 0 && depthSquare == 0 && parts.size < expected - 1) {
                        parts.add(current.toString().trim())
                        current = StringBuilder()
                    } else {
                        current.append(c)
                    }
                }
                else -> current.append(c)
            }
        }

        if (current.isNotEmpty()) {
            parts.add(current.toString().trim())
        }

        if (parts.size != expected) {
            throw IllegalArgumentException("Invalid mongo shell command (expected $expected parts): $input")
        }

        return parts
    }
}
