const User = require ('../models/users');

const discordToMongoId = require('./idConversion/discordToMongoId');

async function saveUserById(client, userId) {

    let userFromDb = await User.findById(discordToMongoId(userId))

    if(userFromDb){
        console.log('user found in db')
    } else {

        const user = await client.users.fetch(userId);

        const newUser = new User({
            _id : discordToMongoId(user.id),
            discordId: user.id,
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

        userFromDb = await User.findById(discordToMongoId(userId));
    }

    return userFromDb;
};

module.exports = saveUserById;