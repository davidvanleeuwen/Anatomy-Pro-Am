util.sync = function(){
	Backbone.sync = function(method, model, success, error) {
		var resp;
		
		if(model instanceof Backbone.Model) {
			console.log('model == Backbone.Model');
		}
		
		if(model instanceof Backbone.Collection) {
			console.log('model == Backbone.Collection');
		}
		
		console.log(model);
		
		switch (method) {
			case "read":    resp = model.id ? remote.find(model) : remote.findAll();	break;
			case "create":  resp = remote.create(model);								break;
			case "update":  resp = remote.update(model);								break;
			case "delete":  resp = remote.destroy(model);								break;
		}
		
		if (resp) {
			console.log(resp);
			//success(resp);
		} else {
			error("Record not found");
		}
	};
};