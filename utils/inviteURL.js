
const inviteURL = process.env.NODE_ENV === 'development'
			? `http://localhost:${process.env.PORT || '3000'}/invite` // LOCAL base URL 
			: `${process.env.PROD_INVITE_URI}` // PROD base URL

export default inviteURL;