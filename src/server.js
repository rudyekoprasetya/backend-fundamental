//inport file env
require('dotenv').config();

const Hapi = require('@hapi/hapi');
// import routes

//import jwt
const Jwt = require('@hapi/jwt');
// const routes = require('./routes');
//import notes
const notes = require('./api/notes');

//untuk upload
const path = require('path');

//plugin inert
const Inert = require('@hapi/inert');

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

// Exports
const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports');

// uploads
const uploads = require('./api/uploads');
const StorageService = require('./services/storage/StorageService');
const UploadsValidator = require('./validator/uploads');

const init = async() =>{
	// instance collaborations
	const collaborationsService = new CollaborationsService();
	const notesService = new NotesService(collaborationsService);
	//instance users
	const usersService = new UsersService();
	//instance auth
	const authenticationsService = new AuthenticationsService();
	//storage
	const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/images'));
	

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
		{
		  plugin: Inert,
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
			  service: notesService,
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
			  notesService,
			  validator: CollaborationsValidator,
			},
		},
		{
			plugin: _exports,
			options: {
			  service: ProducerService,
			  validator: ExportsValidator,
			},
		},
		{
			plugin: uploads,
			options: {
			  service: storageService,
			  validator: UploadsValidator,
			},
		}	  
	]);

	await server.start();
	console.log(`Server run at ${server.info.uri}`);

}

init();