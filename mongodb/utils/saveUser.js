const User = require ('../models/users');

const discordToMongoId = require('./idConversion/discordToMongoId');
const discordToCreatedAtTimestamp = require('./idConversion/discordToCreatedAtTimestamp')

async function saveUser(user) {

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

        try {
        await newUser.save();
        } catch {
            error => {
            console.error('error while saving user in mongoDB:', error)
            }
        }

        userFromDb = await User.findById(discordToMongoId(user.id))
    }

    return userFromDb;
};

module.exports = saveUser;