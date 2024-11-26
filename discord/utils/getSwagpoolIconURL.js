
export default function getSwagpoolIconURL(format = 'png', size = '64') {

    const baseURL = 'https://cdn.discordapp.com/';
    const path = `app-icons/${'1197923779213533285'}/${'b4937bf1b2cfc8ea3298a68e38cd853a'}.${format}?size=${size}`;

    return baseURL + path;
};