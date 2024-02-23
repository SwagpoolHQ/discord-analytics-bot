import Member from '../models/members.js';
import Campaign from '../models/campaigns.js';
import mongodb from 'mongoose';
const { ObjectId } = mongodb.Types;
import discordToMongoId from './idConversion/discordToMongoId.js';

export default async function getCampaignsData ( guildId, startTimestamp, endTimestamp ) {

  if( !startTimestamp ){
    try {
        //console.log("before query with NO startTimestamp :  " , guildId);
        const campaigns = await Campaign.aggregate([
            {
              $match: {
                guild: new ObjectId( discordToMongoId(guildId) ),
              },
            },
            {
              $lookup: {
                from: 'invites',
                localField: '_id',
                foreignField: 'campaign',
                as: 'campaignInvites',
              },
            },
            {
              $unwind: '$campaignInvites',
            },
            {
              $lookup: {
                from: 'members',
                localField: 'campaignInvites._id',
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
                name: { $first: '$name' },
                code: { $first: '$code' },
                description: { $first: '$description' },
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
            totalCampaigns: campaigns.length,
            totalJoiners: campaigns.reduce( (acc, current) => acc + current.referredMembersCount, 0 ),
            campaigns,
          };

    } catch (error) {
        // Check if the error is due to a non-existent guildId
        if (error.name === 'CastError' && error.path === 'guild') {
        // Handle the case where the guildId is not found
        console.error('Guild not found');
        } else {
        // Handle other errors
        console.error('Error querying Campaign collection:', error);
        }
    }
  } else {
    // ADD FILTER on referredMembers for: startTimestamp < "joinedAtTimestamp" < endTimestamp
    try {
      //console.log("before query with startTimestamp :  " , guildId);
      const campaigns = await Campaign.aggregate([
          {
            $match: {
              guild: new ObjectId( discordToMongoId(guildId) ),
            },
          },
          {
            $lookup: {
              from: 'invites',
              localField: '_id',
              foreignField: 'campaign',
              as: 'campaignInvites',
            },
          },
          {
            $unwind: '$campaignInvites',
          },
          {
            $lookup: {
              from: 'members',
              localField: 'campaignInvites._id',
              foreignField: 'invite',
              as: 'referredMembers',
            },
          },
          {
            $match: {
              'referredMembers.joinedAtTimestamp': {
                $gte: new Date(startTimestamp),
                //$lt: new Date(endTimestamp),
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
              name: { $first: '$name' },
              code: { $first: '$code' },
              description: { $first: '$description' },
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
          totalCampaigns: campaigns.length,
          totalJoiners: campaigns.reduce( (acc, current) => acc + current.referredMembersCount, 0 ),
          campaigns,
        };

  } catch (error) {
      // Check if the error is due to a non-existent guildId
      if (error.name === 'CastError' && error.path === 'guild') {
      // Handle the case where the guildId is not found
      console.error('Guild not found');
      } else {
      // Handle other errors
      console.error('Error querying Campaign collection:', error);
      }
  }
  }
}