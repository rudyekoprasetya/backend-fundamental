const Jwt = require('@hapi/jwt');
const InvariantError = require('../exceptions/InvariantError');

// const TokenManager = {
//     generateAccessToken(payload) {
//         //kembalikan generate token
//         return Jwt.token.generate(payload, process.env.ACCESS_TOKEN_KEY);
//     } 
// };

const TokenManager = {
    //generate token
    generateAccessToken: (payload) => Jwt.token.generate(payload, process.env.ACCESS_TOKEN_KEY),
    //generate refresh token
    generateRefreshToken: (payload) => Jwt.token.generate(payload, process.env.REFRESH_TOKEN_KEY),
    //verifikasi refresh token
    verifyRefreshToken: (refreshToken) => {
        try {
            const artifacts = Jwt.token.decode(refreshToken);
            Jwt.token.verifySignature(artifacts, process.env.REFRESH_TOKEN_KEY);
            const { payload } = artifacts.decoded;
            return payload;
        } catch (error) {
            throw new InvariantError('Refresh token tidak valid');
        }
    },

};
 
module.exports = TokenManager;