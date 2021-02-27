/*
 * fullLine - строка для калькуляции
 * funcs - карта функций
 * funcs_line - карта строк для функций
 * vars - карта переменных 
*/
function calc(fullLine, funcs = new Map(), funcs_line = new Map(), vars = new Map()) {
  fullLine = clearLine(fullLine);

  fullLine.replaceAll(/f\(([\-0-9a-z\,]+)\)/g, "※($1)"); //костыль

  if(vars.length !== 0) { //проходим сначала по переменным, вдруг будет функция f(x) ?
    vars.forEach(function(val, key) {
      fullLine = fullLine.replaceAll(key, val); 
    }); 
  }

  fullLine.replaceAll(/※\(([\-0-9a-z\,]+)\)/g, "f($1)");

  if(funcs.length !== 0) {

    funcs.forEach(function(val, key) {
      var funcRes = "";

      val.forEach(function(func_code, ind) {
        var nv = func_code;
        var nf = func_code.match(/[a-z]/g);
        nf.shift();
        if(nf) {
          nf.forEach(function(val) {
            nv = nv.replaceAll(val, vars.get(val))
          });
        }
        var funcVars = nv.match(/([\-0-9]+)/g);

        funcRes = build_function_line(funcs_line.get(key), funcVars);
        funcRes = clearLine(funcRes);
        funcRes = simpleLineCalc(funcRes);
        fullLine = fullLine.replaceAll(nv, funcRes);
      });
    });
  }

  return simpleLineCalc(fullLine);
}

function build_function_line(line, vars = []) {
  var cp_line = clearLine(line);
  var lettersArr = ["a", "b", "c", "d", "e", "f", "g", "h", "i", 
                    "j", "k", "l", "m", "n", "o", "p", "q", "r", 
                    "s", "t", "u", "v", "w", "x", "y", "z"];

  vars.forEach(function(val, ind) {
    cp_line = cp_line.replaceAll(lettersArr[ind], val);
  }); 

  return cp_line;
}

function clearLine(string) {
  string = string.replaceAll(" ", "");

  string = string.replaceAll("=>", "⇒");
  string = string.replaceAll("trixie", "⇒");

  string = string.replaceAll(":", "/");
  string = string.replaceAll("\\", "/");

  return string;
}

//Строка без букв и функций
function simpleLineCalc(fullExpr) {
  var tokens = [];

  do {
    if(fullExpr.match(/\/0/g)) {
      return "\/0";
    }

    if(tokens) {
      for (var ix = 0, max = tokens.length; ix < max; ix++) {
        var iCalc = parenthesesCalc(tokens[ix]);
        fullExpr = fullExpr.replaceAll(tokens[ix], iCalc);
      }
    }
  } while (tokens = isParentheses(fullExpr))

  return parenthesesCalc(fullExpr);
}

//Калькулятор обычной строки и того, что в скобках
function parenthesesCalc(str) {
  var parsed = simpleParse(str);

  while (parsed.includes("^")) {
    var wlp_i = parsed.lastIndexOf("^");
    parsed[wlp_i] = Math.pow( parseInt(parsed[(wlp_i-1)], 10), parseInt(parsed[(wlp_i+1)], 10) );
    parsed.splice( (wlp_i+1), 1 );
    parsed.splice( (wlp_i-1), 1 );
  }

  while (parsed.includes("*") || parsed.includes(":")) {
    if(parsed.indexOf("*") === -1) {
      wfp_i = parsed.indexOf(":");
    }
    if(parsed.indexOf(":") === -1) {
      wfp_i = parsed.indexOf("*");
    }
    if(parsed.indexOf(":") !== -1 && parsed.indexOf("*") !== -1) {
      wfp_i = parsed.indexOf(":") < parsed.indexOf("*") ? parsed.indexOf(":") : parsed.indexOf("*");
    }

    switch(parsed[wfp_i]) {
      case "*":
        parsed[wfp_i] = parseInt(parsed[(wfp_i-1)], 10) * parseInt(parsed[(wfp_i+1)], 10);
        break;
      case "/":
        parsed[wfp_i] = parseInt(parsed[(wfp_i-1)], 10) / parseInt(parsed[(wfp_i+1)], 10);
        break;        
      default: 
        console.log("wtf *");
        return;
    }

    parsed.splice( (wfp_i+1), 1 );
    parsed.splice( (wfp_i-1), 1 );
  }

  while (parsed.includes("+") || parsed.includes("-")) {
    var wfp_i = 0;
    if(parsed.indexOf("+") === -1) {
      wfp_i = parsed.indexOf("-");
    }
    if(parsed.indexOf("-") === -1) {
      wfp_i = parsed.indexOf("+");
    }
    if(parsed.indexOf("-") !== -1 && parsed.indexOf("+") !== -1) {
      wfp_i = parsed.indexOf("-") < parsed.indexOf("+") ? parsed.indexOf("-") : parsed.indexOf("+");
    }

    switch(parsed[wfp_i]) {
      case "+":
        parsed[wfp_i] = parseInt(parsed[(wfp_i-1)], 10) + parseInt(parsed[(wfp_i+1)], 10);
        break;
      case "-":
        parsed[wfp_i] = parseInt(parsed[(wfp_i-1)], 10) - parseInt(parsed[(wfp_i+1)], 10);
        break;
      default: 
        console.log("wtf +");
        return;
    }

    parsed.splice( (wfp_i+1), 1 );
    parsed.splice( (wfp_i-1), 1 );
  }

  while (parsed.includes("⇒")) {
    var wlp_i = parsed.indexOf("⇒");
    parsed[wlp_i] = trixie( parseInt(parsed[(wlp_i-1)], 10), parseInt(parsed[(wlp_i+1)], 10) );
    parsed.splice( (wlp_i+1), 1 );
    parsed.splice( (wlp_i-1), 1 );
  }

  return parsed[0];
}

//Костыль на строковых сравнениях
function trixie(a, b) {
  var res = "";

  a = a.toString(2); b = b.toString(2);

  if(a.length !== b.length) {
    if(a.length < b.length) {
      while(a.length < b.length) { 
        a = "0" + a;
      }
    } else if(b.length < a.length) {
      while(b.length < a.length) { 
        b = "0" + b;
      }
    }
  }

  for(var i = 0, max = a.length; i < max; i++) {
    res += a[i] <= b[i] ? "1" : "0";
  }

  return parseInt(res, 2);
}

//Парсер обычных выражений
function simpleParse(expr) {
  expr = expr.replaceAll(/[\(\)]/g, "");

  expr = expr.replaceAll("*", "\"*\"");
  expr = expr.replaceAll("^", "\"^\"");
  expr = expr.replaceAll("/", "\"/\"");
  expr = expr.replaceAll("+", "\"+\"");
  expr = expr.replaceAll("⇒", "\"⇒\"");

  expr = expr.replaceAll(/(\d)\-(\d)/g, "$1\"-\"$2");
  expr = expr.replaceAll(/(\d)\-(\-\d)/g, "$1\"-\"$2");

  return expr.split("\"");
}

//Есть ли скобки
function isParentheses(line) {
  return line.match(/\(([0-9\+\-\*\/\^⇒]+)\)/g)
}

//Есть ли функции
function isFunction(line) {
  return line.match(/f\(([\-0-9a-z\,]+)\)/g);
}

//Есть ли переменные
function isVar(line) {
  return line.match(/(?=([a-z]))[^f(]|^$/g);
}