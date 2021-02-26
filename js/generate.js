function generate_functions(arrFuncs) {
  var funcs_map = new Map();
  var funcs_added = new Map();

  arrFuncs.forEach(function(val, ind, arr) {
    var arrOfNums = [];
    var funcVars = val.match(/([\-0-9]+)/g);

    if(funcs_map.has(funcVars.length)) {
      arrOfNums = funcs_map.get(funcVars.length);
    }
    
    arrOfNums.push(val);
    funcs_map.set(funcVars.length, arrOfNums);
  });



  return funcs_map; //Возврат отсортированной(по кол-ву переменных) по функциям карты
}

function generate_vars(arrVars) {
}