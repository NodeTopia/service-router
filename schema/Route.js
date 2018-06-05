const Jerkie = require('jerkie');

const mongoose = Jerkie.mongoose;
const Schema = mongoose.Schema;

let RouteSchema = new Schema({
    route: {
        type: String
    },
    reference: {
        type: mongoose.Schema.Types.ObjectId
    },
    name: {
        type: String
    },
    organization: {
        type: String
    },
    metricSession: {
        type: String
    },
    logSession: {
        type: String
    },
    hosts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Host'
    }],
    tls: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TLS'
    }
});
var autoPopulateLead = function(next) {
    this.populate('hosts');
    this.populate('tls');
    next()
};

RouteSchema.pre('findOne', autoPopulateLead);
RouteSchema.pre('find', autoPopulateLead);

RouteSchema.pre('save', function(next) {
    //this.updated_at = new Date();
    next();
});

module.exports = mongoose.model('Route', RouteSchema);