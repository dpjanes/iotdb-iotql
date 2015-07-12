/* description: Basic grammar that contains a nullable A nonterminal. */

%lex
%%  

\s+                     {/* skip whitespace */}
[-][-].*                   {/* skip comments */}
[-]?[0-9]+"."[0-9]+\b   return 'NUMBER'
[-]?[1-9][0-9]*\b       return 'INTEGER'
\"(\\.|[^"])*\"         return 'STRING'
\'(\\.|[^'])*\'         return 'STRING'
<<EOF>>                 return 'EOF'
";"                     return ';'
","                     return ','
"("                     return '('
")"                     return ')'
"["                     return '['
"]"                     return ']'
"id"                    return 'ID'
"SELECT"                return 'SELECT'
"AS"                    return 'AS'
"WHERE"                 return 'WHERE'
"SET"                   return 'SET'
"false"                 return 'BOOLEAN'
"true"                  return 'BOOLEAN'
"="                     return 'BI-OPERATOR'
"<"                     return 'BI-OPERATOR'
">"                     return 'BI-OPERATOR'
"<="                    return 'BI-OPERATOR'
">="                    return 'BI-OPERATOR'
[_a-zA-Z][-_a-zA-Z0-9]+([.][_a-zA-Z][-_a-zA-Z0-9]+)   return 'SYMBOL'
[_a-zA-Z][-_a-zA-Z0-9]+([.][*])   return 'SYMBOL-STAR'
[_a-zA-Z][-_a-zA-Z0-9]+   return 'SYMBOL-SIMPLE'
"*"                     return 'STAR';

    
/lex

%left BI-OPERATOR

%%

expressions: 
    EXPRESSION EOF
        {{ return $1; }}
    |
    EXPRESSION ";"
        {{ return $1; }}
    |
    EOF
        {{ return []; }}
    ;

EXPRESSION:
    /*
    EXPRESSION ";" ATOMIC
    { $1.push($3); $$ = $1; }
    |
    ATOMIC
    { $$ =  [ $1 ]; }
    |
    */
    "SELECT" SELECT-TERMS
    { $$ = [ { "select": $2 } ]; }
    ;

SELECT-TERMS:
    SELECT-TERMS "," SELECT-TERM
    { $1.push($3); $$ = $1; }
    |
    SELECT-TERM
    {{ $$ = [ $1 ]; }}
    ;

/*
 *  The way we we deal with functions needs to be 
 *  overhauled in the long run
 */
SELECT-TERM:
    D-SYMBOL
    {{ $$ = $1 }}
    |
    SYMBOL-SIMPLE "(" D-SYMBOL ")"
    {{ $3.function = $1; $$ = $3; }}
    |
    D-SYMBOL "AS" SYMBOL-SIMPLE
    {{ $1.column = $3; $$ = $1; }}
    |
    SYMBOL-SIMPLE "(" D-SYMBOL ")" "AS" SYMBOL-SIMPLE
    {{ $3.function = $1; $3.column = $6; $$ = $3; }}
    ;

/*
 *  "Dictionary" symbol - splitting up the symbol
 */
D-SYMBOL:
    |
    SYMBOL-STAR
    {{ $$ = {
        "band": $1.replace(/[.].*$/, ""),  
        "all": true,
        };
    }}
    |
    ID
    {{ $$ = { "id": true }; }}
    |
    STAR
    {{ $$ = { "all": true }; }}
    |
    VALUE
    ;

VALUE:
    LOGIC
    |
    LIST
    |
    ATOMIC
    ;

LOGIC:
    VALUE BI-OPERATOR VALUE
    {{ $$ = {  
            "compute": {
                "operation": $2,
                "operands": [ $1, $3 ],
            }
        };
    }}
    ;

LIST:
    "[" VALUES "]"
    {{
        $$ = {
            "value": $2
        }
    }}
    ;

VALUES:
    {{ $$ = []; }}
    |
    VALUE
    {{ $$ = [ $1 ]; }}
    |
    VALUE "," VALUES
    {{ $3.splice(0, 0, $1); $$ = $3; }}
    ;


ATOMIC:
    SYMBOL
    {{ $$ = {
        "band": $1.replace(/[.].*$/, ""),  
        "selector": $1.replace(/^[^.]*[.]/, ""),  
        };
    }}
    |
    INTEGER
    {{ $$ = { "value": Number.parseInt($1) }; }}
    |
    NUMBER
    {{ $$ = { "value": Number.parseFloat($1) }; }}
    |
    STRING
    {{ $$ = { "value": eval($1) }; }}
    |
    BOOLEAN
    {{ $$ = { "value": eval($1) }; }}
    ;
