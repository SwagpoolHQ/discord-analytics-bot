const Invite = require('../models/invites');

const discordToMongoId = require('./idConversion/discordToMongoId');
const saveMember = require('./saveMember');

async function saveInvite(invite) {

    let inviteFromDb = await Invite.findOne({code: invite.code})
    
    if(!inviteFromDb) {
        
        // Saving member to DB
        const creatorMember = await invite.guild.members.fetch(invite.inviterId);

        await saveMember( creatorMember );

        // create new invite to save in db
        const newInvite = new Invite({
            code: invite.code,
            name: invite.code,
            guild: discordToMongoId(invite.guild.id),
            creator: discordToMongoId(creatorMember.user.id),
            referrer: discordToMongoId(creatorMember.user.id),
            channel: discordToMongoId(invite.channel.id),
        });

        // saving new invite in db
        try {
            inviteFromDb = await newInvite.save();
        } catch {
            error => {
            console.error('error while saving invite in mongoDB:', error)
            }
        }
    }

    return inviteFromDb;

};

module.exports = saveInvite;