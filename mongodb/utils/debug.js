import dotenv from 'dotenv';
dotenv.config();

const isDev = process.env.NODE_ENV === 'development';

export default function debug ( ...props ) {
    isDev  && console.log( ...props );
}