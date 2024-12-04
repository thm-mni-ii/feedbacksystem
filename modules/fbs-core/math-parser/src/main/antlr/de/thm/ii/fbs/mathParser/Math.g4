grammar Math;

eq          : eq ' '* EQUAL ' '* expr
            | expr
            ;

expr        : expr ' '* (ADD|SUB) ' '* term
            | term
            ;

term        : term ' '* (MUL|DIV|MOD) ' '* unary
            | unary
            ;

unary       : SUB? funct
            ;

funct       : (SQRT|LB|LN|LG) OPENING_CURLY_BRACKET expr CLOSING_CURLY_BRACKET
            | (FRAC|RAD|LOG) OPENING_CURLY_BRACKET expr CLOSING_CURLY_BRACKET OPENING_CURLY_BRACKET expr CLOSING_CURLY_BRACKET
            | SQRT OPENING_SQUARE_BRACKET expr CLOSING_SQUARE_BRACKET OPENING_CURLY_BRACKET expr CLOSING_CURLY_BRACKET
            | mulFactor
            ;

mulFactor   : expo // higher presedence!
            | mulFactor ' '* expo
            ;

expo        : expo ' '* EXP ' '* SUB? factor
            | expo unicode_expo
            | factor
            ;

factor      : LEFT? OPENING_ROUND_BRACKET ' '* expr ' '* RIGHT? CLOSING_ROUND_BRACKET
            | OPENING_CURLY_BRACKET ' '* expr ' '* CLOSING_CURLY_BRACKET
            | EMPTY_CURLY_BRACKETS
            | (NUMBER|VAR)
            ;

unicode_expo   : UNICODE_EXPO+
            ;

NUMBER: FULL DECIMAL?;
FULL: [0-9]+;
DECIMAL: DECIMAL_SEPARATOR FULL;

VAR: [a-z];

EQUAL: '=';
ADD: '+';
SUB: '-';
MUL: '*'|'\\cdot';
DIV: '/';
MOD: '%';
EXP: '^';
SQRT: '\\sqrt';
FRAC: '\\frac';
LB: '\\lb'|'\\ld';
LN: '\\ln';
LG: '\\lg';
RAD: '\\rad';
LOG: '\\log';
DECIMAL_SEPARATOR: ','|'{,}';
OPENING_ROUND_BRACKET: '(';
CLOSING_ROUND_BRACKET: ')';
OPENING_CURLY_BRACKET: '{';
CLOSING_CURLY_BRACKET: '}';
EMPTY_CURLY_BRACKETS: '{}';
OPENING_SQUARE_BRACKET: '[';
CLOSING_SQUARE_BRACKET: ']';
LEFT: '\\left';
RIGHT: '\\right';
UNICODE_EXPO: '⁰'|'¹'|'²'|'³'|'⁴'|'⁵'|'⁶'|'⁷'|'⁸'|'⁹';
