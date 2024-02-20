import User from '../models/users.js'
import discordToMongoId from './idConversion/discordToMongoId.js';
import discordToCreatedAtTimestamp from './idConversion/discordToCreatedAtTimestamp.js';

export default async function saveUser(user) {

    let userFromDb = await User.findById(discordToMongoId(user.id))

    if(userFromDb){
        //console.log('user found in db')
    } else {
        const newUser = new User({
            _id : discordToMongoId(user.id),
            discordId: user.id,
            createdAtTimestamp: discordToCreatedAtTimestamp(user.id),
            username: user.username,
            globalName: user.globalName ,
            discriminator: user.discriminator,
            isBot: user.bot,
            isSystem: user.system,
            avatar: user.avatar,
            banner: user.banner,
        })

        try { // REMOVE try/catch to put it on function call or replace by 
            await newUser.save();
        } catch (e) {
            throw new Error(`error while saving user ${user.id} in mongoDB`, e)
        }

        userFromDb = await User.findById(discordToMongoId(user.id))
    }

    return userFromDb;
};