%lex
%options case-insensitive
%%  

"CREATE"\s+"SCENE"      return 'CREATE-SCENE'
"CREATE"\s+"TRIGGER"    return 'CREATE-TRIGGER'
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
[_a-zA-Z][-_a-zA-Z0-9]+([:][_a-zA-Z][-_a-zA-Z0-9]*[:][_a-zA-Z][-_a-zA-Z0-9]+)   return 'SYMBOL'
[_a-zA-Z][-_a-zA-Z0-9]+[:]([_a-zA-Z][-_a-zA-Z0-9]*)([.][_a-zA-Z][-_a-zA-Z0-9]*)*   return 'SYMBOL'
[_a-zA-Z][-_a-zA-Z0-9]+([:][*])   return 'SYMBOL-STAR'
[_a-zA-Z][-_a-zA-Z0-9]+   return 'SYMBOL-SIMPLE'
[$][_a-zA-Z][-_a-zA-Z0-9]+   return 'VARIABLE'
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
                "do" : $2
            }
        ];
    }
    |
    "CREATE-SCENE" SYMBOL-SIMPLE "BEGIN" EXPRESSION-LIST "END"
    { $$ = [
        {
            "create-scene": $2,
            "parameters": [],
            "begin-end": $4
        }
    ]; }
    |
    "CREATE-SCENE" SYMBOL-SIMPLE "(" SYMBOL-SIMPLE ")" "BEGIN" EXPRESSION-LIST "END"
    { $$ = [
        {
            "create-scene": $2,
            "parameters": [ { variable: $4 }, ],
            "begin-end": $7
        }
    ]; }
    |
    "LET" VARIABLE "=" VALUE
    { $$ = [ {
            "let": $2,
            "rhs": $4,
        } ]; 
    }
    |
    "CREATE-TRIGGER" SYMBOL-SIMPLE "SELECT" SELECT-TERMS "BEGIN" EXPRESSION-LIST "END"
    { $$ = [
        {
            "create-trigger": $2,
            "store": "things",
            "select": $4,
            "begin-end": $6,
        }
    ]; }
    |
    "CREATE-TRIGGER" SYMBOL-SIMPLE "SELECT" SELECT-TERMS "FROM" SYMBOL-SIMPLE "BEGIN" EXPRESSION-LIST "END"
    { $$ = [
        {
            "create-trigger": $2,
            "select": $4,
            "store": $6,
            "begin-end": $8,
        }
    ]; }
    |
    "CREATE-TRIGGER" SYMBOL-SIMPLE "SELECT" SELECT-TERMS "WHERE" VALUE "BEGIN" EXPRESSION-LIST "END"
    { $$ = [
        {
            "create-trigger": $2,
            "store": "things",
            "select": $4,
            "where": $6,
            "begin-end": $8,
        }
    ]; }
    |
    "CREATE-TRIGGER" SYMBOL-SIMPLE "SELECT" SELECT-TERMS "FROM" SYMBOL-SIMPLE "WHERE" VALUE "BEGIN" EXPRESSION-LIST "END"
    { $$ = [
        {
            "create-trigger": $2,
            "store": $6.toLowerCase(),
            "select": $4,
            "where": $8,
            "begin-end": $10,
        }
    ]; }
    |
    { $$ = []; }
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
    D-SYMBOL "AS" SYMBOL-SIMPLE
    {{ $1.column = $3; $$ = $1; }}
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
        "column": $6,
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

SET-TERMS:
    SET-TERMS "," SET-TERM
    { $1.push($3); $$ = $1; }
    |
    SET-TERM
    {{ $$ = [ $1 ]; }}
    ;

SET-TERM:
    SYMBOL "=" VALUE
    {{
        $$ = {
            lhs: {
                "band": $1.replace(/[:].*$/, ""),  
                "selector": $1.replace(/^[^.]*[:]/, ""),  
            },
            rhs: $3,
            assign: $2,
        };
    }}
    |
    SYMBOL ASSIGN-OPERATOR VALUE
    {{
        $$ = {
            lhs: {
                "band": $1.replace(/[:].*$/, ""),  
                "selector": $1.replace(/^[^.]*[:]/, ""),  
            },
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
    SYMBOL "(" PARAMETERS ")"
    {{ $$ = {  
            "compute": {
                "module": $1.replace(/[:].*$/, ""),  
                "operation": $1.replace(/^[^.]*[:]/, ""),  
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
                "operation": "units",
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
    SYMBOL "(" VALUES ")"
    {{ $$ = {  
            "compute": {
                "module": $1.replace(/[.].*$/, ""),  
                "operation": $1.replace(/^[^.]*[.]/, ""),  
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
                "operation": "units",
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
    SYMBOL
    {{ $$ = {
        "band": $1.replace(/[:].*$/, ""),  
        "selector": $1.replace(/^[^.]*[:]/, ""),  
        };
    }}
    /*
    |
    INTEGER DECORATOR
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
                "operation": "units",
                "operands": [
                    {
                        actual: Number.parseInt($1)
                    },
                    {
                        band: "iot-unit",
                        selector: selector,
                    },
                ],
                "join": "function",
            },
        };
    }}
    |
    NUMBER DECORATOR
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
                "operation": "units",
                "operands": [
                    {
                        actual: Number.parseFloat($1)
                    },
                    {
                        band: "iot-unit",
                        selector: selector,
                    },
                ],
                "join": "function",
            },
        };
    }}
    */
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
    VARIABLE
    {{ $$ = { "variable": $1 }; }}
    ;
