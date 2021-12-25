const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
 
class CollaborationsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService=cacheService;
  }
 
  //tambah collaborator
  async addCollaboration(noteId, userId) {
    const id = `collab-${nanoid(16)}`;
 
    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, noteId, userId],
    };
 
    const result = await this._pool.query(query);
 
    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal ditambahkan');
    }

    //hapus cache
    await this._cacheService.delete(`notes:${userId}`);
    return result.rows[0].id;
  }

  //hapus collaborator
  async deleteCollaboration(noteId, userId) {
    const query = {
      text: 'DELETE FROM collaborations WHERE note_id = $1 AND user_id = $2 RETURNING id',
      values: [noteId, userId],
    };
 
    const result = await this._pool.query(query);
 
    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal dihapus');
    }

    //hapus cache
    await this._cacheService.delete(`notes:${userId}`);
  }

//   verifikasi collaborator
  async verifyCollaborator(noteId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE note_id = $1 AND user_id = $2',
      values: [noteId, userId],
    };
 
    const result = await this._pool.query(query);
 
    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal diverifikasi');
    }
  }
}

module.exports=CollaborationsService;