const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
require('dotenv').config()

const mongoURL = process.env.MONGO_URL;
mongoose.connect(mongoURL)
    .then(()=> console.log("Database connected"))
    .catch((err)=> console.log(err))


const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30
    },
    password: {
        type: String,
        required: true,
        minLength: 6,
    },
    firstname:{
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },

    lastname: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    }
})

const User = mongoose.model('User', UserSchema)


const AccountSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    balance:{
        type: Number,
        required: true
    }
})

const Account = mongoose.model('Account', AccountSchema)

module.exports = {
    User,
    Account ,
}