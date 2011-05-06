jsface.namespace("jgen");

jsface.def({
	
	$meta: {
		name: "Selector",
		namespace: jgen,
		singleton: true
	},
	
	query: function(oElement, sSelector) {
		return oElement.querySelector(sSelector);
	},
	
	queryAll: function(oElement, sSelector) {
		return oElement.querySelectorAll(sSelector);
	},
	
	matches: function(oElement, sSelector) {
		return oElement.webkitMatchesSelector(sSelector);
	},
	
	queryAncestor: function(oElement, sSelector) {
		if (this.matches(oElement, sSelector)) return oElement;
		if ((oElement.parentNode) && (oElement.parentNode.nodeType == 1)) {
			return this.queryAncestor(oElement.parentNode, sSelector);
		}
		return null;
	}
	
});
