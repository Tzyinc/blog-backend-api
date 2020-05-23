const Twitter = require('twitter');
require('dotenv').config()

const apiKeys = {
    consumer_key: process.env.TWITTER_API,
    consumer_secret: process.env.TWITTER_SECRET,
    // bearer_token: process.env.TWITTER_BEARER_TOKEN
    access_token_key: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
};

const client = new Twitter(apiKeys);

const params = { screen_name: 'tzyinc' };

function getTweets(cachedData) {
    return client.get('statuses/user_timeline', params);
}

function postTweet(content) {
    client.post('statuses/update', { status: content }, function (error, tweet, response) {
        if (error) {
            console.error(error);
        }
    });
}

module.exports = {
    getTweets,
    postTweet
};
