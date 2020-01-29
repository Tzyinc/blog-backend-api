let Parser = require('rss-parser');
let parser = new Parser();

function getFeed(url) {
    return parser.parseURL(url);
}

module.exports = {
    getFeed
}