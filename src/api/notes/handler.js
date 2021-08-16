class NotesHandler {
    constructor(service) {
        this._service=service;

        // mengikat this agar nilainya tetap mengacu ke class 
        this.postNoteHandler=this.postNoteHandler.bind(this)
        this.getNotesHandler=this.getNotesHandler.bind(this)
        this.getNoteByIdHandler=this.getNoteByIdHandler.bind(this)
        this.putNoteHandler=this.putNoteHandler.bind(this)
        this.deleteNoteByIdHandler=this.deleteNoteByIdHandler.bind(this)

    }

    postNoteHandler(req,h){
        try {
            const {title = 'untitled', body, tags} =req.payload;
            const noteId = this._service.addNote({title, body,tags});
            const res = h.response({
                status: 'success',
                message: 'Catatan berhasil ditambahkan',
                data: {
                    noteId,
                }
            });
            res.code(201);
            return res;
        } catch (error) {
            const res=h.response({
                status: 'fail',
                message: error.message
            });
            res.code(500);
            return res;
        }
    }

    getNotesHandler() {
        const notes = this._service.getNotes();
        return {
            status: 'success',
            data: {
                notes
            }
        }
    }

    getNoteByIdHandler(req,h) {
        try { 
            const { id } = req.params;
            const note = this._service.getNotesById(id);
            return {
                status: 'success',
                data: {
                    note
                }
            }
        } catch(error) {
            const res=h.response({
                status: 'fail',
                message: error.message
            });
            res.code(404);
            return res;
        }  
    }

    putNoteHandler(req,h){
        try{
            const { id } = req.params;

            //update
            this._service.editNoteById(id, req.payload);

            return {
                status : 'success',
                message : 'Catatan berhasil diubah'
            }
        } catch(error) {
            const res=h.response({
                status: 'fail',
                message: error.message
            });
            res.code(404);
            return res
        }
        
    }

    deleteNoteByIdHandler(req,h){
        try{
            const {id} = req.params;
            this._service.deleteNoteById(id);
            const res=h.response({
                status: 'success',
                message: 'Catatan berhasil dihapus'
            });
            res.code(200);
            return res;
        } catch(error) {
            const res=h.response({
                status: 'fail',
                message: error.message
            });
            res.code(404);
            return res;
        }
    }
}

module.exports = NotesHandler;