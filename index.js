const express = require('express');
const app = express();
const fetch = require('node-fetch');
const cors = require('cors')
const tweetApi = require('./tweets.js')
const rssApi = require('./rss.js')

let cachedData = {};
const port = 1010;

app.use(cors());

const endpoints = {
    tweets: '/tweets',
    blogRss: '/blogRss'
}

app.get('/', function (req, res) {
    res.send(endpoints)
})

app.get(endpoints.tweets, function (req, res) {
    res.send(cachedData.tweets)
})


app.get(endpoints.blogRss, function (req, res) {
    res.send(cachedData.blogRss)
})
loopFn();
setInterval(loopFn, 60 * 1000);

function loopFn() {
    tweetApi.getTweets().then(
        function (tweets) {
            cachedData.tweets = tweets
        })
        .catch(function (error) {
            console.error(error);
        });

    rssApi.getFeed('https://tenzhiyang.com/rss.xml').then(data => {
        if (cachedData.blogRss && +new Date(cachedData.blogRss.lastBuildDate) > +new Date(data.lastBuildDate)) {
            const newPost = data.items.filter(item => -1 === cachedData.blogRss.items.findIndex(cacheItem => cacheItem.guid === item.guid))
            for (let i=0; i< newPost.length; i++) {
                tweetApi.postTweet(`I wrote a new blog post! Read it at ${newPost[i].link}`)
            }
        }
        cachedData.blogRss = data;
    }).catch(error => {
        console.error(error);
    });
    cachedData.lastFetched = new Date();
}

app.listen(port);