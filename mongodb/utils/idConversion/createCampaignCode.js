import { nanoid } from 'nanoid'
import Campaign from '../../models/campaigns.js';

export default async function createCampaignCode() {

    const newCode = nanoid(8); //=> "R8_H-myT"
    
    if ( await Campaign.findOne({ code: newCode }) ) {
        return await createCampaignCode();
    } else {
        return newCode;
    }
}