

const model = require('./model');
const {log, biglog, errorlog, colorize} = require("./out");

/**
* Muestra la ayuda
*
* @param rl Objetivo readline usado para implementar el CLI.
*/
exports.helpCmd = rl => {
	log("Commandos");
    log(" h|help - Muestra esta ayuda.");
    log(" list - Listar los quizzes existentes.");
    log(" show <id> - Muestra la pregunta y la respuesta el quiz indicado.");
    log(" add - Añadir un nuevo quiz interactivamente.");
    log(" delete <id> - Borrar el quiz indicado.");
    log(" edit <id> - Editar el quiz indicado.");
    log(" test <id> - Probar el quiz indicado.");
    log(" p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
    log(" credits - Créditos.");
    log(" q|quit - Salir del programa.");
    rl.prompt();
};

/**
* Lista todos los quizzes existentes en el modelo
*
* @param rl Objeto readline usado para implementar el CLI.
*/
exports.listCmd = rl => {
	model.getAll().forEach((quiz, id) => {

		log(` [${colorize(id, 'magenta')}]: ${quiz.question} `);
	});
	rl.prompt();
};

/**
* Muestra el quiz indicador en el parámetro: la pregunta y la respuesta.
*
* @param rl Objeto readline usado para implementar el CLI.
* @param id Clave del quiz a mostrar
*/
exports.showCmd = (rl, id) => {
	if(typeof id === "undefined"){
		errorlog('Falta el parámetro id.');
	}else {
		try{
			const quiz = model.getByIndex(id);
			log(` [${colorize(id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer} `)
		}catch(error){
			errorlog(error.message);
		}
	}
	rl.prompt();
};

/**
* Añade un nuevo quiz al modelo.
*Pregunta interactivamente por la pregunta y por la respuesta.
*
*Hay que recordar que el funcionamiento de la funcion rl.question es asíncrono.
*El prompt hay que sacarlo cuando ya se ha terminado la interacción con el usuario,
*es decir, la llamada a rl.prompt() se debe hacer en la callback de la segunda
*llamada a rl.question.
*
* @param rl Objeto readline usado para implementar el CLI.
*/
exports.addCmd = rl => {
	rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {
		rl.question(colorize(' Introduzca la respuesta ', 'red'), answer => {
			model.add(question, answer);
			log(` ${colorize('Se ha añadido', 'magenta')}: ${question} ${colorize('=>', 'magenta')} ${answer} `);
			rl.prompt();
		});
	});
	
};

/**
* Borra un quiz del modelo.
*
* @param rl Objeto readline usado para implementar el CLI.
* @param id Clave del quiz a borrar en el modelo.
*/
exports.deleteCmd = (rl, id) => {
	if(typeof id === "undefined"){
		errorlog('Falta el parámetro id.');
	}else {
		try{
			model.deleteByIndex(id);
		}catch(error){
			errorlog(error.message);
		}
	}
	rl.prompt();
};

/**
* Borra un quiz del modelo.
*
* @param rl Objeto readline usado para implementar el CLI.
* @param id Clave del quiz a borrar en el modelo.
*/
exports.editCmd = (rl, id) => {
if(typeof id === "undefined"){
		errorlog('Falta el parámetro id.');
	}else {
		try{
			const quiz = model.getByIndex(id);

			process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)}, 0);
			rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {
				
				process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)}, 0)
				
				rl.question(colorize(' Introduzca la respuesta ', 'red'), answer => {
					
					model.update(id, question, answer);
					log(` Se ha cambiado el quiz ${colorize(id, 'magenta')} por: ${question} ${colorize('=>', 'magenta')} ${answer} `);
					rl.prompt();
				});
			});
		}catch(error){
			errorlog(error.message);
		}
	}
};

/**
* Borra un quiz del modelo.
*
* @param rl Objeto readline usado para implementar el CLI.
* @param id Clave del quiz a borrar en el modelo.
*/
exports.testCmd = (rl, id) => {
	if(typeof id === "undefined"){
		errorlog('Falta el parámetro id.');
		rl.prompt();
	}else {
		try{
			const quiz = model.getByIndex(id);
			rl.question(`${colorize(quiz.question + '?', 'red')} `, answer => {     
                if(answer.toUpperCase().trim() === quiz.answer.toUpperCase().trim()){
                    log("Su respuesta es correcta.");
                    biglog('CORRECTA','green');
                }else{
					log('Su respuesta es incorrecta.');
					biglog('INCORRECTA', 'red');
				}
				rl.prompt();
			});
		}catch(error){
			errorlog(error.message);
			rl.prompt();
		}
	}
};

/**
* Pregunta todos los quizzes existentes en el modelo en orden aleatorio.
* Se gana si se contesta a todos satisfactoriamente.
*
* @param rl Objeto readline usado para implementar el CLI.
*/
exports.playCmd = rl => {
	let score = 0
	let toBeResolved = [];

	for(let i=0; i<model.count(); i++){
		toBeResolved[i]=i;
		}

	const playStart = () =>{
		if(toBeResolved.length === 0){
			log("Se han acabado las preguntas");
			log("Fin del juego. Aciertos:");
			biglog(score, 'magenta');
			rl.prompt();
		}else{
			let id = toBeResolved[Math.floor((Math.random() * toBeResolved.length))];
			let quiz = model.getByIndex(id);
			toBeResolved.splice(toBeResolved.indexOf(id), 1);
			rl.question(`${colorize(quiz.question + '?', 'red')} `, answer => {     
                if(answer.toUpperCase().trim() === quiz.answer.toUpperCase().trim()){
                    score++;

                    log("CORRECTO - Lleva " + score + " aciertos.");
                    biglog('CORRECTA','green');
                    playStart();
                }else{
					log('INCORRECTO');
					log('Fin del juego. Aciertos:');
					biglog(score, 'magenta');
				}
				rl.prompt();
			});
		}
	};
	playStart();
};

/**
* Muestra los nombres de los autores de la práctica.
*
* @param rl Objeto readline usado para implementar el CLI.
*/
exports.creditsCmd = rl => {
    log('Autores de la práctica:');
    log('Isabel Rodríguez Ruiz', 'green');
    log('Jorge Calatayud Maeso', 'green');
    rl.prompt();
};

/**
* Terminar el programa.
*
* @param rl Objeto readline usado para implementar el CLI.
*/
exports.quitCmd = rl => {
	rl.close();
};