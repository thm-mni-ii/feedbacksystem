# BASIC SQL KEYWORDS
DISTINCT = "DISTINCT"
FROM = "FROM"
TABLE = "TABLE"
ALIAS = "ALIAS"
ON = "ON"
WHERE = "WHERE"
GROUP_BY = "GROUP BY"
HAVING = "HAVING"
ORDER_BY = "ORDER BY"
DESC = r'(?i)DESC'
ASC = r'(?i)ASC'
KEYWORD = "KEYWORD"
COMMAND = "COMMAND"

# SELECT COMMANDS
SELECT_CMDS = [
    "SUM",
    "COUNT",
    "ROUND",
    "SEC_TO_TIME",
    "AVG",
    "MAX",
    "MIN",
    "ABS",
    "TIME_TO_SEC",
    "YEAR",
    "UPPER",
    "LOWER",
    "LENGTH"
]

# JOIN TYPES
JOIN_TYPES = [
    "INNER JOIN",
    "LEFT JOIN",
    "RIGHT JOIN",
    "FULL JOIN",
    "SELF JOIN",
    "JOIN"
]

# REGULAR EXPRESSIONS
ALIAS_REGEX = r"\sas\s+\"(.+?)\"|\sas\s+(\w+)"
DB_NAME_REGEX = r"^[^.]+\.(.*)$"
DB_COMP_REGEX = r'(\s*(?:<=|>=|!=|=|<|>)\s*)'
MATH_EXP_REGEX = r"[\d()+\-*\/]"
EQ_COMP_REGEX = r'\s*\w+\s*=\s*\w+\s*'


# MULTIPLIERS
ORDER_MULT = 5
STRUCT_MULT = 20
OBJECT_MULT = 50
