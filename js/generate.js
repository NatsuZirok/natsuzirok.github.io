function generate_functions(arrFuncs) {
  var funcs_map = new Map();
  var added_funcs = new Map();

  $("#func_list").empty();

  arrFuncs.forEach(function(val, ind, arr) {
    var arrOfNums = [];
    var funcVars = val.match(/([\-0-9a-z]+)/g);
    funcVars.shift(); //удаляем f, который идет в начале

    if(funcs_map.has(funcVars.length)) {
      arrOfNums = funcs_map.get(funcVars.length);
    }

    if(!added_funcs.has(funcVars.length)){
      build_function(funcVars.length).appendTo("#func_list");
      added_funcs.set(funcVars.length, true)
    }
    
    arrOfNums.push(val);
    funcs_map.set(funcVars.length, arrOfNums);
  });



  return funcs_map; //Возврат отсортированной(по кол-ву переменных) по функциям карты
}

//Динамическая построка строки для функции в которой >3 переменных
function build_function(var_count) {
  if(var_count > 26) {
    return; //Нахуя тебе больше 26 переменных в функции?! НАХУЯ?!
  }

  var lettersArr = ["b", "c", "d", "e", "f", "g", "h", "i", "j", "k", 
                    "l", "m", "n", "o", "p", "q", "r", "s", 
                    "t", "u", "v", "w", "x", "y", "z"];

  var vars_line = "a";
  for(var i = 0; i < var_count-1; i++) {
    vars_line += ", " + lettersArr[i]
  }

  var func = $("#func_body").contents().clone();
  func.find(".func-var").text(vars_line);
  func.find(".func").prop("func-var-count", var_count);
  return func;
}

function generate_vars(arrVars) {
  $("#vars_list").empty();

  arrVars.forEach(function(val) {
    var var_ = $("#var_body").contents().clone();
    var_.find(".var_leter").text(val);
    var_.find(".var").prop("var", val);
    var_.appendTo("#vars_list");
  });
}