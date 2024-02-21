
const baseURL = process.env.NODE_ENV === 'development'
			? `http://localhost:${process.env.PORT || '3000'}` // LOCAL base URL 
			: `${process.env.PROD_URI}` // PROD base URL

export default baseURL;