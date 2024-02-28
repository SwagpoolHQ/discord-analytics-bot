import ga from './ga.js'

export default async function gaGuildMemberJoin ( member, inviteCode ){

    console.log( 'member: ', member );
    const userId = member.user.id;
    const guildId = member.guild.id;

    console.log('userId', userId)
    console.log('guildId', guildId)

// A queue to batch our events
	const events = [];

    // Let's push the page view event 
    events.push({
      //name: 'message_sent',
      name: 'page_view',
      params: {
        page_title: `discord-landing-${guildId}`, // GET THE LANDING CHANNEL ID
        //page_location: `https://discordlinks.com/discord/channel/${message.channelId}`, 
        page_location: `https://discord.com/landing/${guildId}/${'to-be-defined'}`,
        guild_id: guildId,
        channel_id:  'to-be-defined', // GET THE LANDING CHANNEL ID
        //raw_url: `https://discord.com/channels/${guildId}/${channelId}`,
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
        page_title: `discord-landing-${guildId}`, // GET THE LANDING CHANNEL ID
        page_location: `https://discord.com/landing/${guildId}/${'to-be-defined'}`, 
        guild_id: guildId,
        channel_id:  'to-be-defined', // GET THE LANDING CHANNEL ID
        //language: "en",
        //page_referrer: "apple.com",
        //screen_resolution: ""
        //engagement_time_msec: "1" // Needed for non-zero user count
      },
    });

    console.log("events: ", events);

    // Send the events to GA using our measurementId and apiSecret
    const debug = await ga ( guildId, 'G-2RSPNCH2FD', process.env.GA_SECRET_KEY, null, userId, events, false )
    console.log(debug)
    
}