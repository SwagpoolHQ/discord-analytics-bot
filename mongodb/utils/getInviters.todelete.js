const Member = require('../models/members');

const mongodb = require('mongoose');
const { ObjectId } = mongodb.Types;

const discordToMongoId = require('./idConversion/discordToMongoId');

async function getInviters ( guildId ) {

    //try {
        console.log("before query with guildId :  " , guildId);
        const inviters = await Member.aggregate([
            {
              $match: {
                guild: new ObjectId( discordToMongoId(guildId) ),
              },
            },
            {
              $lookup: {
                from: 'invites',
                localField: 'user',
                foreignField: 'referrer',
                as: 'memberInvites',
              },
            },
            {
              $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'memberUser',
              },
            },
            {
              $unwind: '$memberInvites',
            },
            {
              $unwind: '$memberUser',
            },
            {
              $lookup: {
                from: 'members',
                localField: 'memberInvites._id',
                foreignField: 'invite',
                as: 'referredMembers',
              },
            },
            {
              $addFields: {
                referredMembersCount: { $size: '$referredMembers' }, // Add a new field with the length of referredMembers
                referredMembersWhoLeftCount: {
                  $size: {
                    $filter: {
                      input: '$referredMembers',
                      as: 'referredMember',
                      cond: {
                        $and: [
                          { $ne: [{ $type: '$$referredMember.leftAtTimestamp' }, 'missing'] },
                          { $ne: ['$$referredMember.leftAtTimestamp', null] },
                          { $ne: ['$$referredMember.leftAtTimestamp', ''] },
                        ],
                      },
                    },
                  },
                },
              }, 
            },
            {
              $group: {
                _id: '$_id',
                guild: { $first: '$guild' },
                user: { $first: '$user' },
                username: { $first: '$memberUser.username' },
                userDiscordId: { $first: '$memberUser.discordId' },
                referredMembersCount: { $sum: '$referredMembersCount' },
                referredMembersWhoLeftCount: { $sum: '$referredMembersWhoLeftCount' },
              },
            },
          ]);
          
          return inviters;
    

    /*} catch (error) {
        // Check if the error is due to a non-existent guildId
        if (error.name === 'CastError' && error.path === 'guild') {
        // Handle the case where the guildId is not found
        console.error('Guild not found');
        } else {
        // Handle other errors
        console.error('Error querying members collection:', error);
        }
    }*/
}

module.exports = getInviters;