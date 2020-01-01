const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Please tell us your name'], 
        // validate: [validator.notEmpty, 'Name is empty']
    },
    email: { 
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: [true, 'Email address is required'],
        validate: [validator.isEmail, 'Please enter a valid email']
        // match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    picture: { 
        type: String
    },
    password: {
        type: String,
        trim: true,
        required: [true, 'A user must have a password'],
        maxlength: [30, 'Password should be less or equal then 30 characters'],
        minlength: [8, 'Password must have more or equal then 8 characters'] 
    },
    confirmPassword: {
        type: String,
        trim: true,
        validate: {
            validator: function (el) {
                return el === this.password
            },
            message: 'Passowrd mismatch'
        }
        // validate: [validator.equals(password, confirmPassword), 'Password mismatch']
    }
})

userSchema.pre('save', async function (next) {
    if(!this.isModified('password')) return next()
    
    this.password = await bcrypt.hash(this.password, 12)
    this.confirmPassword = undefined

})

const User = mongoose.model('User', userSchema);

module.exports = User;
