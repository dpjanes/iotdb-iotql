%lex
%%  

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
"NULL"                  return 'NULL'
"SELECT"                return 'SELECT'
"AS"                    return 'AS'
"WHERE"                 return 'WHERE'
"SET"                   return 'SET'
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
    { $$ = [ { "select": $2 } ]; }
    |
    "SELECT" SELECT-TERMS "WHERE" VALUE
    { $$ = [ { "select": $2, "where": $4 } ]; }
    |
    "SET" SET-TERMS
    { $$ = [ { "set": $2 } ]; }
    |
    "SET" SET-TERMS "WHERE" VALUE
    { $$ = [ { "set": $2, "where": $4 } ]; }
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
            }
        };
    }}
    |
    VALUE BI-OPERATOR VALUE
    {{ $$ = {  
            "compute": {
                "operation": $2,
                "operands": [ $1, $3 ],
            }
        };
    }}
    |
    VALUE "=" VALUE
    {{ $$ = {  
            "compute": {
                "operation": $2,
                "operands": [ $1, $3 ],
            }
        };
    }}
    |
    VALUE LOGIC-OPERATOR VALUE
    {{ $$ = {  
            "compute": {
                "operation": $2,
                "operands": [ $1, $3 ],
            }
        };
    }}
    |
    SYMBOL-SIMPLE "(" PARAMETERS ")"
    {{ $$ = {  
            "compute": {
                "operation": $1,
                "operands": $3,
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
                        band: "units",
                        selector: selector,
                    },
                ]
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
                        band: "units",
                        selector: selector,
                    },
                ]
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
                        band: "units",
                        selector: selector,
                    },
                ]
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
                        band: "units",
                        selector: selector,
                    },
                ]
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
    ;
