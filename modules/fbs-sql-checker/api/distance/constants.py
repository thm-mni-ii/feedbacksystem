# BASIC SQL KEYWORDS
DISTINCT = "distinct"
FROM = "from"
TABLE = "table"
ALIAS = "alias"
ON = "on"
WHERE = "where"
GROUP_BY = "group by"
HAVING = "having"
ORDER_BY = "order by"
DESC = r"(?i)desc"
ASC = r"(?i)asc"
BETWEEN = "between"
LIKE = "like"
NOT = "not"
IN = "in"
EXIST = "exist"
SELECT = "select"
AND = "and"
OR = "or"
NOT = "not"

# SELECT COMMANDS
SELECT_CMDS = [
    "sum",
    "count",
    "round",
    "avg",
    "max",
    "min",
    "abs",
    "year",
    "now",
    "upper",
    "lower",
    "length",
    "ceil",
    "floor",
    "power",
    "convert",
    "time_to_sec",
]

# JOIN TYPES
JOIN_TYPES = [
    "inner join",
    "left join",
    "right join",
    "full join",
    "self join",
    "natural join",
    "join",
]

# REGULAR EXPRESSIONS
ALIAS_REGEX = r"\sas\s+\"(.+?)\"|\sas\s+'(.+?)'|\sas\s+(\w+)"
MATH_EXP_REGEX = r"[\d()+\-*\/]"
EQ_COMP_REGEX = r"\s*(\w+|'\w+')\s*=\s*(\w+|'\w+')\s*"
FORMATTING_REGEX = r"[a-z]*\.|[\'\"\_\-\\\`]"
PARENTHESIS_REGEX = r"[()]"
BETWEEN_REGEX = r"([^\s]+)\s+between\s+([^\s]+)\s+and\s+([^\s]+)"
SYMBOL_REGEX = r"(\b\w+\b)\s*(?:>|<)\s*(\b\w+\b)"

# MULTIPLIERS
ORDER_MULT = 5
STRUCT_MULT = 25
OBJECT_MULT = 50

# LOG
FOLDER_PATH = "modules/fbs-sql-checker/api/distance/log"
LOG_PATH = "modules/fbs-sql-checker/api/distance/log/distance.txt"
