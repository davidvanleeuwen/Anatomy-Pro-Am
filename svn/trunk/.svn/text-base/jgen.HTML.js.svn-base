jsface.namespace("jgen");

jsface.def({
	
	$meta: {
		name: "HTML",
		namespace: jgen,
		singleton: true
	},
	
	setStyle: function(oElement, oStyle) {
		for (var sPropertyName in oStyle) {
			oElement.style[jgen.String.camelize(sPropertyName)] = oStyle[
				sPropertyName
			];
		}
		return oElement;
	},
	
	setClass: {
		"Object, String": function(oElement, sClassName) {
			oElement.className = sClassName;
		},
		"Object, Array": function(oElement, aClassNames) {
			oElement.className = aClassNames.join(' ');
		}
	},
	
	hasClass: {
		"Object, String": function(oElement, sClassName) {
			return new RegExp('(\\s|^)' + sClassName + '(\\s|$)').test(
				oElement.className
			);
		},
		"Object, Array": function(oElement, aClassNames) {
			for (var c = 0; c < aClassNames.length; c++) {
				if (!this.hasClass(oElement, aClassNames[c])) {
					return false;
				}
			}
			return true;
		}
	},
	
	addClass: {
		"Object, String": function(oElement, sClassName) {
			if (this.hasClass(oElement, sClassName)) return;
			oElement.className = (oElement.className + ' ' + sClassName);
		},
		"Object, Array": function(oElement, aClassNames) {
			for (var c = 0; c < aClassNames.length; c++) {
				this.addClass(oElement, aClassNames[c]);
			}
		}
	},
	
	replaceClass: {
		"Object, String, String": function(oElement, sFromClass, sToClass) {
			oElement.className = jgen.String.trim(
				oElement.className.replace(
					new RegExp('(\\s|^)' + sFromClass + '(\\s|$)'),
					' ' + sToClass + ' '
				)
			);
		},
		"Object, Object": function(oElement, oReplaceHash) {
			for (var sFromClass in oReplaceHash) {
				this.replaceClass(
					oElement,
					sFromClass,
					oReplaceHash[sFromClass]
				);
			}
		}
	},
	
	removeClass: {
		"Object, String": function(oElement, sClassName) {
			this.replaceClass(oElement, sClassName, '');
		},
		"Object, Array": function(oElement, aClassNames) {
			for (var c = 0; c < aClassNames.length; c++) {
				this.replaceClass(oElement, aClassNames[c], '');
			}
		}
	}
	
});
