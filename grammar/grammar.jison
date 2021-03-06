%lex
%options case-insensitive
%%  

"CREATE"\s+"SCENE"      return 'CREATE-SCENE'
"CREATE"\s+"RULE"       return 'CREATE-RULE'
"CREATE"\s+"MODEL"      return 'CREATE-MODEL'
"CREATE"\s+"VIEW"       return 'CREATE-VIEW'
"CONNECT"\s+"MODEL"     return 'CONNECT-MODEL'
"CONNECT"\s+"ALL"       return 'CONNECT-ALL'
"USE"\s+"VIEW"          return 'USE-VIEW'
\s+                     {/* skip whitespace */}
[-][-].*                   {/* skip comments */}
0\b                     return 'NUMBER'
[-]?[0-9]+"."[0-9]+\b   return 'NUMBER'
[-]?[1-9][0-9]*\b       return 'INTEGER'
\"(\\.|[^"])*\"         return 'STRING'
\'(\\.|[^'])*\'         return 'STRING'
<<EOF>>                 return 'EOF'
":"                     return ':'
";"                     return ';'
","                     return ','
"("                     return '('
")"                     return ')'
"["                     return '['
"]"                     return ']'
"id"                    return 'ID'
"DO"                    return 'DO'
"NULL"                  return 'NULL'
"SELECT"                return 'SELECT'
"AS"                    return 'AS'
"WHERE"                 return 'WHERE'
"SET"                   return 'SET'
"UPDATE"                return 'UPDATE'
"FROM"                  return 'FROM'
"BEGIN"                 return 'BEGIN'
"END"                   return 'END'
"LET"                   return 'LET'
"WITH"                  return 'WITH'
"ATTRIBUTE"             return 'ATTRIBUTE'
"false"                 return 'BOOLEAN'
"true"                  return 'BOOLEAN'
"="                     return '='
"%"                     return 'DECORATOR'
"°C"                    return 'DECORATOR'
"°F"                    return 'DECORATOR'
"°K"                    return 'DECORATOR'
"&="                    return 'ASSIGN-OPERATOR'
"|="                    return 'ASSIGN-OPERATOR'
"!="                    return 'BI-OPERATOR'
"<="                    return 'BI-OPERATOR'
">="                    return 'BI-OPERATOR'
"<"                     return 'BI-OPERATOR'
">"                     return 'BI-OPERATOR'
"NOT IN"                return 'BI-OPERATOR'
"IN"                    return 'BI-OPERATOR'
"&"                     return 'BI-OPERATOR'
"|"                     return 'BI-OPERATOR'
"AND"                   return 'LOGIC-OPERATOR'
"OR"                    return 'LOGIC-OPERATOR'
"!"                     return 'LEFT-OPERATOR'
[$][_a-zA-Z][-_a-zA-Z0-9]*[$][_a-zA-Z][-_a-zA-Z0-9]*([:][_a-zA-Z][-_a-zA-Z0-9]*[:][_a-zA-Z][-_a-zA-Z0-9]+)   return 'VARIABLE'
[$][_a-zA-Z][-_a-zA-Z0-9]*[$][_a-zA-Z][-_a-zA-Z0-9]*[:]([_a-zA-Z][-_a-zA-Z0-9]*)([.][_a-zA-Z][-_a-zA-Z0-9]*)*   return 'VARIABLE'
[$][_a-zA-Z][-_a-zA-Z0-9]*[$]id return 'VARIABLE'
[_a-zA-Z][-_a-zA-Z0-9]*([:][_a-zA-Z][-_a-zA-Z0-9#]*[:][_a-zA-Z][-_a-zA-Z0-9#]+)   return 'SYMBOL'
[_a-zA-Z][-_a-zA-Z0-9]*[:]([_a-zA-Z][-_a-zA-Z0-9#]*)([.][_a-zA-Z][-_a-zA-Z0-9#]*)*   return 'SYMBOL'
[_a-zA-Z][-_a-zA-Z0-9]*([:][*])   return 'SYMBOL-STAR'
[_a-zA-Z][-_a-zA-Z0-9]*   return 'SYMBOL-SIMPLE'
[$][_a-zA-Z][-_a-zA-Z0-9]*   return 'VARIABLE'
"*"                     return 'STAR';

    
/lex

%left LOGIC-OPERATOR
%left BI-OPERATOR
%left "="
%left LEFT-OPERATOR
%right DECORATOR

%%

expressions: 
    EXPRESSION-LIST EOF
        {{
            return $$;
        }}
;

EXPRESSION-LIST:
    EXPRESSION ";" EXPRESSION-LIST
        {{ 
            $$ = $1.concat($3);
        }}
    |
    EXPRESSION 
        {{ 
            $$ = $1; 
        }}
    ;


EXPRESSION:
    "SELECT" SELECT-TERMS
    { $$ = [ { "select": $2, "store": "things" } ]; }
    |
    "SELECT" SELECT-TERMS "FROM" SYMBOL-SIMPLE
    { $$ = [ { "select": $2, "store": $4.toLowerCase() } ]; }
    |
    "SELECT" SELECT-TERMS "WHERE" VALUE
    { $$ = [ { "select": $2, "where": $4, "store": "things" } ]; }
    |
    "SELECT" SELECT-TERMS "FROM" SYMBOL-SIMPLE "WHERE" VALUE
    { $$ = [ { "select": $2, "store": $4.toLowerCase(), "where": $6 } ]; }
    |
    "SET" SET-TERMS
    { $$ = [ { "set": $2, "store": "things" } ]; }
    |
    "UPDATE" SYMBOL-SIMPLE "SET" SET-TERMS
    { $$ = [ { "set": $4, "store": $2.toLowerCase() } ]; }
    |
    "SET" SET-TERMS "WHERE" VALUE
    { $$ = [ { "set": $2, "where": $4, "store": "things" } ]; }
    |
    "UPDATE" SYMBOL-SIMPLE "SET" SET-TERMS "WHERE" VALUE
    { $$ = [ { "set": $4, "where": $6, "store": $2.toLowerCase() } ]; }
    |
    "DO" SYMBOL-SIMPLE
    {
        $$ = [
            {
                "do": $2.toLowerCase(),
                "module": "scene",
                "operands": [],
            }
        ];
    },
    |
    "DO" SYMBOL-SIMPLE "(" PARAMETERS ")"
    {{
        $$ = [
            {  
                "do": $2.toLowerCase(),
                "module": "scene",
                "operands": $4,
            }
        ];
    }}
    |
    "DO" SYMBOL
    {
        $2 = $2.toLowerCase();
        $$ = [
            {
                "do": $2.replace(/^[^.]*[:]/, ""),  
                "module": $2.replace(/[:].*$/, ""),  
                "operands": [],
            }
        ];
    },
    |
    "DO" SYMBOL "(" PARAMETERS ")"
    {{
        $2 = $2.toLowerCase();
        $$ = [
            {  
                "do": $2.replace(/^[^.]*[:]/, ""),  
                "module": $2.replace(/[:].*$/, ""),  
                "operands": $4,
            }
        ];
    }}
    |
    "CREATE-SCENE" SYMBOL-SIMPLE "BEGIN" EXPRESSION-LIST "END"
    { $$ = [
        {
            "create-scene": $2.toLowerCase(),
            "parameters": [],
            "begin-end": $4
        }
    ]; }
    |
    "CREATE-SCENE" SYMBOL-SIMPLE "(" SYMBOL-SIMPLE ")" "BEGIN" EXPRESSION-LIST "END"
    { $$ = [
        {
            "create-scene": $2.toLowerCase(),
            "parameters": [ { variable: $4 }, ],
            "begin-end": $7
        }
    ]; }
    |
    "LET" P-VARIABLE "=" VALUE
    { $$ = [ {
            "let": $2,
            "rhs": $4,
        } ]; 
    }
    |
    "USE-VIEW" SYMBOL-SIMPLE
    { $$ = [
        {
            "use-view": $2.toLowerCase(),
        }
    ]; }
    |
    "CREATE-VIEW" SYMBOL-SIMPLE "WHERE" VALUE
    { $$ = [
        {
            "create-view": $2.toLowerCase(),
            "where": $4,
            "store": "things",
        }
    ]; }
    |
    "CREATE-RULE" SYMBOL-SIMPLE "WHERE" VALUE "BEGIN" EXPRESSION-LIST "END"
    { $$ = [
        {
            "create-rule": $2,
            "store": "things",
            "triggers": [],
            "where": $4,
            "begin-end": $6,
        }
    ]; }
    |
    "CREATE-RULE" SYMBOL-SIMPLE "WHERE" VALUE "FROM" SYMBOL-SIMPLE "BEGIN" EXPRESSION-LIST "END"
    { $$ = [
        {
            "create-rule": $2,
            "store": $6,
            "triggers": [],
            "where": $4,
            "begin-end": $8,
        }
    ]; }
    |
    "CREATE-MODEL" SYMBOL-SIMPLE "WITH" SET-TERMS ATTRIBUTES
    {
        $$ = [
            {
                "create-model": $2,
                "model-values": $4,
                "attributes": $5,
            }
        ];
    }
    |
    "CREATE-MODEL" SYMBOL-SIMPLE "WITH" SET-TERMS 
    {
        $$ = [
            {
                "create-model": $2,
                "model-values": $4,
                "attributes": [],
            }
        ];
    }
    |
    "CONNECT-MODEL" SYMBOL-SIMPLE
    {
        $$ = [
            {
                "connect-model": $2,
                "model-values": [],
                "attributes": [],
            }
        ];
    }
    |
    "CONNECT-MODEL" SYMBOL-SIMPLE "WITH" SIMPLE-SET-TERMS 
    {
        $$ = [
            {
                "connect-model": $2,
                "model-values": $4,
                "attributes": [],
            }
        ];
    }
    |
    "CONNECT-ALL" 
    {
        $$ = [
            {
                "connect-all": true,
            }
        ];
    }
    |
    { $$ = []; }
    ;

ATTRIBUTES:
    ATTRIBUTES ONE-ATTRIBUTE
    {
        $1.push($2); $$ = $1;
    }
    |
    ONE-ATTRIBUTE
    {
        $$ = [ $1 ];
    }
    ;

ONE-ATTRIBUTE:
    "ATTRIBUTE" STRING "WITH" SET-TERMS 
    {
        $$ = {
            "attribute": eval($2),
            "attribute-values": $4,
        };
    }
    |
    "ATTRIBUTE" SYMBOL-SIMPLE "WITH" SET-TERMS 
    {
        $$ = {
            "attribute": $2,
            "attribute-values": $4,
        };
    }
    ;


SELECT-TERMS:
    SELECT-TERMS "," SELECT-TERM
    { if ($3 !== undefined) { $1.push($3) }; $$ = $1; } // the if shouldn't be requried
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
    D-SYMBOL "AS" SYMBOL-SIMPLE
    {{ $1.column = $3; $$ = $1; }}   // want to rename to "as"
    |
    SYMBOL-SIMPLE "(" STAR ")"
    {{ $$ = {
        "compute": {
            "operation": $1,
            "star": true,
            "join": "function",
        }
      }
    }}
    |
    SYMBOL-SIMPLE "(" STAR ")" "AS" SYMBOL-SIMPLE
    {{ $$ = {
        "compute": {
            "operation": $1,
            "star": true,
        },
        "column": $6,    // want to rename to "as"
      }
    }}
    |
    STAR
    {{
        $$ = {
            select_all: true,
        };
    }}
    ;


/*
 *  "Dictionary" symbol - splitting up the symbol
 */
D-SYMBOL:
    |
    SYMBOL-STAR
    {{ $$ = {
        "band": $1.replace(/[:].*$/, ""),  
        "all": true,
        };
    }}
    |
    VALUE
    ;

/*
 *  Parsed symbol
 */
P-SYMBOL:
    SYMBOL
    {{
        $$ = {
            "band": $1.replace(/[:].*$/, ""),  
            "selector": $1.replace(/^[^.]*[:]/, ""),  
        };
    }}
    ;

SET-TERMS:
    SET-TERMS "," SET-TERM
    { $1.push($3); $$ = $1; }
    |
    SET-TERM
    {{ $$ = [ $1 ]; }}
    ;

SET-TERM:
    P-SYMBOL "=" VALUE
    {{
        $$ = {
            lhs: $1,
            rhs: $3,
            assign: $2,
        };
    }}
    |
    // iot:enumeration = "com.webos.app.notificationcenter" AS iot-purpose:band.info.notifications
    P-SYMBOL "=" VALUE "AS" VALUE
    {{
        $$ = {
            lhs: $1,
            rhs: $5,
            alias: $3,
            assign: $2,
        };
    }}
    |
    P-SYMBOL ASSIGN-OPERATOR VALUE
    {{
        $$ = {
            lhs: $1,
            rhs: $3,
            assign: $2,
        };
    }}
    ;

SIMPLE-SET-TERMS:
    SIMPLE-SET-TERMS "," SIMPLE-SET-TERM
    { $1.push($3); $$ = $1; }
    |
    SIMPLE-SET-TERM
    {{ $$ = [ $1 ]; }}
    ;

SIMPLE-SET-TERM:
    SYMBOL-SIMPLE "=" VALUE
    {{
        $$ = {
            lhs: {
                "band": "",
                "selector": $1,
            },
            rhs: $3,
            assign: $2,
        };
    }}
    |
    P-SYMBOL "=" VALUE
    {{
        $$ = {
            lhs: $1,
            rhs: $3,
            assign: $2,
        };
    }}
    |
    P-SYMBOL ASSIGN-OPERATOR VALUE
    {{
        $$ = {
            lhs: $1,
            rhs: $3,
            assign: $2,
        };
    }}
    ;

VALUE:
    LEFT-OPERATOR VALUE
    {{ $$ = {  
            "compute": {
                "operation": $1,
                "operands": [ $2, ],
                "join": "left",
            }
        };
    }}
    |
    VALUE BI-OPERATOR VALUE
    {{ $$ = {  
            "compute": {
                "operation": $2,
                "operands": [ $1, $3 ],
                "join": "middle",
            }
        };
    }}
    |
    VALUE "=" VALUE
    {{ $$ = {  
            "compute": {
                "operation": $2,
                "operands": [ $1, $3 ],
                "join": "middle",
            }
        };
    }}
    |
    VALUE LOGIC-OPERATOR VALUE
    {{ $$ = {  
            "compute": {
                "operation": $2,
                "operands": [ $1, $3 ],
                "join": "middle",
            }
        };
    }}
    |
    SYMBOL-SIMPLE "(" PARAMETERS ")"
    {{ $$ = {  
            "compute": {
                "operation": $1,
                "operands": $3,
                "join": "function",
            }
        };
    }}
    |
    P-SYMBOL "(" PARAMETERS ")"
    {{ $$ = {  
            "compute": {
                "module": $1.band,
                "operation": $1.selector,
                "operands": $3,
                "join": "function",
            }
        };
    }}
    |
    "(" VALUE ")"
    {{ $$ = $2; }}
    |
    LIST
    |
    ATOMIC
    |
    ATOMIC DECORATOR
    {{
        var selector = null;
        if ($2 === "%") {
            selector = 'math.fraction.percent';
        } else if ($2 === "°C") {
            selector = 'temperature.si.celsius';
        } else if ($2 === "°F") {
            selector = 'temperature.imperial.fahrenheit';
        } else if ($2 === "°K") {
            selector = 'temperature.si.kelvin';
        }

        $$ = {
            "compute": {
                "operation": "unit",
                "operands": [
                    $1,
                    {
                        band: "iot-unit",
                        selector: selector,
                    },
                ],
                "join": "function",
            },
        };
    }}
    ;

PARAMETERS:
    {{ $$ = []; }}
    |
    PARAMETER
    {{ $$ = [ $1 ]; }}
    |
    PARAMETER "," PARAMETERS
    {{ $3.splice(0, 0, $1); $$ = $3; }}
    ;

PARAMETER:
    SYMBOL-SIMPLE "=" PARAMETER
    {{ $$ = {  
            "named": {
                "key": $1,
                "value": $3,
            }
        };
    }}
    |
    SYMBOL-SIMPLE "(" VALUES ")"
    {{ $$ = {  
            "compute": {
                "operation": $1,
                "operands": $3,
                "join": "function",
            }
        };
    }}
    |
    P-SYMBOL "(" VALUES ")"
    {{ $$ = {  
            "compute": {
                "module": $1.band,
                "operation": $1.selector,
                "operands": $3,
                "join": "function",
            }
        };
    }}
    |
    "(" VALUE ")"
    {{ $$ = $2; }}
    |
    LIST
    |
    ATOMIC
    |
    ATOMIC DECORATOR
    {{
        var selector = null;
        if ($2 === "%") {
            selector = 'math.fraction.percent';
        } else if ($2 === "°C") {
            selector = 'temperature.si.celsius';
        } else if ($2 === "°F") {
            selector = 'temperature.imperial.fahrenheit';
        } else if ($2 === "°K") {
            selector = 'temperature.si.kelvin';
        }

        $$ = {
            "compute": {
                "operation": "unit",
                "operands": [
                    $1,
                    {
                        band: "iot-unit",
                        selector: selector,
                    },
                ],
                "join": "function",
            },
        };
    }}
    ;


LIST:
    "[" VALUES "]"
    {{
        $$ = {
            "list": $2
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
    P-SYMBOL
    {{ $$ = $1; }}
    |
    INTEGER
    {{ $$ = { "actual": Number.parseInt($1) }; }}
    |
    NUMBER
    {{ $$ = { "actual": Number.parseFloat($1) }; }}
    |
    STRING
    {{ $$ = { "actual": eval($1) }; }}
    |
    BOOLEAN
    {{ $$ = { "actual": eval($1) }; }}
    |
    NULL
    {{ $$ = { "actual": null }; }}
    |
    ID
    {{ $$ = { "id": true }; }}
    |
    P-VARIABLE
    {{
        $$ = $1;
    }}
    ;

P-VARIABLE:
    VARIABLE
    {{
        var match = $1.match(/^([$][^$]+)([$]([^:]+)(:(.+$))?)?/);
        $$ = { 
            "variable": {
                "complete": $1,
                "variable": match[1],
                "band": match[3],
                "selector": match[5],
            },
        };
    }}
    ;
