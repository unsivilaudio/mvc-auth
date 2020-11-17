const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    image: { type: String, required: true },
    places: { type: String, required: true },
});

// On Save Hook, encrypt password
userSchema.pre('save', function (next) {
    const user = this;

    // generate a salt, then run callback
    bcrypt.genSalt(10, function (err, salt) {
        if (err) {
            return next(err);
        }

        // hash (encrypt )our password using the salt
        bcrypt.hash(user.password, salt, function (err, hash) {
            // overwrite plain text pass with encrypted password
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function (candidatePassword, callback) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) {
            return callback(err);
        }

        callback(null, isMatch);
    });
};

module.exports = mongoose.model('User', userSchema);
