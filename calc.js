function calc(fullExpr) {
	var tokens = [];

	do {
		if(fullExpr.match(/\/0/g)) {
			return "\/0";
		}

		tokens = fullExpr.match(/\(([0-9\+\-\*\/\^⇒]+)\)/g);

		if(tokens) {
			for (var ix = 0, max = tokens.length; ix < max; ix++) {
				var iCalc = simpleCalc(tokens[ix]);
				fullExpr = fullExpr.replaceAll(tokens[ix], iCalc);
			}
		}
	} while (fullExpr.match(/\(([0-9\+\-\*\/\^⇒]+)\)/g))

	return simpleCalc(fullExpr);
}

function simpleCalc(str) {
	var parsed = parse(str);

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
		var first_pos = str.match(/[\+\-]/g);

		var fp_i = parsed.indexOf(first_pos[0]);
		switch(parsed[fp_i]) {
			case "+":
				parsed[fp_i] = parseInt(parsed[fp_i-1], 10) + parseInt(parsed[fp_i+1], 10);
				break;
			case "-":
				parsed[fp_i] = parseInt(parsed[fp_i-1], 10) - parseInt(parsed[fp_i+1], 10);
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

function parse(expr) {
	expr = expr.replaceAll(/[\(\)]/g, "");

	expr = expr.replaceAll("*", "\"*\"");
	expr = expr.replaceAll("^", "\"^\"");
	expr = expr.replaceAll("/", "\"/\"");
	expr = expr.replaceAll("+", "\"+\"");
	expr = expr.replaceAll("⇒", "\"⇒\"");

	expr = expr.replaceAll(/(\d)\-(\d)/g, "$1\"-\"$2");

	return expr.split("\"");
}