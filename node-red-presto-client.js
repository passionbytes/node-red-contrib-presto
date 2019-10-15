module.exports = function(RED) {
	var presto = require('presto-client');
	var prestoClient;
	var query;
	
	var options = {
		user: '',
		host: '',
		port: 8080,
		catalog: 'hive',	// defaults
		schema:  'default',	// defaults
		source:  'nodejs-client'
	};
	
	function SetConfig(config){
		options.user = config.username || '';
		options.host = config.host || 'localhost';
		options.port = config.port || 8080;
		
		if (config.username && config.password){
			options.basic_auth = options.basic_auth || {};
			options.basic_auth.user = config.username;
			options.basic_auth.password = config.password;
		}
		
		if (config.ca){
			options.ssl = options.ssl || {};
			options.ssl.ca = config.ca || '';
			options.ssl.rejectUnauthorized = (config.rejectUnauthorized == "true");
		}
	}
	
    function PrestoClient(config) {
		var node = this;
        RED.nodes.createNode(this,config);		
		SetConfig(config);
		
		this.query = config.query;
		
		node.on('input', function(msg, send, done) {
			node.log('input event started');
		
			prestoClient = new presto.Client(options);
			
			prestoClient.execute({
				query: node.query,
				
				data: function(error, data, columns, stats){ 
					//console.log( {stats: stats} );
					msg.payload = data;
					node.send(msg);
				},
				success: function(error, stats){
					//console.log(stats)
				},
				error:   function(error){
					node.error(error)
				}
			});

			// Once finished, call 'done'.
			// This call is wrapped in a check that 'done' exists
			// so the node will work in earlier versions of Node-RED (<1.0)
			if (done) {
				done();
			}
			
			node.log('input event ended');
		});
        
    }
    RED.nodes.registerType("prestoClient", PrestoClient);	
}