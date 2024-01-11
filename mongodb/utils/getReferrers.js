const Member = require('../models/members');

const mongodb = require('mongoose');
const { ObjectId } = mongodb.Types;

const discordToMongoId = require('./idConversion/discordToMongoId');

async function getReferrers ( guildId, startTimestamp, endTimestamp ) {

  if( !startTimestamp ){
    try {
        //console.log("before query with NO startTimestamp :  " , guildId);
        const referrers = await Member.aggregate([
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
            {
              $sort: {
                  referredMembersCount: -1
              }
            },
          ]);
          
          return {
            startTimestamp,
            endTimestamp,
            totalReferrers: referrers.length,
            totalJoiners: referrers.reduce( (acc, current) => acc + current.referredMembersCount, 0 ),
            referrers,
          };

    } catch (error) {
        // Check if the error is due to a non-existent guildId
        if (error.name === 'CastError' && error.path === 'guild') {
        // Handle the case where the guildId is not found
        console.error('Guild not found');
        } else {
        // Handle other errors
        console.error('Error querying members collection:', error);
        }
    }
  } else {
    // ADD FILTER on referredMembers for: startTimestamp < "joinedAtTimestamp" < endTimestamp
    try {
      //console.log("before query with startTimestamp :  " , guildId);
      const referrers = await Member.aggregate([
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
            $match: {
              'referredMembers.joinedAtTimestamp': {
                $gte: new Date(startTimestamp),
                $lt: new Date(endTimestamp),
              },
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
          {
            $sort: {
                referredMembersCount: -1
            }
          },
        ]);
        
        return {
          startTimestamp,
          endTimestamp,
          totalReferrers: referrers.length,
          totalJoiners: referrers.reduce( (acc, current) => acc + current.referredMembersCount, 0 ),
          referrers,
        };

  } catch (error) {
      // Check if the error is due to a non-existent guildId
      if (error.name === 'CastError' && error.path === 'guild') {
      // Handle the case where the guildId is not found
      console.error('Guild not found');
      } else {
      // Handle other errors
      console.error('Error querying members collection:', error);
      }
  }
  }
}

module.exports = getReferrers;