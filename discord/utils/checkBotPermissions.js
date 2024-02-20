import { PermissionsBitField } from 'discord.js';

//---------------------------------------------------------------//
//
// 				Function to check Bot permissions for a given Guild
//
//---------------------------------------------------------------//


export default function checkBotPermissions(guild, permissionsRequired) {
      // check if permissionsRequired active
      if (guild.members.me.permissions.has(permissionsRequired)){
        return {
          result: true,
        };
      } else {
        // check for missing Permissions
        const permissionsMissing = [];
        for (const permissionRequired of permissionsRequired){
          !guild.members.me.permissions.has(permissionRequired) && permissionsMissing.push(permissionRequired);
        };
        // converst bitFields array into Permissions Strings Array
        const missing = (new PermissionsBitField(permissionsMissing)).toArray() 

        return {
          result: false,
          missing,
        };
      }
    };