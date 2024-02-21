import express from "express";

import mongodb from 'mongoose';
const { ObjectId } = mongodb.Types;

//const Invite = require('../mongodb/models/invites');
//const User = require('../mongodb/models/users');
//const Member = require('../mongodb/models/members');
//const Message = require('../mongodb/models/messages');

import discordToMongoId from '../mongodb/utils/idConversion/discordToMongoId.js';

export const populateRouter = express.Router();

/*
// POST /populate a guild's invite in db with mock data 
populateRouter.post('/', async function(req, res, next) {
  
    if (req.body && req.body.inviteId){
      const invite = await Invite.findOne({_id: new ObjectId(discordToMongoId(req.body.inviteId))});
      if ( invite ) {
            
            const userNames = ["m.allan.01","Georgina203","Khalid influencer","raida7885","frqnku","lepandamalade","neevaik","docs2309","khalidkaf89","Cedric"]
            const users = [];
            const members = [];
            const messages = [];
            
            for (let i=0; i<1; i++){
              for(let userName of userNames){

                // Calculer le timestamp maximum (date actuelle)
                const maxTimestampForAccountCreation = (new Date()).getTime();
                // Calculer le timestamp minimum (il y a 500 semaines, env 10 ans)
                const minTimestampForAccountCreation  = maxTimestampForAccountCreation - 500 * 7 * 24 * 60 * 60 * 1000; // 3 semaines en millisecondes
                const createdAtTimestamp = Math.floor(Math.random() * (maxTimestampForAccountCreation - minTimestampForAccountCreation + 1)) + minTimestampForAccountCreation;

                const newUser = new User({
                    discordId: `${discordToMongoId(Math.floor(Math.random()*1000000))}`,
                    createdAtTimestamp,
                    username: userName + Math.floor(Math.random()*1000),
                    globalName: userName,
                    discriminator: "0",
                    isBot: false,
                    isSystem: false,
                    avatar: null,
                    banner: null,
                    permissions: [],
                    roles: [],
                  })
                //console.log('saving newMember :', newMember)
                const user = await newUser.save();
                users.push(user);
                //console.log('members array :',members)
  
                // Calculer le timestamp maximum (date actuelle)
                const maxTimestamp = (new Date()).getTime();
                // Calculer le timestamp minimum (il y a trois semaines)
                const minTimestamp = maxTimestamp - 3 * 7 * 24 * 60 * 60 * 1000; // 3 semaines en millisecondes
                const joinedAtTimestamp = Math.floor(Math.random() * (maxTimestamp - minTimestamp + 1)) + minTimestamp;
  
                const newMember = new Member({
                    joinedAtTimestamp,
                    guild: invite.guild,
                    user: user._id,
                    invite: invite._id,
                })
                //console.log('saving newJoinEvent :', newJoinEvent)
                const member = await newMember.save();
                members.push(member);
                //console.log('saved joinEvent :', joinEvent)
  
                  for (let i=0; i < Math.floor(Math.random() * 100); i++){
                    const messageTimestamp = Math.floor(Math.random() * (maxTimestamp - joinedAtTimestamp + 1)) + joinedAtTimestamp;
                    const newMessage = new Message({
                      discordId: invite.guild.toString(),
                      channelId: "1045256538618597436",
                      guild: invite.guild,
                      createdTimestamp: messageTimestamp,
                      type: 0,
                      content: "generated message" + Math.floor(Math.random()*100000000),
                      author: user._id,
                  })
                    //console.log("newMessage : ", newMessage)
                    const message = await newMessage.save();
                    messages.push(message);
                    //console.log("messages : ", messages)
                  }
              }
            }
            
        res.json({
          result: true,
          populated: `${messages.length} messages, ${users.length} users, ${members.length} members, for invite ${invite.code}, on guild ${invite.guild.toString()}`,
          })
      } else {
        res.json({
          result: false,
          message: "invite not found in db",
          })
      }
  
    } else {
      res.json({
        result: false,
        message: "missing inviteId in request's body",
        })
    }
    
  });
  */