grammar Math;
expr: (SQRT|LOGS) ' '? expr
    |   expr EXP expr
    |   expr (MUL|DIV) expr
    |   expr (ADD|SUB) expr
    |   NUMBER
    |   '(' expr ')'
    ;

NUMBER: FULL DECIMAL?;
FULL: [0-9]+;
DECIMAL: ',' FULL;

ADD: '+';
SUB: '-';
MUL: '*';
DIV: '/';
EXP: '^';
SQRT: 'sqrt';
LOGS: (LB|LN|LG);
LB: 'lb';
LN: 'ln';
LG: 'lg';
