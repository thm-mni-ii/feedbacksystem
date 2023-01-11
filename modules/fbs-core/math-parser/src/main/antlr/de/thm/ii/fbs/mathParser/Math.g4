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

NUMBER: FULL DECIMAL?;
FULL: [0-9]+;
DECIMAL: ',' FULL;

VAR: [a-z];

ADD: '+';
SUB: '-';
MUL: '*';
DIV: '/';
EXP: '^';
SQR: 'sqrt';
LB: 'lb';
LN: 'ln';
LG: 'lg';
RAD: 'rad';
LOG: 'log';
