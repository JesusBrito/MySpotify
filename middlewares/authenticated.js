'use strict'

var jwt= require('jwt-simple');
var moment= require('moment');
var secret = 'clave_secreta_curso';

exports.ensureAuth = function(req, res, next){
	if(!req.headers.authorization){
		return res.status(403).send({message:'La peticion no tiene la cabecera de autenticación'});
	}else {
		var token = req.headers.authorization.replace(/['"]+/g,'');
		try {
			var payload= jwt.decode(token, secret);
			if (payload.ex<=moment.unix()){
				return res.status(401).send({message:'Token ha expirado'});
			}
		} catch(e) {
			// statements
			console.log(e);
			return res.status(403).send({message:'Token no valido'});
		}

		req.user= payload;

		next();
	}
};