//const Member = require('../models/members');
import Member from '../models/members.js'
//const Message = require('../models/messages');
import Message from '../models/messages.js';

//const mongodb = require('mongoose');
import mongodb from 'mongoose';
const { ObjectId } = mongodb.Types;

//const discordToMongoId = require('./idConversion/discordToMongoId');
import discordToMongoId from './idConversion/discordToMongoId.js';

export default async function getMemberProfile ( guildId, userId ) {

  if( !guildId || !userId ){
    console.log("Error - getMemberProfile : missing guildId or userId")
  } else {
    
    // Computing the start timestamps for the required period
    const endTimestamp = new Date().getTime(); // this is now
    const startLast1dTimestamp  = endTimestamp - 1 * 24 * 60 * 60 * 1000; // The last 1 days in millisecondes from now.
    const startLast7dTimestamp  = endTimestamp - 7 * 24 * 60 * 60 * 1000; // The last 7 days in millisecondes from now.
    const startLast1mTimestamp  = endTimestamp - 30 * 24 * 60 * 60 * 1000; // The last 30 days in millisecondes from now.

    // ADD FILTER on joinersMembers for: startTimestamp < joinedAtTimestamp < endTimestamp
    try {

      const memberReferrals = await Member.aggregate([
          {
            $match: {
              guild: new ObjectId( discordToMongoId(guildId) ),
              user: new ObjectId( discordToMongoId(userId) ),
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
              as: 'referrerUser',
            },
          },
          {
            $unwind: '$memberInvites',
          },
          {
            $unwind: '$referrerUser',
          },
          {
            $lookup: {
              from: 'members',
              localField: 'memberInvites._id',
              foreignField: 'invite',
              as: 'joinersMembers',
            },
          },
          {
            $unwind: '$joinersMembers',
          },
          {
            $lookup: {
              from: 'users',
              localField: 'joinersMembers.user',
              foreignField: '_id',
              as: 'joinerUser',
            },
          },
          {
            $sort: {
              'joinersMembers.joinedAtTimestamp': -1, // Sorting in descending order
            },
          },
          {
            $unwind: '$joinerUser',
          },
          {
            $group: {
              _id: '$referrerUser._id',
              //referrerUser : { $first: '$referrerUser'},
              //joinedAtTimestamp: { $first: '$referrerUser.JoinedAtTimestamp' },
              joiners: {
                $push: {
                  user: '$joinerUser',
                  joinedAtTimestamp: '$joinersMembers.joinedAtTimestamp',
                  leftAtTimestamp: '$joinersMembers.leftAtTimestamp',
                },
              },
            },
          },
        ]);

      // Getting the member's messages counts
      const nbOfMessages = await Message.aggregate([
          {
            $match: {
              guild: new ObjectId( discordToMongoId(guildId) ),
              author: new ObjectId( discordToMongoId(userId) ),
              createdTimestamp: { $gte: new Date(startLast1mTimestamp) },
            },
          },
          {
            $facet: {
              messagesLast1d: [
                {
                  $match: {
                    createdTimestamp: { $gte: new Date(startLast1dTimestamp) },
                  },
                },
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 },
                  },
                },
                {
                  $project: {
                    _id: 0,
                    count: 1,
                  },
                },
              ],
              messagesLast7d: [
                {
                  $match: {
                    createdTimestamp: { $gte: new Date(startLast7dTimestamp) },
                  },
                },
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 },
                  },
                },
                {
                  $project: {
                    _id: 0,
                    count: 1,
                  },
                },
              ],
              messagesLast1m: [
                {
                  $match: {
                    createdTimestamp: { $gte: new Date(startLast1mTimestamp) },
                  },
                },
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 },
                  },
                },
                {
                  $project: {
                    _id: 0,
                    count: 1,
                  },
                },
              ],
            },
          },
        ]);

      // Getting the referrer's referrer
      const memberData = await Member
        .findOne({
          guild: new ObjectId( discordToMongoId(guildId) ),
          user: new ObjectId( discordToMongoId(userId) ),
        })
        .populate('user')
        .populate('invite')
        .populate({
          path: 'invite',
          populate: {
            path: 'referrer',
          },
        })
        .populate({
          path: 'invite',
          populate: {
            path: 'campaign',
          },
        })
        ;

      // Formatting memberProfile with Member, Referrals & Messages data
      const referrals =  memberReferrals[0]?.joiners ?? [];

      const nbOfReferralsLast1d = referrals.reduce( (acc, current) => acc + ( !current.leftAtTimestamp && current.joinedAtTimestamp >= startLast1dTimestamp ? 1 : 0 ), 0);
      const nbOfReferralsLast7d = referrals.reduce( (acc, current) => acc + ( !current.leftAtTimestamp && current.joinedAtTimestamp >= startLast7dTimestamp ? 1 : 0 ), 0);
      const nbOfReferralsLast1m = referrals.reduce( (acc, current) => acc + ( !current.leftAtTimestamp && current.joinedAtTimestamp >= startLast1mTimestamp ? 1 : 0 ), 0);
      const nbOfReferrals = referrals.reduce( (acc, current) => acc + ( !current.leftAtTimestamp ? 1 : 0 ), 0);

      const nbOfMessagesLast1d = nbOfMessages[0].messagesLast1d[0]?.count ?? 0;
      const nbOfMessagesLast7d = nbOfMessages[0].messagesLast7d[0]?.count ?? 0;
      const nbOfMessagesLast1m = nbOfMessages[0].messagesLast1m[0]?.count ?? 0;

      const user = memberData?.user;
      const referrer = memberData?.invite?.referrer ?? null;
      const campaign = memberData?.invite?.campaign ?? null;
      const joinedAtTimestamp = memberData?.joinedAtTimestamp;

      const memberProfile = {
        guildId,
        userId,
        user,
        joinedAtTimestamp,
        referrer,
        campaign,
        nbOfReferralsLast1d,
        nbOfReferralsLast7d,
        nbOfReferralsLast1m,
        nbOfReferrals,
        nbOfMessagesLast1d,
        nbOfMessagesLast7d,
        nbOfMessagesLast1m,
        referrals,
      }

      return memberProfile;

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

//module.exports = getMemberProfile;