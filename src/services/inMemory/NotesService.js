const {nanoid} = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class NotesService {
    constructor(){
        this._notes=[];
    }

    //tambah data
    addNote({title, body, tags}) {
        // generate id
        const id = nanoid(16);
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;

        //memasukan ke array
        const newData = {
            title, tags, body, id, createdAt, updatedAt
        };

        this._notes.push(newData);

        //konfirmasi
        const isSuccess = this._notes.filter((note)=>note.id===id).length>0;

        if(!isSuccess) {
            // throw new Error('Catatan gagal ditambahkan');
            // ubah menjadi InvariantError
            throw new InvariantError('Catatan gagal ditambahkan');
        }

        return id;
    }

    // tampil data
    getNotes() {
        return this._notes;
    }

    //cari data
    getNotesById(id) {
        //filter
        const note = this._notes.filter((n) => n.id === id)[0];

        //konfirmasi
        if(!note) {
            // throw new Error('Catatan tidak ditemukan');
            throw new NotFoundError('Catatan tidak ditemukan');
        }

        return note;
    }

    //ubah data
    editNoteById(id, {title, body, tags}) {
        const updatedAt=new Date().toISOString();

        //ubah datanya sesuai dengan id
        const index = this._notes.findIndex((note) =>note.id===id);

        //cek
        if(index === -1) {
            // throw new Error('Gagal memperbarui catatan. Id tidak ditemukan');
            throw new NotFoundError('Gagal memperbarui catatan. Id tidak ditemukan');
        }

        this._notes[index] ={
			...this._notes[index],
			title,
			tags,
			body,
			updatedAt
		};
    }

    deleteNoteById(id) {
        //cek
        const index = this._notes.findIndex((note) =>note.id===id);

        if(index===-1) {
            // throw new Error('Catatan gagal dihapus, Id tidak ditemukan');
            throw new NotFoundError('Catatan gagal dihapus, Id tidak ditemukan');
        }

        //hapus data
        this._notes.splice(index,1);
    }
}

module.exports = NotesService;