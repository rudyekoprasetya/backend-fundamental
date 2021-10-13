const { nanoid } = require('nanoid');
const {Pool} = require('pg');
//import mapping db
const {mapDBToModel} = require('../../utils');
//import authorization Error
const AuthorizationError = require('../../exceptions/AuthorizationError');
const NotFoundError = require('../../exceptions/NotFoundError');

class NotesService {
    constructor() {
        this._pool = new Pool();
    }

    //untuk tambah data dalam database
    async addNote({title, body, tags, owner}) {
        //membuat ID dan tanggal otomatis
        const id = nanoid(16);
        const createAt = new Date().toISOString;
        const updatedAt = createAt;

        //query insert
        const query = {
            text: 'INSERT INTO notes VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            values: [id, title, body, tags, createAt, updatedAt, owner],
        }

        //eksekusi query
        const res = await this._pool.query(query);

        //validasi
        if(!res.rows[0].id) {
            throw new InvariantError('Catatan gagal ditambahkan');
        }

        //kembalikan nilai
        return res.rows[0].id;
    }

    //tampil data
    async getNotes(owner) {
        // const query = 'SELECT * FROM notes';
        const query = {
            text: 'SELECT * FROM notes WHERE owner = $1',
            values: [owner],
        };
        const res = await this._pool.query(query);
        //kembalikan dengan Mapping
        return res.rows.map(mapDBToModel);
    }

    //cari data
    async getNoteById(id) {
        const query={
            text: 'SELECT * FROM notes WHERE id = $1',
            values: [id]
        }

        const res = await this._pool.query(query);

        //jika tidak ketemu atau hasilnya 0
        if(!res.rows.length) {
            throw new NotFoundError('Catatan tidak ditemukan');
        }

        //kembalikan hasil
        return res.rows.map(mapDBToModel)[0];
    }

    // ubah data 
    async editNoteById(id, {title, body, tags}) {
        const updatedAt = new Date().toISOString;
        const query = {
            text: 'UPDATE notes SET title=$1, body=$2, tags=$3, updated_at=$4 WHERE id = $5 RETURNING id',
            values: [title, body, tags, updatedAt, id]
        }

        const res = await this._pool.query(query);

        //cek 
        if (!res.rows.length) {
            throw new NotFoundError('Gagal memperbarui catatan. Id tidak ditemukan');
        }
    }

    //hapus data
    async deleteNoteById(id) {
        const query = {
            text: 'DELETE FROM notes WHERE id = $1 RETURNING id',
            values: [id]
        }

        const res = await this._pool.query(query);

        //cek
        if (!res.rows.length) {
            throw new NotFoundError('Catatan gagal dihapus. Id tidak ditemukan');
        }
    }

    //verifikasi
    async verifyNoteOwner(id, owner) {
        const query = {
          text: 'SELECT * FROM notes WHERE id = $1',
          values: [id],
        };
        const result = await this._pool.query(query);
        if (!result.rows.length) {
          throw new NotFoundError('Catatan tidak ditemukan');
        }
        const note = result.rows[0];
        if (note.owner !== owner) {
          throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
        }
    }
}

module.exports = NotesService;