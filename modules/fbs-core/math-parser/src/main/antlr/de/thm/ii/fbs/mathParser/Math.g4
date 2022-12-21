grammar Math;
expr: (SQR|LB|LN|LG) ' '* expr
    | (RAD|LOG) ' '* expr ' '+ expr
    |   expr ' '* EXP ' '* expr
    |   expr ' '* (MUL|DIV) ' '* expr
    |   expr ' '* (ADD|SUB) ' '* expr
    |   NUMBER
    |   '(' ' '* expr ' '* ')'
    ;

NUMBER: FULL DECIMAL?;
FULL: [0-9]+;
DECIMAL: ',' FULL;

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
