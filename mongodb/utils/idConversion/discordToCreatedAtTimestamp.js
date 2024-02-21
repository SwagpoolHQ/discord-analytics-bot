
// WORKS FOR USERS/CHANNELS/GUILDS/MESSAGE
export default function discordToCreatedAtTimestamp(id) {

    if ( !id ){ return null};

    function convertIDtoUnix(id) {
        /* Note: id has to be str */
        
        // Step 1: Convert the decimal ID to binary representation
        const bin = (+id).toString(2);
    
        // Step 2: Calculate the number of missing bits to make the total length 64 bits
        const m = 64 - bin.length;
    
        // Step 3: Extract the relevant bits from the binary representation
        const unixbin = bin.substring(0, 42 - m);
    
        // Step 4: Convert the binary representation to decimal and add the offset (GMT: Tuesday, January 1, 2015 00:00:00.000)
        const unix = parseInt(unixbin, 2) + 1420070400000;
    
        // Step 5: Return the final Unix timestamp
        return unix;
    }

    const timestamp = convertIDtoUnix(id.toString());
    // Convert the id <string> to a Date object
    const createdAtDate = new Date(timestamp );
    // Get the timestamp (UNIX timestamp) from the Date object
    const createdAtTimestamp = createdAtDate.getTime();

    return createdAtTimestamp;
};