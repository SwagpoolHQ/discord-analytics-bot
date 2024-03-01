import ga from './ga.js'

export default async function gaMessageSent ( message ){

    //create an event and send to ga using the ga function
    const guildId = message.guildId;
    
    // A queue to batch our events
	  const events = [];

    // Let's push the page view event 
    events.push({
      //name: 'message_sent',
      name: 'page_view',
      params: {
        page_title: `discord-channel-${message.channelId}`, // REPLACE WITH CHANNEL NAME IF NO BOTTLENECK
        //page_location: `https://discordlinks.com/discord/channel/${message.channelId}`, 
        page_location: `https://discord.com/channels/${message.guildId}/${message.channelId}`,
        guild_id: message.guildId,
        channel_id:  message.channelId,
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
      name: 'message_sent',
      params: {
        page_title: `discord-channel-${message.channelId}`,
        page_location: `https://discord.com/channels/${message.guildId}/${message.channelId}`, 
        guild_id: message.guildId,
        channel_id:  message.channelId,
        message_lenght: message.content.length,
        message_url: `https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}`,
        //language: "en",
        //page_referrer: "apple.com",
        //screen_resolution: ""
        //engagement_time_msec: "1" // Needed for non-zero user count
      },
    });

    // Send the events to GA using our measurementId and apiSecret
    if (message.content.length) {
      const debug = await ga ( guildId, null, message.author, events, false );
      console.log('debug: ', debug)
    }
}