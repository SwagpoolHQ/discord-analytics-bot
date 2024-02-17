//const mongodb = require("mongoose");
import mongodb from 'mongoose';
//require('dotenv').config();
import dotenv from 'dotenv';
dotenv.config();

console.log('connecting to Mongo DB - contribution tracker. VPN break the connection')

const connectionString = process.env.MONGO_DB_CONNEXION

// ready states being: 0: disconnected - 1: connected - 2: connecting - 3: disconnecting
if (mongodb.connection.readyState === 1){
    console.log('Mongo DB is already connected with status : ', mongodb.connection.readyState);
} else {
    // handle connection
    mongodb.connect( connectionString, {connectTimeoutMS:2000})
    .then(() => console.log('Mongo DB - contribution tracker is connected'))
    .catch((error) => console.log(error))
}