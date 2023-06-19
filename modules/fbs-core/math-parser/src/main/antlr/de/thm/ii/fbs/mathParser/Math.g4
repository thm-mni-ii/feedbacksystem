grammar Math;

expr        : expr ' '* (ADD|SUB) ' '* term
            | term
            ;

term        : term ' '* (MUL|DIV|MOD) ' '* funct
            | funct
            ;

funct       : (SQRT|LB|LN|LG) OPENING_CURLY_BRACKET expr CLOSING_CURLY_BRACKET
            | (FRAC|RAD|LOG) OPENING_CURLY_BRACKET expr CLOSING_CURLY_BRACKET OPENING_CURLY_BRACKET expr CLOSING_CURLY_BRACKET
            | SQRT OPENING_SQUARE_BRACKET expr CLOSING_SQUARE_BRACKET OPENING_CURLY_BRACKET expr CLOSING_CURLY_BRACKET
            | unary
            ;

unary       : SUB? mulFactor
            ;

mulFactor   : expo // higher presedence!
            | mulFactor ' '* expo
            ;

expo        : expo ' '* EXP ' '*  SUB? factor
            | factor
            ;

factor      : OPENING_ROUND_BRACKET ' '* expr ' '* CLOSING_ROUND_BRACKET
            | OPENING_CURLY_BRACKET ' '* expr ' '* CLOSING_CURLY_BRACKET
            | (NUMBER|VAR)
            ;


NUMBER: FULL DECIMAL?;
FULL: [0-9]+;
DECIMAL: DECIMAL_SEPARATOR FULL;

VAR: [a-z];

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
OPENING_SQUARE_BRACKET: '[';
CLOSING_SQUARE_BRACKET: ']';
