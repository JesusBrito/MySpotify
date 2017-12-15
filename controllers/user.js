'use strict'
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var jwt = require('../services/jwt');
function pruebas(req, res){
	res.status(200).send({
		message:'Probando una acción del controlador de usuarios'
	});
}

function saveUser(req,res){
	var user = new User();
	var params = req.body;
	console.log(params);
	user.name= params.name;
	user.surname= params.surname;
	user.email= params.email;
	user.role= 'ROLE_ADMIN';
	user.image= 'null';

	if(params.password){
		bcrypt.hash(params.password,null,null, function(err,hash){
			user.password=hash;
			if(user.name!= null && user.surname!=null && user.email!=null){
				//Guardar usuario en la bd 
				user.save((err,userStored)=>{
					if (err){
						res.status(500).send({message:'Error al registrar en la BD'});
					}else if(!userStored){
						res.status(404).send({message:'No se ha registrado el usuario'});
					}else {
						res.status(200).send({user:userStored});
					}
				});
			}else {
				// Si faltan datos envía mensaje
				res.status(200).send({message:'Llena todos los campos'});
			}
		});
	}else{
		res.status(200).send({message:'Introduce la contraseña'});
	}
}

function loginUser(req,res){
	var params = req.body;
	var email= params.email;
	var password = params.password;

	User.findOne({email:email.toLowerCase()}, (err,user)=>{
		if (err){
			res.status(500).send({message:'Error en la petición'});
		}else if(!user){
				res.status(404).send({message:'El usuario no existe'});
			
		}else{
			//Comprobando contraseña 
			bcrypt.compare(password, user.password, (err, check )=>{
				if (check){
					//devolvemos el usuario
					if(params.gethash){
						// devolver un token 
						res.status(200).send({
							token: jwt.createToken(user)
						});
					}else{
						res.status(200).send({user});
					}
				}else {
					res.status(404).send({message:'El usuario no se ha podido logguear'});
				}
			});
		}
	});
}

module.exports= {
	pruebas,
	saveUser,
	loginUser
}