import ga from './ga.js'

export default async function gaMessageReactionAdd ( messageReaction, user ){

    if( !messageReaction?.message?.guildId || !user ){
      throw new Error(`Parameters required => message.guildId: ${ !!messageReaction?.message?.guildId ? '✅' : '❌' }, user.id: ${ !!user?.id ? '✅' : '❌' }.`)
    }

    //create an event and send to ga using the ga function
    const guildId = messageReaction?.message?.guildId;
    
    // A queue to batch our events
	  const events = [];

    // Let's push the page view event 
    events.push({
      //name: 'message_sent',
      name: 'page_view',
      params: {
        page_title: `discord-channel-${messageReaction?.message?.channelId}`, // REPLACE WITH CHANNEL NAME IF NO BOTTLENECK
        //page_location: `https://discordlinks.com/discord/channel/${message.channelId}`, 
        page_location: `https://discord.com/channels/${messageReaction?.message?.guildId}/${messageReaction?.message?.channelId}`,
        guild_id: messageReaction?.message?.guildId,
        channel_id:  messageReaction?.message?.channelId,
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
      name: 'message_reaction_add',
      params: {
        page_title: `discord-channel-${messageReaction?.message?.channelId}`,
        page_location: `https://discord.com/channels/${messageReaction?.message?.guildId}/${messageReaction?.message?.channelId}`, 
        emoji_name: messageReaction?._emoji.name,
        //emoji_id: messageReaction?._emoji.id, // can be NULL => event is not processed in GA if one property is NULL
        //emoji_animated: messageReaction?._emoji.animated, // can be NULL => event is not processed in GA if one property is NULL
        guild_id: messageReaction?.message?.guildId,
        channel_id: messageReaction?.message?.channelId,
        author_id: messageReaction?.message?.author?.id,
        message_lenght: messageReaction?.message?.content.length,
        message_url: `https://discord.com/channels/${messageReaction?.message?.guildId}/${messageReaction?.message?.channelId}/${messageReaction?.message?.id}`,
        //language: "en",
        //page_referrer: "apple.com",
        //screen_resolution: ""
        //engagement_time_msec: "1" // Needed for non-zero user count
      },
    });

    // Send the events to GA using our measurementId and apiSecret
    if (messageReaction?.message?.content.length) {
      const debug = await ga ( guildId, null, user, events, false );
      console.log('debug: ', debug)
    }
}