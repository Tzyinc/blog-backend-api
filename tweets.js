const Twitter = require('twitter');
require('dotenv').config()

const apiKeys = {
    consumer_key: process.env.TWITTER_API,
    consumer_secret: process.env.TWITTER_SECRET,
    bearer_token: process.env.TWITTER_BEARER_TOKEN
};

const client = new Twitter(apiKeys);

const params = { screen_name: 'tzyinc' };

function getTweets(cachedData) {
    return client.get('statuses/user_timeline', params);
}

module.exports = {
    getTweets
};
