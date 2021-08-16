const routes = (handler) => [
    {
            method: 'POST',
            path: '/notes',
            handler:handler.postNoteHandler
    },
    {
            method: 'GET',
            path: '/notes/{id}',
            handler:handler.getNoteByIdHandler
    },
    {
            method: 'PUT',
            path: '/notes/{id}',
            handler:handler.putNoteHandler
    },
    {
            method: 'DELETE',
            path: '/notes/{id}',
            handler:handler.deleteNoteByIdHandler
    },
    {
            method: 'GET',
            path: '/notes',
            handler:handler.getNotesHandler
    }
];

module.exports = routes;