import Invite from '../models/invites.js';
import discordToMongoId from './idConversion/discordToMongoId.js';
import saveMember from './saveMember.js';

export default async function saveInvite(invite, campaignId, joinerId ) {

    let inviteFromDb = await Invite.findOne({code: invite.code})

    if (inviteFromDb){
        return inviteFromDb;
    }
    
    if(!campaignId) {
        
        // Saving member to DB
        const creatorMember = await invite.guild.members.fetch(invite.inviterId); // NOT REQUIRED -> replace below by: invite.inviterId

        await saveMember( creatorMember );

        // create new invite to save in db
        const newInvite = new Invite({
            code: invite.code,
            name: invite.code,
            _expiresTimestamp: invite._expiresTimestamp,
            guild: discordToMongoId(invite.guild.id),
            creator: discordToMongoId(creatorMember.user.id),
            referrer: discordToMongoId(creatorMember.user.id),
            channel: discordToMongoId(invite.channel.id),
        });

        // saving new invite in db
        try {
            inviteFromDb = await newInvite.save();
            return inviteFromDb
        } catch {
            error => {
            console.error('error while saving invite in mongoDB:', error)
            }
        }
    } else if (campaignId) {
        if (joinerId){
            // create new invite to save in db
            const newInvite = new Invite({
                code: invite.code,
                name: invite.code,
                _expiresTimestamp: invite._expiresTimestamp,
                guild: discordToMongoId(invite.guild.id),
                creator: discordToMongoId(invite.inviterId),
                referrer: null,
                channel: discordToMongoId(invite.channel.id),
                campaign: campaignId,
                forJoiner: joinerId,
            });

            // saving new invite in db
            try {
                inviteFromDb = await newInvite.save();
                return inviteFromDb
            } catch {
                error => {
                console.error('error while saving invite with campaignID in mongoDB:', error)
                }
            }

        } else {
            // create new invite to save in db
            const newInvite = new Invite({
                code: invite.code,
                name: invite.code,
                _expiresTimestamp: invite._expiresTimestamp,
                guild: discordToMongoId(invite.guild.id),
                creator: discordToMongoId(invite.inviterId),
                referrer: null,
                channel: discordToMongoId(invite.channel.id),
                campaign: campaignId,
            });

            // saving new invite in db
            try {
                inviteFromDb = await newInvite.save();
                return inviteFromDb
            } catch {
                error => {
                console.error('error while saving invite with campaignID in mongoDB:', error)
                }
            }
        }
    }
};