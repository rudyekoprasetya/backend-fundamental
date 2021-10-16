const ClientError = require('../../exceptions/ClientError')

class UserHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        this.postUserHandler = this.postUserHandler.bind(this);
        this.getUserByIdHandler = this.getUserByIdHandler.bind(this);
        this.getUsersByUsernameHandler = this.getUsersByUsernameHandler.bind(this);
    }

    //fungsi simpan
    async postUserHandler(req, h) {
        try {
            //validasi
            this._validator.validateUserPayload(req.payload);
            const {username, password, fullname} = req.payload;

            const userId = await this._service.addUser({username, password, fullname});

            const res = h.response({
                status: 'success',
                message: 'User berhasil ditambahkan',
                data: {
                    userId
                }            
            });
            res.code(201);
            return res;
        } catch(error) {
            if(error instanceof ClientError) {
                const res = h.response({
                    status: 'fail',
                    message: error.message
                });

                res.code(error.statusCode);
                return res;
            }

            //server error
            const res = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.'
            });
            res.code(500);
            console.log(error);
            return res;
        }
    }

    //fungsi tampi data
    async getUserByIdHandler(req, h) {
        try {
            //ambil id
            const { id } = req.params;
            //ambil data dari database
            const user = await this._service.getUserById(id);

            return {
                status: 'success',
                data: {
                    user
                }
            }
        } catch(error) {
            if (error instanceof ClientError) {
                const res = h.response({
                  status: 'fail',
                  message: error.message,
                });
                res.code(error.statusCode);
                return res;
            }

            const res = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            res.code(500);
            console.error(error);
            return res;
        }
    }
    async getUsersByUsernameHandler(req, h) {
        try {
          const { username = '' } = req.query;
          const users = await this._service.getUsersByUsername(username);
          return {
            status: 'success',
            data: {
              users,
            },
          };
        } catch (error) {
          if (error instanceof ClientError) {
            const response = h.response({
              status: 'fail',
              message: error.message,
            });
            response.code(error.statusCode);
            return response;
          }
     
          // Server ERROR!
          const response = h.response({
            status: 'error',
            message: 'Maaf, terjadi kegagalan pada server kami.',
          });
          response.code(500);
          console.error(error);
          return response;
        }
    }
}

module.exports = UserHandler;