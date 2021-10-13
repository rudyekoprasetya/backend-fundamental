const ClientError = require("../../exceptions/ClientError");

class NotesHandler {
    constructor(service, validator) {
        this._service=service;
        this._validator=validator;

        // mengikat this agar nilainya tetap mengacu ke class 
        this.postNoteHandler=this.postNoteHandler.bind(this)
        this.getNotesHandler=this.getNotesHandler.bind(this)
        this.getNoteByIdHandler=this.getNoteByIdHandler.bind(this)
        this.putNoteHandler=this.putNoteHandler.bind(this)
        this.deleteNoteByIdHandler=this.deleteNoteByIdHandler.bind(this)

    }

    async postNoteHandler(req,h){
        try {
            // memasukan validator di handler post 
            this._validator.validateNotePayload(req.payload);
            const {title = 'untitled', body, tags} =req.payload;
            //ambil id credential
            const { id: credentialId } = req.auth.credentials;

            const noteId = await this._service.addNote({title, body,tags,credentialId});

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
            // const res=h.response({
            //     status: 'fail',
            //     message: error.message
            // });
            // res.code(400);
            // return res;
            if(error instanceof ClientError) {
                const res = h.response({
                    status: 'fail',
                    message: error.message
                });
                res.code(error.statusCode);
                return res;
            }

            //server Error
            const res = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.'
            });
            res.code(500);
            console.log(error);
            return res;
        }
    }

    async getNotesHandler(req,h) {
        //ambil credential id
        const { id: credentialId } = req.auth.credentials;
        const notes = await this._service.getNotes(credentialId);
        return {
            status: 'success',
            data: {
                notes
            }
        }
    }

    async getNoteByIdHandler(req,h) {
        try { 
            const { id } = req.params;
            //ambil credential id
            const { id: credentialId } = req.auth.credentials;

            await this._service.verifyNoteOwner(id, credentialId);
            const note = await this._service.getNoteById(id);
            return {
                status: 'success',
                data: {
                    note
                }
            }
        } catch(error) {
            // const res=h.response({
            //     status: 'fail',
            //     message: error.message
            // });
            // res.code(404);
            // return res;
            if(error instanceof ClientError) {
                const res = h.response({
                    status: 'fail',
                    message: error.message
                });
                res.code(error.statusCode);
                return res;
            }

            //server Error
            const res = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.'
            });
            res.code(500);
            console.log(error);
            return res;
        }  
    }

    async putNoteHandler(req,h){
        try{
            //membuat validator untuk update data
            this._validator.validateNotePayload(req.payload);
            const { id } = req.params;
            //ambil id credential
            const { id: credentialId} = req.auth.credentials;

            await this._service.verifyNoteOwner(id, credentialId);
            //update
            await this._service.editNoteById(id, req.payload);

            return {
                status : 'success',
                message : 'Catatan berhasil diperbarui'
            }
        } catch(error) {
            // const res=h.response({
            //     status: 'fail',
            //     message: error.message
            // });
            // res.code(404);
            // return res
            if(error instanceof ClientError) {
                const res = h.response({
                    status: 'fail',
                    message: error.message
                });
                res.code(error.statusCode);
                return res;
            }

            //server Error
            const res = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.'
            });
            res.code(500);
            console.log(error);
            return res;
        }
        
    }

    async deleteNoteByIdHandler(req,h){
        try{
            const {id} = req.params;
            //ambil creadential id
            const { id: credentialId } = req.auth.credentials;

            await this._service.verifyNoteOwner(id, credentialId);
            await this._service.deleteNoteById(id);
            const res=h.response({
                status: 'success',
                message: 'Catatan berhasil dihapus'
            });
            res.code(200);
            return res;
        } catch(error) {
            // const res=h.response({
            //     status: 'fail',
            //     message: error.message
            // });
            // res.code(404);
            // return res;
            if(error instanceof ClientError) {
                const res = h.response({
                    status: 'fail',
                    message: error.message
                });
                res.code(error.statusCode);
                return res;
            }

            //server Error
            const res = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.'
            });
            res.code(500);
            console.log(error);
            return res;
        }
    }
}

module.exports = NotesHandler;