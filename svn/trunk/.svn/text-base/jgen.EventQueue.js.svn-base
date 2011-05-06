jsface.namespace("jgen");

jsface.def({
	$meta: {
		name: "EventQueue",
		namespace: jgen
	},
	
	events: [],
	keys: {},
	mouse: {},
	
	EventQueue: function(viewPort) {
		this.viewPort = viewPort;
	},
	
	getViewPort: function() {
		return this.viewPort;
	},
	
	start: function(fCallBack, iDelay) {
		var oThis = this;
		document.addEventListener('keydown', function(oEvent) {
			oThis.keys[oEvent.keyCode] = true;
		});
		document.addEventListener('keyup', function(oEvent) {
			oThis.keys[oEvent.keyCode] = false;
		});
		document.addEventListener('mousemove', function(oEvent) {
			oThis.mouse.x = oEvent.pageX;
			oThis.mouse.y = oEvent.pageY;
		});
		setInterval(function() { fCallBack.call(oThis); }, iDelay);
	},
	
	addCallBack: function(oSender, fCallBack, iSkipFrames) {
		this.events.push([oSender, fCallBack, iSkipFrames ? iSkipFrames : 0, ]);
	},
	
	addEvent: function(oSender, oProperties) {
		this.events.push([oSender, function() {
			jgen.HTML.setStyle(this, oProperties);
		}, 0]);
	},
	
	processEvents: function() {
		for (var iLength = this.events.length, c = 0; c < iLength; c++) {
			var oEvent = this.events[c];
			if (oEvent[2] > 0) {
				oEvent[2]--;
				this.events.push(oEvent);
			} else oEvent[1].call(oEvent[0]);
		}
		this.events.splice(0, iLength);
	}
	
});
