const crypto = require('crypto');
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
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    photo: { 
        type: String
    },
    password: {
        type: String,
        trim: true,
        required: [true, 'A user must have a password'],
        maxlength: [30, 'Password should be less or equal then 30 characters'],
        minlength: [8, 'Password must have more or equal then 8 characters'],
        select: false 
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
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    isActive: {
        type: String,
        default: true,
        select: false
    }
})

userSchema.pre('save', async function (next) {
    if(!this.isModified('password')) return next()
    
    this.password = await bcrypt.hash(this.password, 12)
    this.confirmPassword = undefined
    next()
})

userSchema.pre('save', function(next) {
    if(!this.isModified('password') || !this.isNew) return next()

    this.passwordChangedAt = Date.now() - 1000
    next()
})

userSchema.pre(/^find/, function(next){
    this.find({ isActive: {$ne: false}})
    next()
})

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if(this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
        return JWTTimestamp < changedTimestamp
    }
    return false
}

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex')

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000

    return resetToken;
}

const User = mongoose.model('User', userSchema);

module.exports = User;
