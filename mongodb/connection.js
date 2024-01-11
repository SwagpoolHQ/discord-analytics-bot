const mongodb = require("mongoose");
require('dotenv').config()

console.log('connecting to Mongo DB - InviteTracker2. VPN break the connection')

const connectionString = process.env.MONGO_DB_CONNEXION

// handle connection
mongodb.connect( connectionString, {connectTimeoutMS:2000})
    .then(() => console.log('Mongo DB - InviteTracker2 is connected'))
    .catch(error => console.log(error))