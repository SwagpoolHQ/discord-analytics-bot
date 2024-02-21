
export default function debug ( ...props ) {

    process.env.NODE_ENV === 'development' && console.log( ...props );

}