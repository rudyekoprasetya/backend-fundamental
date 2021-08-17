const NotesHandler = require('./handler');
const routes = require('./router');

module.exports = {
    name: 'notes',
    version: '1.0.0',
    register: async(server, {service, validator}) => {
        //instance handler
        const notesHandler = new NotesHandler(service, validator);
        //atur route
        server.route(routes(notesHandler))
    }
}