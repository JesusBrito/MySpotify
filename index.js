'use strinct'

var mongoose = require('mongoose');
var app= require('./app')
var port= process.env.PORT|| 3977;

mongoose.connect('mongodb://localhost:27017/dbSpotify',{ useMongoClient: true },(err,res)=>{
	if (err){
		throw err;
	}else {
		console.log('La conexión a la bd esta funcionando bien');
		app.listen(port, function(){
			console.log('Servidor del api rest de musica escuchando en http://localhost:'+port);
		})
	}
});
