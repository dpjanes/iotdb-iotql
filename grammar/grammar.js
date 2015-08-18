/* parser generated by jison 0.4.15 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var parser = (function(){
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[2,23],$V1=[1,4],$V2=[1,5],$V3=[1,6],$V4=[1,7],$V5=[1,8],$V6=[1,9],$V7=[1,10],$V8=[1,11],$V9=[5,24],$Va=[5,7,10,12,24,34,37],$Vb=[2,34],$Vc=[1,17],$Vd=[1,23],$Ve=[1,22],$Vf=[1,33],$Vg=[1,18],$Vh=[1,19],$Vi=[1,21],$Vj=[1,26],$Vk=[1,27],$Vl=[1,28],$Vm=[1,29],$Vn=[1,30],$Vo=[1,31],$Vp=[1,32],$Vq=[1,36],$Vr=[5,7,24],$Vs=[5,7,10,12,24,34],$Vt=[1,51],$Vu=[1,50],$Vv=[1,52],$Vw=[1,54],$Vx=[5,7,10,12,20,23,24,27,33,34,37,43,44,47,51],$Vy=[2,65],$Vz=[5,7,10,12,20,23,24,27,33,34,37,43,44,51],$VA=[2,62],$VB=[1,61],$VC=[5,7,12,24,33,34],$VD=[1,79],$VE=[1,81],$VF=[2,51],$VG=[1,80],$VH=[20,51],$VI=[7,24],$VJ=[20,34],$VK=[1,124],$VL=[5,7,24,33];
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"expressions":3,"EXPRESSION-LIST":4,"EOF":5,"EXPRESSION":6,";":7,"SELECT":8,"SELECT-TERMS":9,"FROM":10,"SYMBOL-SIMPLE":11,"WHERE":12,"VALUE":13,"SET":14,"SET-TERMS":15,"UPDATE":16,"DO":17,"(":18,"PARAMETERS":19,")":20,"SYMBOL":21,"CREATE-SCENE":22,"BEGIN":23,"END":24,"LET":25,"VARIABLE":26,"=":27,"CREATE-TRIGGER":28,"CREATE-MODEL":29,"WITH":30,"ATTRIBUTES":31,"ONE-ATTRIBUTE":32,"ATTRIBUTE":33,",":34,"SELECT-TERM":35,"D-SYMBOL":36,"AS":37,"STAR":38,"SYMBOL-STAR":39,"SET-TERM":40,"ASSIGN-OPERATOR":41,"LEFT-OPERATOR":42,"BI-OPERATOR":43,"LOGIC-OPERATOR":44,"LIST":45,"ATOMIC":46,"DECORATOR":47,"PARAMETER":48,"VALUES":49,"[":50,"]":51,"INTEGER":52,"NUMBER":53,"STRING":54,"BOOLEAN":55,"NULL":56,"ID":57,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",7:";",8:"SELECT",10:"FROM",11:"SYMBOL-SIMPLE",12:"WHERE",14:"SET",16:"UPDATE",17:"DO",18:"(",20:")",21:"SYMBOL",22:"CREATE-SCENE",23:"BEGIN",24:"END",25:"LET",26:"VARIABLE",27:"=",28:"CREATE-TRIGGER",29:"CREATE-MODEL",30:"WITH",33:"ATTRIBUTE",34:",",37:"AS",38:"STAR",39:"SYMBOL-STAR",41:"ASSIGN-OPERATOR",42:"LEFT-OPERATOR",43:"BI-OPERATOR",44:"LOGIC-OPERATOR",47:"DECORATOR",50:"[",51:"]",52:"INTEGER",53:"NUMBER",54:"STRING",55:"BOOLEAN",56:"NULL",57:"ID"},
productions_: [0,[3,2],[4,3],[4,1],[6,2],[6,4],[6,4],[6,6],[6,2],[6,4],[6,4],[6,6],[6,2],[6,5],[6,2],[6,5],[6,5],[6,8],[6,4],[6,7],[6,9],[6,5],[6,4],[6,0],[31,2],[31,1],[32,4],[9,3],[9,1],[35,1],[35,3],[35,4],[35,6],[35,1],[36,0],[36,1],[36,1],[15,3],[15,1],[40,3],[40,3],[13,2],[13,3],[13,3],[13,3],[13,4],[13,4],[13,3],[13,1],[13,1],[13,2],[19,0],[19,1],[19,3],[48,3],[48,4],[48,4],[48,3],[48,1],[48,1],[48,2],[45,3],[49,0],[49,1],[49,3],[46,1],[46,1],[46,1],[46,1],[46,1],[46,1],[46,1],[46,1]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:

            return this.$;
        
break;
case 2:
 
            this.$ = $$[$0-2].concat($$[$0]);
        
break;
case 3:
 
            this.$ = $$[$0]; 
        
break;
case 4:
 this.$ = [ { "select": $$[$0], "store": "things" } ]; 
break;
case 5:
 this.$ = [ { "select": $$[$0-2], "store": $$[$0].toLowerCase() } ]; 
break;
case 6:
 this.$ = [ { "select": $$[$0-2], "where": $$[$0], "store": "things" } ]; 
break;
case 7:
 this.$ = [ { "select": $$[$0-4], "store": $$[$0-2].toLowerCase(), "where": $$[$0] } ]; 
break;
case 8:
 this.$ = [ { "set": $$[$0], "store": "things" } ]; 
break;
case 9:
 this.$ = [ { "set": $$[$0], "store": $$[$0-2].toLowerCase() } ]; 
break;
case 10:
 this.$ = [ { "set": $$[$0-2], "where": $$[$0], "store": "things" } ]; 
break;
case 11:
 this.$ = [ { "set": $$[$0-2], "where": $$[$0], "store": $$[$0-4].toLowerCase() } ]; 
break;
case 12:

        this.$ = [
            {
                "do": $$[$0].toLowerCase(),
                "module": "scene",
                "operands": [],
            }
        ];
    
break;
case 13:

        this.$ = [
            {  
                "do": $$[$0-3].toLowerCase(),
                "module": "scene",
                "operands": $$[$0-1],
            }
        ];
    
break;
case 14:

        $$[$0] = $$[$0].toLowerCase();
        this.$ = [
            {
                "do": $$[$0].replace(/^[^.]*[:]/, ""),  
                "module": $$[$0].replace(/[:].*$/, ""),  
                "operands": [],
            }
        ];
    
break;
case 15:

        $$[$0-3] = $$[$0-3].toLowerCase();
        this.$ = [
            {  
                "do": $$[$0-3].replace(/^[^.]*[:]/, ""),  
                "module": $$[$0-3].replace(/[:].*$/, ""),  
                "operands": $$[$0-1],
            }
        ];
    
break;
case 16:
 this.$ = [
        {
            "create-scene": $$[$0-3],
            "parameters": [],
            "begin-end": $$[$0-1]
        }
    ]; 
break;
case 17:
 this.$ = [
        {
            "create-scene": $$[$0-6],
            "parameters": [ { variable: $$[$0-4] }, ],
            "begin-end": $$[$0-1]
        }
    ]; 
break;
case 18:
 this.$ = [ {
            "let": $$[$0-2],
            "rhs": $$[$0],
        } ]; 
    
break;
case 19:
 this.$ = [
        {
            "create-trigger": $$[$0-5],
            "store": "things",
            "where": $$[$0-3],
            "begin-end": $$[$0-1],
        }
    ]; 
break;
case 20:
 this.$ = [
        {
            "create-trigger": $$[$0-7],
            "store": $$[$0-3],
            "where": $$[$0-5],
            "begin-end": $$[$0-1],
        }
    ]; 
break;
case 21:

        this.$ = [
            {
                "create-model": $$[$0-3],
                "model-values": $$[$0-1],
                "attributes": $$[$0],
            }
        ];
    
break;
case 22:

        this.$ = [
            {
                "create-model": $$[$0-2],
                "model-values": $$[$0],
                "attributes": [],
            }
        ];
    
break;
case 23: case 51: case 62:
 this.$ = []; 
break;
case 24:

        $$[$0-1].push($$[$0]); this.$ = $$[$0-1];
    
break;
case 25:

        this.$ = [ $$[$0] ];
    
break;
case 26:

        this.$ = {
            "attribute": $$[$0-2],
            "attribute-values": $$[$0],
        };
    
break;
case 27:
 if ($$[$0] !== undefined) { $$[$0-2].push($$[$0]) }; this.$ = $$[$0-2]; 
break;
case 28: case 38: case 52: case 63:
 this.$ = [ $$[$0] ]; 
break;
case 29:
 this.$ = $$[$0] 
break;
case 30:
 $$[$0-2].column = $$[$0]; this.$ = $$[$0-2]; 
break;
case 31:
 this.$ = {
        "compute": {
            "operation": $$[$0-3],
            "star": true,
            "join": "function",
        }
      }
    
break;
case 32:
 this.$ = {
        "compute": {
            "operation": $$[$0-5],
            "star": true,
        },
        "column": $$[$0],
      }
    
break;
case 33:

        this.$ = {
            select_all: true,
        };
    
break;
case 35:
 this.$ = {
        "band": $$[$0].replace(/[:].*$/, ""),  
        "all": true,
        };
    
break;
case 37:
 $$[$0-2].push($$[$0]); this.$ = $$[$0-2]; 
break;
case 39: case 40:

        this.$ = {
            lhs: {
                "band": $$[$0-2].replace(/[:].*$/, ""),  
                "selector": $$[$0-2].replace(/^[^.]*[:]/, ""),  
            },
            rhs: $$[$0],
            assign: $$[$0-1],
        };
    
break;
case 41:
 this.$ = {  
            "compute": {
                "operation": $$[$0-1],
                "operands": [ $$[$0], ],
                "join": "left",
            }
        };
    
break;
case 42: case 43: case 44:
 this.$ = {  
            "compute": {
                "operation": $$[$0-1],
                "operands": [ $$[$0-2], $$[$0] ],
                "join": "middle",
            }
        };
    
break;
case 45: case 55:
 this.$ = {  
            "compute": {
                "operation": $$[$0-3],
                "operands": $$[$0-1],
                "join": "function",
            }
        };
    
break;
case 46:
 this.$ = {  
            "compute": {
                "module": $$[$0-3].replace(/[:].*$/, ""),  
                "operation": $$[$0-3].replace(/^[^.]*[:]/, ""),  
                "operands": $$[$0-1],
                "join": "function",
            }
        };
    
break;
case 47: case 57:
 this.$ = $$[$0-1]; 
break;
case 50: case 60:

        var selector = null;
        if ($$[$0] === "%") {
            selector = 'math.fraction.percent';
        } else if ($$[$0] === "°C") {
            selector = 'temperature.si.celsius';
        } else if ($$[$0] === "°F") {
            selector = 'temperature.imperial.fahrenheit';
        } else if ($$[$0] === "°K") {
            selector = 'temperature.si.kelvin';
        }

        this.$ = {
            "compute": {
                "operation": "unit",
                "operands": [
                    $$[$0-1],
                    {
                        band: "iot-unit",
                        selector: selector,
                    },
                ],
                "join": "function",
            },
        };
    
break;
case 53: case 64:
 $$[$0].splice(0, 0, $$[$0-2]); this.$ = $$[$0]; 
break;
case 54:
 this.$ = {  
            "named": {
                "key": $$[$0-2],
                "value": $$[$0],
            }
        };
    
break;
case 56:
 this.$ = {  
            "compute": {
                "module": $$[$0-3].replace(/[.].*$/, ""),  
                "operation": $$[$0-3].replace(/^[^.]*[.]/, ""),  
                "operands": $$[$0-1],
                "join": "function",
            }
        };
    
break;
case 61:

        this.$ = {
            "list": $$[$0-1]
        }
    
break;
case 65:
 this.$ = {
        "band": $$[$0].replace(/[:].*$/, ""),  
        "selector": $$[$0].replace(/^[^.]*[:]/, ""),  
        };
    
break;
case 66:
 this.$ = { "actual": Number.parseInt($$[$0]) }; 
break;
case 67:
 this.$ = { "actual": Number.parseFloat($$[$0]) }; 
break;
case 68: case 69:
 this.$ = { "actual": eval($$[$0]) }; 
break;
case 70:
 this.$ = { "actual": null }; 
break;
case 71:
 this.$ = { "id": true }; 
break;
case 72:
 this.$ = { "variable": $$[$0] }; 
break;
}
},
table: [o([5,7],$V0,{3:1,4:2,6:3,8:$V1,14:$V2,16:$V3,17:$V4,22:$V5,25:$V6,28:$V7,29:$V8}),{1:[3]},{5:[1,12]},o($V9,[2,3],{7:[1,13]}),o($Va,$Vb,{9:14,35:15,36:16,13:20,45:24,46:25,11:$Vc,18:$Vd,21:$Ve,26:$Vf,38:$Vg,39:$Vh,42:$Vi,50:$Vj,52:$Vk,53:$Vl,54:$Vm,55:$Vn,56:$Vo,57:$Vp}),{15:34,21:$Vq,40:35},{11:[1,37]},{11:[1,38],21:[1,39]},{11:[1,40]},{26:[1,41]},{11:[1,42]},{11:[1,43]},{1:[2,1]},o($Vr,$V0,{6:3,4:44,8:$V1,14:$V2,16:$V3,17:$V4,22:$V5,25:$V6,28:$V7,29:$V8}),o($Vr,[2,4],{10:[1,45],12:[1,46],34:[1,47]}),o($Vs,[2,28]),o($Vs,[2,29],{37:[1,48]}),{18:[1,49]},o($Vs,[2,33]),o($Va,[2,35]),o($Va,[2,36],{27:$Vt,43:$Vu,44:$Vv}),{11:$Vw,13:53,18:$Vd,21:$Ve,26:$Vf,42:$Vi,45:24,46:25,50:$Vj,52:$Vk,53:$Vl,54:$Vm,55:$Vn,56:$Vo,57:$Vp},o($Vx,$Vy,{18:[1,55]}),{11:$Vw,13:56,18:$Vd,21:$Ve,26:$Vf,42:$Vi,45:24,46:25,50:$Vj,52:$Vk,53:$Vl,54:$Vm,55:$Vn,56:$Vo,57:$Vp},o($Vz,[2,48]),o($Vz,[2,49],{47:[1,57]}),{11:$Vw,13:59,18:$Vd,21:$Ve,26:$Vf,42:$Vi,45:24,46:25,49:58,50:$Vj,51:$VA,52:$Vk,53:$Vl,54:$Vm,55:$Vn,56:$Vo,57:$Vp},o($Vx,[2,66]),o($Vx,[2,67]),o($Vx,[2,68]),o($Vx,[2,69]),o($Vx,[2,70]),o($Vx,[2,71]),o($Vx,[2,72]),o($Vr,[2,8],{12:[1,60],34:$VB}),o($VC,[2,38]),{27:[1,62],41:[1,63]},{14:[1,64]},o($Vr,[2,12],{18:[1,65]}),o($Vr,[2,14],{18:[1,66]}),{18:[1,68],23:[1,67]},{27:[1,69]},{12:[1,70]},{30:[1,71]},o($V9,[2,2]),{11:[1,72]},{11:$Vw,13:73,18:$Vd,21:$Ve,26:$Vf,42:$Vi,45:24,46:25,50:$Vj,52:$Vk,53:$Vl,54:$Vm,55:$Vn,56:$Vo,57:$Vp},o($Va,$Vb,{36:16,13:20,45:24,46:25,35:74,11:$Vc,18:$Vd,21:$Ve,26:$Vf,38:$Vg,39:$Vh,42:$Vi,50:$Vj,52:$Vk,53:$Vl,54:$Vm,55:$Vn,56:$Vo,57:$Vp}),{11:[1,75]},{11:$VD,18:$VE,19:77,20:$VF,21:$VG,26:$Vf,38:[1,76],45:82,46:83,48:78,50:$Vj,52:$Vk,53:$Vl,54:$Vm,55:$Vn,56:$Vo,57:$Vp},{11:$Vw,13:84,18:$Vd,21:$Ve,26:$Vf,42:$Vi,45:24,46:25,50:$Vj,52:$Vk,53:$Vl,54:$Vm,55:$Vn,56:$Vo,57:$Vp},{11:$Vw,13:85,18:$Vd,21:$Ve,26:$Vf,42:$Vi,45:24,46:25,50:$Vj,52:$Vk,53:$Vl,54:$Vm,55:$Vn,56:$Vo,57:$Vp},{11:$Vw,13:86,18:$Vd,21:$Ve,26:$Vf,42:$Vi,45:24,46:25,50:$Vj,52:$Vk,53:$Vl,54:$Vm,55:$Vn,56:$Vo,57:$Vp},o($Vz,[2,41]),{18:[1,87]},{11:$VD,18:$VE,19:88,20:$VF,21:$VG,26:$Vf,45:82,46:83,48:78,50:$Vj,52:$Vk,53:$Vl,54:$Vm,55:$Vn,56:$Vo,57:$Vp},{20:[1,89],27:$Vt,43:$Vu,44:$Vv},o($Vz,[2,50]),{51:[1,90]},o($VH,[2,63],{27:$Vt,34:[1,91],43:$Vu,44:$Vv}),{11:$Vw,13:92,18:$Vd,21:$Ve,26:$Vf,42:$Vi,45:24,46:25,50:$Vj,52:$Vk,53:$Vl,54:$Vm,55:$Vn,56:$Vo,57:$Vp},{21:$Vq,40:93},{11:$Vw,13:94,18:$Vd,21:$Ve,26:$Vf,42:$Vi,45:24,46:25,50:$Vj,52:$Vk,53:$Vl,54:$Vm,55:$Vn,56:$Vo,57:$Vp},{11:$Vw,13:95,18:$Vd,21:$Ve,26:$Vf,42:$Vi,45:24,46:25,50:$Vj,52:$Vk,53:$Vl,54:$Vm,55:$Vn,56:$Vo,57:$Vp},{15:96,21:$Vq,40:35},{11:$VD,18:$VE,19:97,20:$VF,21:$VG,26:$Vf,45:82,46:83,48:78,50:$Vj,52:$Vk,53:$Vl,54:$Vm,55:$Vn,56:$Vo,57:$Vp},{11:$VD,18:$VE,19:98,20:$VF,21:$VG,26:$Vf,45:82,46:83,48:78,50:$Vj,52:$Vk,53:$Vl,54:$Vm,55:$Vn,56:$Vo,57:$Vp},o($VI,$V0,{6:3,4:99,8:$V1,14:$V2,16:$V3,17:$V4,22:$V5,25:$V6,28:$V7,29:$V8}),{11:[1,100]},{11:$Vw,13:101,18:$Vd,21:$Ve,26:$Vf,42:$Vi,45:24,46:25,50:$Vj,52:$Vk,53:$Vl,54:$Vm,55:$Vn,56:$Vo,57:$Vp},{11:$Vw,13:102,18:$Vd,21:$Ve,26:$Vf,42:$Vi,45:24,46:25,50:$Vj,52:$Vk,53:$Vl,54:$Vm,55:$Vn,56:$Vo,57:$Vp},{15:103,21:$Vq,40:35},o($Vr,[2,5],{12:[1,104]}),o($Vr,[2,6],{27:$Vt,43:$Vu,44:$Vv}),o($Vs,[2,27]),o($Vs,[2,30]),{20:[1,105]},{20:[1,106]},{20:[2,52],34:[1,107]},{18:[1,109],27:[1,108]},o([20,34,47],$Vy,{18:[1,110]}),{11:$Vw,13:111,18:$Vd,21:$Ve,26:$Vf,42:$Vi,45:24,46:25,50:$Vj,52:$Vk,53:$Vl,54:$Vm,55:$Vn,56:$Vo,57:$Vp},o($VJ,[2,58]),o($VJ,[2,59],{47:[1,112]}),o([5,7,10,12,20,23,24,33,34,37,43,44,51],[2,42],{27:$Vt}),o($Vz,[2,43]),o([5,7,10,12,20,23,24,33,34,37,44,51],[2,44],{27:$Vt,43:$Vu}),{11:$VD,18:$VE,19:77,20:$VF,21:$VG,26:$Vf,45:82,46:83,48:78,50:$Vj,52:$Vk,53:$Vl,54:$Vm,55:$Vn,56:$Vo,57:$Vp},{20:[1,113]},o($Vz,[2,47]),o($Vz,[2,61]),o($VH,$VA,{45:24,46:25,13:59,49:114,11:$Vw,18:$Vd,21:$Ve,26:$Vf,42:$Vi,50:$Vj,52:$Vk,53:$Vl,54:$Vm,55:$Vn,56:$Vo,57:$Vp}),o($Vr,[2,10],{27:$Vt,43:$Vu,44:$Vv}),o($VC,[2,37]),o($VC,[2,39],{27:$Vt,43:$Vu,44:$Vv}),o($VC,[2,40],{27:$Vt,43:$Vu,44:$Vv}),o($Vr,[2,9],{12:[1,115],34:$VB}),{20:[1,116]},{20:[1,117]},{24:[1,118]},{20:[1,119]},o($Vr,[2,18],{27:$Vt,43:$Vu,44:$Vv}),{10:[1,121],23:[1,120],27:$Vt,43:$Vu,44:$Vv},o($Vr,[2,22],{31:122,32:123,33:$VK,34:$VB}),{11:$Vw,13:125,18:$Vd,21:$Ve,26:$Vf,42:$Vi,45:24,46:25,50:$Vj,52:$Vk,53:$Vl,54:$Vm,55:$Vn,56:$Vo,57:$Vp},o($Vs,[2,31],{37:[1,126]}),o($Vz,[2,45]),{11:$VD,18:$VE,19:127,20:$VF,21:$VG,26:$Vf,45:82,46:83,48:78,50:$Vj,52:$Vk,53:$Vl,54:$Vm,55:$Vn,56:$Vo,57:$Vp},{11:$VD,18:$VE,21:$VG,26:$Vf,45:82,46:83,48:128,50:$Vj,52:$Vk,53:$Vl,54:$Vm,55:$Vn,56:$Vo,57:$Vp},{11:$Vw,13:59,18:$Vd,20:$VA,21:$Ve,26:$Vf,42:$Vi,45:24,46:25,49:129,50:$Vj,52:$Vk,53:$Vl,54:$Vm,55:$Vn,56:$Vo,57:$Vp},{11:$Vw,13:59,18:$Vd,20:$VA,21:$Ve,26:$Vf,42:$Vi,45:24,46:25,49:130,50:$Vj,52:$Vk,53:$Vl,54:$Vm,55:$Vn,56:$Vo,57:$Vp},{20:[1,131],27:$Vt,43:$Vu,44:$Vv},o($VJ,[2,60]),o($Vz,[2,46]),o($VH,[2,64]),{11:$Vw,13:132,18:$Vd,21:$Ve,26:$Vf,42:$Vi,45:24,46:25,50:$Vj,52:$Vk,53:$Vl,54:$Vm,55:$Vn,56:$Vo,57:$Vp},o($Vr,[2,13]),o($Vr,[2,15]),o($Vr,[2,16]),{23:[1,133]},o($VI,$V0,{6:3,4:134,8:$V1,14:$V2,16:$V3,17:$V4,22:$V5,25:$V6,28:$V7,29:$V8}),{11:[1,135]},o($Vr,[2,21],{32:136,33:$VK}),o($VL,[2,25]),{11:[1,137]},o($Vr,[2,7],{27:$Vt,43:$Vu,44:$Vv}),{11:[1,138]},{20:[2,53]},o($VJ,[2,54]),{20:[1,139]},{20:[1,140]},o($VJ,[2,57]),o($Vr,[2,11],{27:$Vt,43:$Vu,44:$Vv}),o($VI,$V0,{6:3,4:141,8:$V1,14:$V2,16:$V3,17:$V4,22:$V5,25:$V6,28:$V7,29:$V8}),{24:[1,142]},{23:[1,143]},o($VL,[2,24]),{30:[1,144]},o($Vs,[2,32]),o($VJ,[2,55]),o($VJ,[2,56]),{24:[1,145]},o($Vr,[2,19]),o($VI,$V0,{6:3,4:146,8:$V1,14:$V2,16:$V3,17:$V4,22:$V5,25:$V6,28:$V7,29:$V8}),{15:147,21:$Vq,40:35},o($Vr,[2,17]),{24:[1,148]},o($VL,[2,26],{34:$VB}),o($Vr,[2,20])],
defaultActions: {12:[2,1],127:[2,53]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        throw new Error(str);
    }
},
parse: function parse(input) {
    var self = this, stack = [0], tstack = [], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    var lexer = Object.create(this.lexer);
    var sharedState = { yy: {} };
    for (var k in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
            sharedState.yy[k] = this.yy[k];
        }
    }
    lexer.setInput(input, sharedState.yy);
    sharedState.yy.lexer = lexer;
    sharedState.yy.parser = this;
    if (typeof lexer.yylloc == 'undefined') {
        lexer.yylloc = {};
    }
    var yyloc = lexer.yylloc;
    lstack.push(yyloc);
    var ranges = lexer.options && lexer.options.ranges;
    if (typeof sharedState.yy.parseError === 'function') {
        this.parseError = sharedState.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    _token_stack:
        function lex() {
            var token;
            token = lexer.lex() || EOF;
            if (typeof token !== 'number') {
                token = self.symbols_[token] || token;
            }
            return token;
        }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(lexer.yytext);
            lstack.push(lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = lexer.yyleng;
                yytext = lexer.yytext;
                yylineno = lexer.yylineno;
                yyloc = lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                sharedState.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};
/* generated by jison-lex 0.3.4 */
var lexer = (function(){
var lexer = ({

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input, yy) {
        this.yy = yy || this.yy || {};
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex() {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState(condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {"case-insensitive":true},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {
var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:return 22
break;
case 1:return 28
break;
case 2:return 29
break;
case 3:/* skip whitespace */
break;
case 4:/* skip comments */
break;
case 5:return 53
break;
case 6:return 53
break;
case 7:return 52
break;
case 8:return 54
break;
case 9:return 54
break;
case 10:return 5
break;
case 11:return ':'
break;
case 12:return 7
break;
case 13:return 34
break;
case 14:return 18
break;
case 15:return 20
break;
case 16:return 50
break;
case 17:return 51
break;
case 18:return 57
break;
case 19:return 17
break;
case 20:return 56
break;
case 21:return 8
break;
case 22:return 37
break;
case 23:return 12
break;
case 24:return 14
break;
case 25:return 16
break;
case 26:return 10
break;
case 27:return 23
break;
case 28:return 24
break;
case 29:return 25
break;
case 30:return 30
break;
case 31:return 33
break;
case 32:return 55
break;
case 33:return 55
break;
case 34:return 27
break;
case 35:return 47
break;
case 36:return 47
break;
case 37:return 47
break;
case 38:return 47
break;
case 39:return 41
break;
case 40:return 41
break;
case 41:return 43
break;
case 42:return 43
break;
case 43:return 43
break;
case 44:return 43
break;
case 45:return 43
break;
case 46:return 43
break;
case 47:return 43
break;
case 48:return 43
break;
case 49:return 43
break;
case 50:return 44
break;
case 51:return 44
break;
case 52:return 42
break;
case 53:return 21
break;
case 54:return 21
break;
case 55:return 39
break;
case 56:return 11
break;
case 57:return 26
break;
case 58:return 38;
break;
}
},
rules: [/^(?:CREATE\s+SCENE\b)/i,/^(?:CREATE\s+TRIGGER\b)/i,/^(?:CREATE\s+MODEL\b)/i,/^(?:\s+)/i,/^(?:[-][-].*)/i,/^(?:0\b)/i,/^(?:[-]?[0-9]+\.[0-9]+\b)/i,/^(?:[-]?[1-9][0-9]*\b)/i,/^(?:"(\\.|[^"])*")/i,/^(?:'(\\.|[^'])*')/i,/^(?:$)/i,/^(?::)/i,/^(?:;)/i,/^(?:,)/i,/^(?:\()/i,/^(?:\))/i,/^(?:\[)/i,/^(?:\])/i,/^(?:id\b)/i,/^(?:DO\b)/i,/^(?:NULL\b)/i,/^(?:SELECT\b)/i,/^(?:AS\b)/i,/^(?:WHERE\b)/i,/^(?:SET\b)/i,/^(?:UPDATE\b)/i,/^(?:FROM\b)/i,/^(?:BEGIN\b)/i,/^(?:END\b)/i,/^(?:LET\b)/i,/^(?:WITH\b)/i,/^(?:ATTRIBUTE\b)/i,/^(?:false\b)/i,/^(?:true\b)/i,/^(?:=)/i,/^(?:%)/i,/^(?:°C\b)/i,/^(?:°F\b)/i,/^(?:°K\b)/i,/^(?:&=)/i,/^(?:\|=)/i,/^(?:!=)/i,/^(?:<=)/i,/^(?:>=)/i,/^(?:<)/i,/^(?:>)/i,/^(?:NOT IN\b)/i,/^(?:IN\b)/i,/^(?:&)/i,/^(?:\|)/i,/^(?:AND\b)/i,/^(?:OR\b)/i,/^(?:!)/i,/^(?:[_a-zA-Z][-_a-zA-Z0-9]*([:][_a-zA-Z][-_a-zA-Z0-9]*[:][_a-zA-Z][-_a-zA-Z0-9]+))/i,/^(?:[_a-zA-Z][-_a-zA-Z0-9]*[:]([_a-zA-Z][-_a-zA-Z0-9]*)([.][_a-zA-Z][-_a-zA-Z0-9]*)*)/i,/^(?:[_a-zA-Z][-_a-zA-Z0-9]*([:][*]))/i,/^(?:[_a-zA-Z][-_a-zA-Z0-9]*)/i,/^(?:[$][_a-zA-Z][-_a-zA-Z0-9]+)/i,/^(?:\*)/i],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58],"inclusive":true}}
});
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = parser;
exports.Parser = parser.Parser;
exports.parse = function () { return parser.parse.apply(parser, arguments); };
exports.main = function commonjsMain(args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
}