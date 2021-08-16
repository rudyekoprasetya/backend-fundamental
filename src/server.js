const Hapi = require('@hapi/hapi');
// import routes
// const routes = require('./routes');
//import notes
const notes = require('./api/notes');
//import service
const NotesService = require('./services/inMemory/NotesService');

const init = async() =>{
	const noteService = new NotesService();

	const server = Hapi.server({
		port: 5000,
		host: process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0',
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
			service: noteService
		}
	});

	await server.start();
	console.log(`Server run at ${server.info.uri}`);

}

init();