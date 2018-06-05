const Jerkie = require('jerkie');

const mongoose = Jerkie.mongoose;
const Schema = mongoose.Schema;

let HostSchema = new Schema({
    name : {
        type : String
    },
    host : {
        type : String
    },
    port : {
        type : Number
    }
});

module.exports = mongoose.model('Host', HostSchema);