const Jerkie = require('jerkie');

const mongoose = Jerkie.mongoose;
const Schema = mongoose.Schema;

let TLSSchema = new Schema({
    key: {
        type: String
    },
    certificate: {
        type: String
    }
});


module.exports = mongoose.model('TLS', TLSSchema);