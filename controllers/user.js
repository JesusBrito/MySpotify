'use strict'
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var jwt = require('../services/jwt');
var fs = require('fs');
var path = require('path');

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

function updateUser(req, res){
	var userId = req.params.id;
	var update = req.body;

	if(userId!=req.user.sub){
		res.status(500).send({message:'No tienes permiso para actualizar este usuario'});
	}else{
		User.findByIdAndUpdate(userId, update, (err, userUpdated)=>{
			if (err){
				res.status(500).send({message:'Error al actualizar el usuario'});
			}else if(!userUpdated){
				res.status(404).send({message:'No se ha podido actualizar el usuario'});	
			}else{
				res.status(200).send({user:userUpdated});	
			}
		});
	}
}

function uploadImage(req, res){
	var userId = req.params.id;
	var file_name = 'No subido...';

	if (req.files){
		var file_path = req.files.image.path;
		var file_split = file_path.split('/');
		var file_name = file_split[2];

		var ext_split = file_name.split('.');
		var file_ext = ext_split[1];

		
		if (file_ext=='png'||file_ext=='jpg'|| file_ext=='gif'){

			User.findByIdAndUpdate(userId,{image: file_name}, (err, userUpdated)=>{
				if (err){
					res.status(500).send({message:'Error al actualizar el usuario'});
				}else if(!userUpdated){
					res.status(404).send({message:'No se ha podido actualizar el usuario'});	
				}else{
					res.status(500).send({image: filename, user:userUpdated});	
				}
			});

		}else{
			res.status(200).send({message: 'Extensión no valida'});
		}
	}else{
		res.status(200).send({message: 'No se ha cargado ninguna imagen'});
	}
}

function getImageFile(req,res){
	var imageFile= req.params.imageFile;
	var path_file= './uploads/users/'+imageFile;
	fs.exists(path_file, function(exists){
		if(exists){
			res.sendFile(path.resolve(path_file));
		}else{
			res.status(200).send({message: 'No existe la imagen...'});
		}
	});
}

module.exports= {
	pruebas,
	saveUser,
	loginUser,
	updateUser,
	uploadImage,
	getImageFile
}