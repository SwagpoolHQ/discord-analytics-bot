
export default function discordToMongoId(id) {

    //const mongoId = new mongodb.Types.ObjectId(`${id.toString(16).padStart(24, '0')}`); // to mongo ObjectId - Not required
    const mongoId = id.toString(16).padStart(24, '0'); // convert to hex and pad with zeros

    return mongoId;
};