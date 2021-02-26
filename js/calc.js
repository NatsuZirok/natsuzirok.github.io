/*
 * fullLine - строка для калькуляции
 * vars - массив переменных 
*/
function calc(fullLine, arr) {
  fullLine = clearLine(fullLine)


  return simpleLineCalc(fullLine);
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
    var who_last_pos = str.match(/[\^]/g);

    if (who_last_pos) {
      var wlp_i = parsed.lastIndexOf("^");
      parsed[wlp_i] = Math.pow( parseInt(parsed[(wlp_i-1)], 10), parseInt(parsed[(wlp_i+1)], 10) );
      parsed.splice( (wlp_i+1), 1 );
      parsed.splice( (wlp_i-1), 1 );
    }
  }

  while (parsed.includes("*") || parsed.includes(":")) {
    var who_first_pos = str.match(/[\*\:]/g);

    if (who_first_pos) {
      var wfp_i = parsed.indexOf(who_first_pos[0]);

      switch(parsed[wfp_i]) {
        case "*":
          parsed[wfp_i] = parseInt(parsed[(wfp_i-1)], 10) * parseInt(parsed[(wfp_i+1)], 10);
          break;
        case "/":
          parsed[wfp_i] = parseInt(parsed[(wfp_i-1)], 10) / parseInt(parsed[(wfp_i+1)], 10);
          break;        
        default: 
          console.log("wtf *: " + parsed[wfp_i] + " -> " + parsed.indexOf(who_first_pos[1]));
          return;
      }

      parsed.splice( (wfp_i+1), 1 );
      parsed.splice( (wfp_i-1), 1 );

    }
  }

  while (parsed.includes("+") || parsed.includes("-")) {
    var who_first_pos = str.match(/[\+\-]/g);

    var wfp_i = parsed.indexOf(who_first_pos[0]);
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
    var who_last_pos = str.match(/[⇒]/g);

    if (who_last_pos) {
      var wlp_i = parsed.indexOf("⇒");
      parsed[wlp_i] = trixie( parseInt(parsed[(wlp_i-1)], 10), parseInt(parsed[(wlp_i+1)], 10) );
      parsed.splice( (wlp_i+1), 1 );
      parsed.splice( (wlp_i-1), 1 );
    }
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

  return expr.split("\"");
}

//Парсер функций
function functionParse(expr) {
  return expr;
}

//Парсер переменных
function varParse(expr) {
  return expr;
}

//Есть ли скобки
function isParentheses(line) {
  return line.match(/\(([0-9\+\-\*\/\^⇒]+)\)/g)
}

//Есть ли функции
function isFunction(line) {
  return line.match(/f\(([\-0-9\,]+)\)/g);
}

//Есть ли переменные
function isVar(line) {
  return false;//заглушка
}