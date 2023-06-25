const mongoose = require('mongoose');

const Mahasiswa = mongoose.model('Mahasiswa', {
    nama: {
        type: String,
        required: true,
    },
    nim: {
        type: String,
        required: true,
    },
    kelas: {
        type: String,
        required: true,
    },
});

module.exports = Mahasiswa;