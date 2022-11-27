const mongoose = require('mongoose');
const { Schema } = mongoose;

const PlayData = new Schema({
    name: {
        type: String,
        required: true
    },
    rounds: {
        type: Number,
        required: true
    },
    unit1Tier: {
        type: Number,
        default: 0
    },
    unit2Tier: {
        type: Number,
        default: 0
    },
    unit3Tier: {
        type: Number,
        default: 0
    },
    unit4Tier: {
        type: Number,
        default: 0
    },
    handYacht: {
        type: Number,
        default: 0
    },
    handFourKinds: {
        type: Number,
        default: 0
    },
    handLStraight: {
        type: Number,
        default: 0
    },
    handFullHouse: {
        type: Number,
        default: 0
    },
    handSStraight: {
        type: Number,
        default: 0
    },
    choiceBullsEye: {
        type: Number,
        default: 0
    },
	version: {
        type: String,
        default: "1.0"
    },
	createdAt: {
		type: Date,
		default: Date.now
	}
}, { collection: 'PlayData' });
module.exports = mongoose.model('PlayData', PlayData);