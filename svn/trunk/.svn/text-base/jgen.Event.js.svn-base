jsface.namespace("jgen");

jsface.def({
	
	$meta: {
		name: "Event",
		namespace: jgen,
		singleton: true
	},
	
	add: {
		"Object, String, Function": function(oElement, sEventType, fEventHandler) {
			oElement.addEventListener(sEventType, fEventHandler);
		},
		"Object, Object, Function": function(oElement, oEventType, fEventHandler) {
			var oThis = this;
			var sEventType = sEventSelector = '';
			for (var sKey in oEventType) {
				sEventType = sKey;
				sEventSelector = oEventType[sEventType];
				break;
			}
			(function(sEventSelector) {
				oThis.add(oElement, sEventType, function(oEvent) {
					var oSender = oEvent.target;
					if (jgen.Selector.queryAncestor(oSender, sEventSelector)) {
						fEventHandler.call(oSender, oEvent);
					}
				});
			})(sEventSelector);
		}
	}
	
});
