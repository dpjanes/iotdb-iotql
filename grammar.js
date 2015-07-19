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
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[5,6,9,13,19],$V1=[2,17],$V2=[1,15],$V3=[1,11],$V4=[1,16],$V5=[1,12],$V6=[1,14],$V7=[1,19],$V8=[1,20],$V9=[1,21],$Va=[1,22],$Vb=[1,23],$Vc=[1,24],$Vd=[1,25],$Ve=[1,28],$Vf=[5,6],$Vg=[5,6,9,13],$Vh=[1,34],$Vi=[1,33],$Vj=[1,35],$Vk=[1,37],$Vl=[5,6,9,13,17,19,23,26,27,32],$Vm=[2,30],$Vn=[23,32];
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"expressions":3,"EXPRESSION":4,"EOF":5,";":6,"SELECT":7,"SELECT-TERMS":8,"WHERE":9,"VALUE":10,"SET":11,"SET-TERMS":12,",":13,"SELECT-TERM":14,"SET-TERM":15,"SYMBOL":16,"=":17,"D-SYMBOL":18,"AS":19,"SYMBOL-SIMPLE":20,"(":21,"STAR":22,")":23,"SYMBOL-STAR":24,"LEFT-OPERATOR":25,"BI-OPERATOR":26,"LOGIC-OPERATOR":27,"VALUES":28,"LIST":29,"ATOMIC":30,"[":31,"]":32,"INTEGER":33,"NUMBER":34,"STRING":35,"BOOLEAN":36,"NULL":37,"ID":38,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",6:";",7:"SELECT",9:"WHERE",11:"SET",13:",",16:"SYMBOL",17:"=",19:"AS",20:"SYMBOL-SIMPLE",21:"(",22:"STAR",23:")",24:"SYMBOL-STAR",25:"LEFT-OPERATOR",26:"BI-OPERATOR",27:"LOGIC-OPERATOR",31:"[",32:"]",33:"INTEGER",34:"NUMBER",35:"STRING",36:"BOOLEAN",37:"NULL",38:"ID"},
productions_: [0,[3,2],[3,2],[3,1],[4,2],[4,4],[4,2],[4,4],[8,3],[8,1],[12,3],[12,1],[15,3],[14,1],[14,3],[14,4],[14,6],[18,0],[18,1],[18,1],[10,2],[10,3],[10,3],[10,3],[10,4],[10,4],[10,3],[10,1],[10,1],[29,3],[28,0],[28,1],[28,3],[30,1],[30,1],[30,1],[30,1],[30,1],[30,1],[30,1]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1: case 2:
 return $$[$0-1]; 
break;
case 3:
 return []; 
break;
case 4:
 this.$ = [ { "select": $$[$0] } ]; 
break;
case 5:
 this.$ = [ { "select": $$[$0-2], "where": $$[$0] } ]; 
break;
case 6:
 this.$ = [ { "set": $$[$0] } ]; 
break;
case 7:
 this.$ = [ { "set": $$[$0-2], "where": $$[$0] } ]; 
break;
case 8: case 10:
 $$[$0-2].push($$[$0]); this.$ = $$[$0-2]; 
break;
case 9: case 11: case 31:
 this.$ = [ $$[$0] ]; 
break;
case 12:

        this.$ = {
            lhs: {
                "band": $$[$0-2].replace(/[.].*$/, ""),  
                "selector": $$[$0-2].replace(/^[^.]*[.]/, ""),  
            },
            rhs: $$[$0],
        };
    
break;
case 13:
 this.$ = $$[$0] 
break;
case 14:
 $$[$0-2].column = $$[$0]; this.$ = $$[$0-2]; 
break;
case 15:
 this.$ = {
        "compute": {
            "operation": $$[$0-3],
            "star": true,
        }
      }
    
break;
case 16:
 this.$ = {
        "compute": {
            "operation": $$[$0-5],
            "star": true,
        },
        "column": $$[$0],
      }
    
break;
case 18:
 this.$ = {
        "band": $$[$0].replace(/[.].*$/, ""),  
        "all": true,
        };
    
break;
case 20:
 this.$ = {  
            "compute": {
                "operation": $$[$0-1],
                "operands": [ $$[$0], ],
            }
        };
    
break;
case 21: case 22: case 23:
 this.$ = {  
            "compute": {
                "operation": $$[$0-1],
                "operands": [ $$[$0-2], $$[$0] ],
            }
        };
    
break;
case 24:
 this.$ = {  
            "compute": {
                "operation": $$[$0-3],
                "operands": $$[$0-1],
            }
        };
    
break;
case 25:
 this.$ = {  
            "compute": {
                "module": $$[$0-3].replace(/[.].*$/, ""),  
                "operation": $$[$0-3].replace(/^[^.]*[.]/, ""),  
                "operands": $$[$0-1],
            }
        };
    
break;
case 26:
 this.$ = $$[$0-1]; 
break;
case 29:

        this.$ = {
            "list": $$[$0-1]
        }
    
break;
case 30:
 this.$ = []; 
break;
case 32:
 $$[$0].splice(0, 0, $$[$0-2]); this.$ = $$[$0]; 
break;
case 33:
 this.$ = {
        "band": $$[$0].replace(/[.].*$/, ""),  
        "selector": $$[$0].replace(/^[^.]*[.]/, ""),  
        };
    
break;
case 34:
 this.$ = { "actual": Number.parseInt($$[$0]) }; 
break;
case 35:
 this.$ = { "actual": Number.parseFloat($$[$0]) }; 
break;
case 36: case 37:
 this.$ = { "actual": eval($$[$0]) }; 
break;
case 38:
 this.$ = { "actual": null }; 
break;
case 39:
 this.$ = { "id": true }; 
break;
}
},
table: [{3:1,4:2,5:[1,3],7:[1,4],11:[1,5]},{1:[3]},{5:[1,6],6:[1,7]},{1:[2,3]},o($V0,$V1,{8:8,14:9,18:10,10:13,29:17,30:18,16:$V2,20:$V3,21:$V4,24:$V5,25:$V6,31:$V7,33:$V8,34:$V9,35:$Va,36:$Vb,37:$Vc,38:$Vd}),{12:26,15:27,16:$Ve},{1:[2,1]},{1:[2,2]},o($Vf,[2,4],{9:[1,29],13:[1,30]}),o($Vg,[2,9]),o($Vg,[2,13],{19:[1,31]}),{21:[1,32]},o($V0,[2,18]),o($V0,[2,19],{17:$Vh,26:$Vi,27:$Vj}),{10:36,16:$V2,20:$Vk,21:$V4,25:$V6,29:17,30:18,31:$V7,33:$V8,34:$V9,35:$Va,36:$Vb,37:$Vc,38:$Vd},o($Vl,[2,33],{21:[1,38]}),{10:39,16:$V2,20:$Vk,21:$V4,25:$V6,29:17,30:18,31:$V7,33:$V8,34:$V9,35:$Va,36:$Vb,37:$Vc,38:$Vd},o($Vl,[2,27]),o($Vl,[2,28]),{10:41,16:$V2,20:$Vk,21:$V4,25:$V6,28:40,29:17,30:18,31:$V7,32:$Vm,33:$V8,34:$V9,35:$Va,36:$Vb,37:$Vc,38:$Vd},o($Vl,[2,34]),o($Vl,[2,35]),o($Vl,[2,36]),o($Vl,[2,37]),o($Vl,[2,38]),o($Vl,[2,39]),o($Vf,[2,6],{9:[1,42],13:[1,43]}),o($Vg,[2,11]),{17:[1,44]},{10:45,16:$V2,20:$Vk,21:$V4,25:$V6,29:17,30:18,31:$V7,33:$V8,34:$V9,35:$Va,36:$Vb,37:$Vc,38:$Vd},o($V0,$V1,{18:10,10:13,29:17,30:18,14:46,16:$V2,20:$V3,21:$V4,24:$V5,25:$V6,31:$V7,33:$V8,34:$V9,35:$Va,36:$Vb,37:$Vc,38:$Vd}),{20:[1,47]},{10:41,16:$V2,20:$Vk,21:$V4,22:[1,48],23:$Vm,25:$V6,28:49,29:17,30:18,31:$V7,33:$V8,34:$V9,35:$Va,36:$Vb,37:$Vc,38:$Vd},{10:50,16:$V2,20:$Vk,21:$V4,25:$V6,29:17,30:18,31:$V7,33:$V8,34:$V9,35:$Va,36:$Vb,37:$Vc,38:$Vd},{10:51,16:$V2,20:$Vk,21:$V4,25:$V6,29:17,30:18,31:$V7,33:$V8,34:$V9,35:$Va,36:$Vb,37:$Vc,38:$Vd},{10:52,16:$V2,20:$Vk,21:$V4,25:$V6,29:17,30:18,31:$V7,33:$V8,34:$V9,35:$Va,36:$Vb,37:$Vc,38:$Vd},o($Vl,[2,20]),{21:[1,53]},{10:41,16:$V2,20:$Vk,21:$V4,23:$Vm,25:$V6,28:54,29:17,30:18,31:$V7,33:$V8,34:$V9,35:$Va,36:$Vb,37:$Vc,38:$Vd},{17:$Vh,23:[1,55],26:$Vi,27:$Vj},{32:[1,56]},o($Vn,[2,31],{13:[1,57],17:$Vh,26:$Vi,27:$Vj}),{10:58,16:$V2,20:$Vk,21:$V4,25:$V6,29:17,30:18,31:$V7,33:$V8,34:$V9,35:$Va,36:$Vb,37:$Vc,38:$Vd},{15:59,16:$Ve},{10:60,16:$V2,20:$Vk,21:$V4,25:$V6,29:17,30:18,31:$V7,33:$V8,34:$V9,35:$Va,36:$Vb,37:$Vc,38:$Vd},o($Vf,[2,5],{17:$Vh,26:$Vi,27:$Vj}),o($Vg,[2,8]),o($Vg,[2,14]),{23:[1,61]},{23:[1,62]},o([5,6,9,13,19,23,26,27,32],[2,21],{17:$Vh}),o($Vl,[2,22]),o([5,6,9,13,19,23,27,32],[2,23],{17:$Vh,26:$Vi}),{10:41,16:$V2,20:$Vk,21:$V4,23:$Vm,25:$V6,28:49,29:17,30:18,31:$V7,33:$V8,34:$V9,35:$Va,36:$Vb,37:$Vc,38:$Vd},{23:[1,63]},o($Vl,[2,26]),o($Vl,[2,29]),o($Vn,$Vm,{29:17,30:18,10:41,28:64,16:$V2,20:$Vk,21:$V4,25:$V6,31:$V7,33:$V8,34:$V9,35:$Va,36:$Vb,37:$Vc,38:$Vd}),o($Vf,[2,7],{17:$Vh,26:$Vi,27:$Vj}),o($Vg,[2,10]),o($Vg,[2,12],{17:$Vh,26:$Vi,27:$Vj}),o($Vg,[2,15],{19:[1,65]}),o($Vl,[2,24]),o($Vl,[2,25]),o($Vn,[2,32]),{20:[1,66]},o($Vg,[2,16])],
defaultActions: {3:[2,3],6:[2,1],7:[2,2]},
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
options: {},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {
var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:/* skip whitespace */
break;
case 1:/* skip comments */
break;
case 2:return 34
break;
case 3:return 34
break;
case 4:return 33
break;
case 5:return 35
break;
case 6:return 35
break;
case 7:return 5
break;
case 8:return 6
break;
case 9:return 13
break;
case 10:return 21
break;
case 11:return 23
break;
case 12:return 31
break;
case 13:return 32
break;
case 14:return 38
break;
case 15:return 37
break;
case 16:return 7
break;
case 17:return 19
break;
case 18:return 9
break;
case 19:return 11
break;
case 20:return 36
break;
case 21:return 36
break;
case 22:return 17
break;
case 23:return 26
break;
case 24:return 26
break;
case 25:return 26
break;
case 26:return 26
break;
case 27:return 26
break;
case 28:return 26
break;
case 29:return 26
break;
case 30:return 26
break;
case 31:return 26
break;
case 32:return 27
break;
case 33:return 27
break;
case 34:return 25
break;
case 35:return 16
break;
case 36:return 16
break;
case 37:return 24
break;
case 38:return 20
break;
case 39:return 22;
break;
}
},
rules: [/^(?:\s+)/,/^(?:[-][-].*)/,/^(?:0\b)/,/^(?:[-]?[0-9]+\.[0-9]+\b)/,/^(?:[-]?[1-9][0-9]*\b)/,/^(?:"(\\.|[^"])*")/,/^(?:'(\\.|[^'])*')/,/^(?:$)/,/^(?:;)/,/^(?:,)/,/^(?:\()/,/^(?:\))/,/^(?:\[)/,/^(?:\])/,/^(?:id\b)/,/^(?:NULL\b)/,/^(?:SELECT\b)/,/^(?:AS\b)/,/^(?:WHERE\b)/,/^(?:SET\b)/,/^(?:false\b)/,/^(?:true\b)/,/^(?:=)/,/^(?:!=)/,/^(?:<=)/,/^(?:>=)/,/^(?:<)/,/^(?:>)/,/^(?:NOT IN\b)/,/^(?:IN\b)/,/^(?:&)/,/^(?:\|)/,/^(?:AND\b)/,/^(?:OR\b)/,/^(?:!)/,/^(?:[_a-zA-Z][-_a-zA-Z0-9]+([.][_a-zA-Z][-_a-zA-Z0-9]*[:][_a-zA-Z][-_a-zA-Z0-9]+))/,/^(?:[_a-zA-Z][-_a-zA-Z0-9]+([.][_a-zA-Z][-_a-zA-Z0-9]*)+)/,/^(?:[_a-zA-Z][-_a-zA-Z0-9]+([.][*]))/,/^(?:[_a-zA-Z][-_a-zA-Z0-9]+)/,/^(?:\*)/],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39],"inclusive":true}}
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