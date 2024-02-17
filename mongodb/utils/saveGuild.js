//const Guild = require ('../models/guilds');
import Guild from '../models/guilds.js';

//const discordToMongoId = require('./idConversion/discordToMongoId');
import discordToMongoId from './idConversion/discordToMongoId.js';
//const saveUser = require('./saveUser');
import saveUser from './saveUser.js'

export default async function saveGuild(guild) {
    
    // Updating the guild in DB 
    let guildFromDb = await Guild.findById(discordToMongoId(guild.id));

    if(guildFromDb){
        //console.log(`${guild.name} already in db`)
    } else {
        console.log(`Saving ${guild.name} guild in db`)

        // Convert the string to a Date object
        const joinedDate = new Date(guild.joinedTimestamp);

        // Get the timestamp (UNIX timestamp) from the Date object
        const joinedTimestamp = joinedDate.getTime();

        const owner = await guild.client.users.fetch(guild.ownerId);
        saveUser(owner);


        try {
            const newGuild = new Guild({
                _id: discordToMongoId(guild.id),
                discordId: guild.id ,
                name: guild.name,
                icon: guild.icon,
                permissions: '', 
                owner: discordToMongoId(owner.id),
                joinedTimestamp,
            })

            const save = await newGuild.save();
            
        } catch {
          error => {
          console.error('error while saving guild in mongoDB:', error)
          }
        }

        guildFromDb = await Guild.findById(discordToMongoId(guild.id));
    }

    return guildFromDb;

};

//module.exports = saveGuild;