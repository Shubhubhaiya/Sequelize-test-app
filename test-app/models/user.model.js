const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    passowrd: {
        type: String,
        required: true
    },
    cretatedBy: {
        type: String,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
