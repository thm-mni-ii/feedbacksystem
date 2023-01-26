grammar Math;
expr:   (SQR|LB|LN|LG) ' '* expr
    |   (RAD|LOG) ' '* expr ' '+ expr
    |   expr ' '* EXP ' '* expr
    |   expr ' '* mul ' '* expr
    |   expr ' '* DIV ' '* expr
    |   expr ' '* ADD ' '* expr
    |   expr ' '* SUB ' '* expr
    |   (NUMBER|VAR)
    |   '(' ' '* expr ' '* ')'
    ;

mul: MUL?;

NUMBER: SUB? FULL DECIMAL?;
FULL: [0-9]+;
DECIMAL: ',' FULL;

VAR: [a-z];

ADD: '+';
SUB: '-';
MUL: '*';
DIV: '/';
EXP: '^';
SQR: 'sqrt';
LB: 'lb'|'ld';
LN: 'ln';
LG: 'lg';
RAD: 'rad';
LOG: 'log';
