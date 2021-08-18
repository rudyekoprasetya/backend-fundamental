//inport file env
require('dotenv').config();

const Hapi = require('@hapi/hapi');
// import routes
// const routes = require('./routes');
//import notes
const notes = require('./api/notes');
//import service
// const NotesService = require('./services/inMemory/NotesService');
//database
const NotesService = require('./services/postgres/NotesService');
//import validator Joi
const NotesValidator = require('./validator/notes');

const init = async() =>{
	const noteService = new NotesService();

	const server = Hapi.server({
		// port: 5000,
		// host: process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0',
		// ambil dari file .env 
		port:  process.env.PORT,
		host:  process.env.HOST,
		routes: {
			cors: {
				origin: ['*']
			}
		}
	});

	//routes config
	// server.route(routes);

	//register plugin
	await server.register({
		plugin: notes,
		options: {
			service: noteService,
			//tambakan validator
			validator: NotesValidator
		}
	});

	await server.start();
	console.log(`Server run at ${server.info.uri}`);

}

init();