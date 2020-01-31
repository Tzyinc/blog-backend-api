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
    blogRss: '/blogRss',
    wuhanCNA: '/wuhanCNA'
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


app.get(endpoints.wuhanCNA, function (req, res) {
    res.send(cachedData.wuhanCNA)
})
loopFn();
setInterval(loopFn, 5 * 60 * 1000);

function loopFn() {
    tweetApi.getTweets().then(
        function (tweets) {
            cachedData.tweets = tweets
        })
        .catch(function (error) {
            console.error(error);
        });

    rssApi.getFeed('https://tenzhiyang.com/rss.xml').then(data => {
        if (cachedData.blogRss && +new Date(cachedData.blogRss.lastBuildDate) < +new Date(data.lastBuildDate)) {
            const newPost = data.items.filter(item => -1 === cachedData.blogRss.items.findIndex(cacheItem => cacheItem.guid === item.guid))

            for (let i=0; i< newPost.length; i++) {
                tweetApi.postTweet(`I wrote a new blog post: ${newPost[i].title}! Read it here: ${newPost[i].link}`)
            }
        }
        cachedData.blogRss = data;
    }).catch(error => {
        console.error(error);
    });

    fetchWuhanCNA();
    cachedData.lastFetched = new Date();
}

function fetchWuhanCNA() {
    fetch('https://data.24liveplus.com/v1/retrieve_server/x/event/2441056855163817172/news/?inverted_order=0&last_nid=&limit=100&origin=https%253A%252F%252Fwww.channelnewsasia.com').then(data => {
        return data.json();
    }).then(jsonData => {
        cachedData.wuhanCNA = jsonData;
    });
}

app.listen(port);