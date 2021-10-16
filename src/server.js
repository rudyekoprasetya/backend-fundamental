//inport file env
require('dotenv').config();

const Hapi = require('@hapi/hapi');
// import routes

//import jwt
const Jwt = require('@hapi/jwt');
// const routes = require('./routes');
//import notes
const notes = require('./api/notes');
//import service
// const NotesService = require('./services/inMemory/NotesService');
//database
const NotesService = require('./services/postgres/NotesService');
//import validator Joi
const NotesValidator = require('./validator/notes');

//users
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

// authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

// collaborations
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const CollaborationsValidator = require('./validator/collaborations');

const init = async() =>{
	// instance collaborations
	const collaborationsService = new CollaborationsService();
	const noteService = new NotesService(collaborationsService);
	//instance users
	const usersService = new UsersService();
	//instance auth
	const authenticationsService = new AuthenticationsService();
	

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

	// registrasi plugin eksternal
	await server.register([
		{
		  plugin: Jwt,
		},
	]);

	// mendefinisikan strategy autentikasi jwt
	server.auth.strategy('notesapp_jwt', 'jwt', {
		keys: process.env.ACCESS_TOKEN_KEY,
		verify: {
		  aud: false,
		  iss: false,
		  sub: false,
		  maxAgeSec: process.env.ACCESS_TOKEN_AGE,
		},
		validate: (artifacts) => ({
		  isValid: true,
		  credentials: {
			id: artifacts.decoded.payload.id,
		  },
		}),
	});

	//register plugin
	await server.register([
		{
			plugin: notes,
			options: {
			  service: noteService,
			  validator: NotesValidator,
			},
		},
		{
			plugin: users,
			options: {
			  service: usersService,
			  validator: UsersValidator,
			},
		},
		{
			plugin: authentications,
			options: {
			  authenticationsService,
			  usersService,
			  tokenManager: TokenManager,
			  validator: AuthenticationsValidator,
			},
		},
		{
			plugin: collaborations,
			options: {
			  collaborationsService,
			  noteService,
			  validator: CollaborationsValidator,
			},
		},
	]);

	await server.start();
	console.log(`Server run at ${server.info.uri}`);

}

init();