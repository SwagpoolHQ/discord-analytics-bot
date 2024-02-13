const {PermissionsBitField} = require ('discord.js')

//---------------------------------------------------------------//
//
// 				permissionsBitField required per feature
//
//---------------------------------------------------------------//

const permissionsRequired = {
  inviteTracker: [
    PermissionsBitField.Flags.Administrator,
  ],
  messageStats: [
  ],
  contributionTracker: [
    PermissionsBitField.Flags.Administrator,
  ],
};
    
module.exports = permissionsRequired;