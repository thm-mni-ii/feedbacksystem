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

factor      : '(' ' '* expr ' '* ')'
            |   (NUMBER|VAR)
            ;


NUMBER: FULL DECIMAL?;
FULL: [0-9]+;
DECIMAL: ',' FULL;

VAR: [a-z];

ADD: '+';
SUB: '-';
MUL: '*';
DIV: '/';
MOD: '%';
EXP: '^';
SQR: 'sqrt';
LB: 'lb'|'ld';
LN: 'ln';
LG: 'lg';
RAD: 'rad';
LOG: 'log';
