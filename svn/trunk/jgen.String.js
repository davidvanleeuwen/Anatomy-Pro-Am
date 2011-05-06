jsface.namespace("jgen");

jsface.def({
	
	$meta: {
		name: "String",
		namespace: jgen,
		singleton: true
	},
	
	camelize: function(value) {
		for (var str = '', length = value.length, c = 0; c < length; c++) {
			if (value[c] != '-') str += (
				value[c - 1] == '-' ?
				value[c].toUpperCase() :
				value[c]
			);
		}
		return str;
	},
	
	trim: function(value) {
		return value.replace(/^\s+|\s+$/g, '');
	}
	
});
