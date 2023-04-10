var mongoose = require('mongoose');
const bcrypt = require('bcrypt')
var Schema = mongoose.Schema;

var userSchema = new Schema({
    usuario: String,
    senha: String,
    nome: String,
    nome_artigo: String
}, {collection: 'users'});

userSchema.pre('save', async (next) => {
    const user = this;
    if(user.isModified('password')){
        const hash = await bcrypt.hash(user.password, 10);
        user.password = hash;
    }
    next();
})

var Users = mongoose.model("Users", userSchema);

module.exports = Users;