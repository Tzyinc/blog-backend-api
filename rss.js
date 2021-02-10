let Parser = require('rss-parser');
let parser = new Parser({
    customFields: {
        item: ['content:raw']
    }
});

function getFeed(url) {
    return parser.parseURL(url);
}

module.exports = {
    getFeed
}