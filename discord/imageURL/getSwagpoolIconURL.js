
export default function getSwagpoolIconURL( format = 'png', size = '160' ) {

    const baseURL = 'https://cdn.discordapp.com/';
    const path = `icons/${'1197499767773745232'}/${'74f40cc2aff3c28493cfa6794af00c27'}.${format}?size=${size}`;

    return baseURL+path;
};