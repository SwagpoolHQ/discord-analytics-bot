import ga from './ga.js'
import Invite from '../mongodb/models/invites.js'

export default async function gaGuildMemberJoin ( member, inviteCode ){

  console.log( 'member: ', member );

  // SHOULD BE RETRIEVED FROM CACHE
  const invite = await Invite.findOne({ code : inviteCode });
  console.log('invite: ', invite)

  // clientId is mandatory for GA to work properly
  const clientId = invite?.clientId ? invite?.clientId : null ;

  // A queue to batch our events
	const events = [];

  // Let's push the page view event 
  events.push({
    //name: 'message_sent',
    name: 'page_view',
    params: {
      page_title: `discord-landing-${member.guild.id}`, // GET THE LANDING CHANNEL ID
      //page_location: `https://discordlinks.com/discord/channel/${message.channelId}`, 
      page_location: `https://discord.com/landing/${member.guild.id}/${'to-be-defined'}`,
      guild_id: member.guild.id,
      channel_id:  'to-be-defined', // GET THE LANDING CHANNEL ID
      //raw_url: `https://discord.com/channels/${member.guild.id}/${channelId}`,
      //language: "en",
      //page_referrer: "apple.com",
      //screen_resolution: ""
      engagement_time_msec: "1" // Needed for non-zero user count
    },
  });

  // Let's push the message_sent event
  events.push({
    //name: 'message_sent',
    name: 'guild_member_join',
    params: {
      page_title: `discord-landing-${member.guild.id}`, // GET THE LANDING CHANNEL ID
      page_location: `https://discord.com/landing/${member.guild.id}/${'to-be-defined'}`, 
      guild_id: member.guild.id,
      channel_id:  'to-be-defined', // GET THE LANDING CHANNEL ID
      //language: "en",
      //page_referrer: "apple.com",
      //screen_resolution: ""
      //engagement_time_msec: "1" // Needed for non-zero user count
    },
  });

  console.log("events: ", events);

  // Send the events to GA using our measurementId and apiSecret
  const debug = await ga ( member.guild.id , clientId, member.user, events, false )
  console.log(debug)
    
}