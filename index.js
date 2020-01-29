const express = require('express');
const app = express();
const fetch = require('node-fetch');
const cors = require('cors')
const tweetApi = require('./tweets.js')

let cachedData = {};
const port = 1010;

app.use(cors());

const endpoints = {
    tweets: '/tweets'
}

app.get('/', function (req, res) {
    res.send(endpoints)
})

app.get(endpoints.tweets, function (req, res) {
    res.send(cachedData.tweets)
})

tweetApi.getTweets().then(
    function (tweets) {
        cachedData.tweets = tweets
    })
    .catch(function (error) {
        console.error(error);
    });
setInterval(function () {
    tweetApi.getTweets().then(
        function (tweets) {
            cachedData.tweets = tweets
        })
        .catch(function (error) {
            console.error(error);
        });
}, 30 * 60 * 1000);

app.listen(port);