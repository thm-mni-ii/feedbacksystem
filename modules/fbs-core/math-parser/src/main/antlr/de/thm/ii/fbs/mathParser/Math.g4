grammar Math;

expr        : (RAD|LOG) ' '* expr ' '+ expr
            | expr ' '* (ADD|SUB) ' '* term
            | term
            ;

term        : term ' '* (MUL|DIV|MOD) ' '* funct
            | funct
            ;

funct       : (SQR|LB|LN|LG) ' '* funct
            | unary
            ;

unary       : SUB? mulFactor
            ;

mulFactor   : expo // higher presedence!
            | mulFactor ' '* expo
            ;

expo        : expo ' '* EXP ' '* SUB? factor
            | factor
            ;

factor      : OPENING_BRACKET ' '* expr ' '* CLOSING_BRACKET
            |   (NUMBER|VAR)
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
SQR: 'sqrt' | '\\sqrt';
LB: 'lb'|'ld'|'\\lb'|'\\ld';
LN: 'ln'|'\\ln';
LG: 'lg'|'\\lg';
RAD: 'rad'|'\\rad';
LOG: 'log'|'\\log';
DECIMAL_SEPARATOR: ','|'{,}';
OPENING_BRACKET: '(' | '{';
CLOSING_BRACKET: ')' | '}';
