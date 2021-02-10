const express = require('express');
const app = express();
const fetch = require('node-fetch');
const cors = require('cors')
const tweetApi = require('./tweets.js')
const rssApi = require('./rss.js')
const devToApi = require('./devto.js')

let cachedData = {};
const port = 1010;

app.use(cors());

// key must be same as cachedData, value is url
const endpoints = {
    tweets: 'tweets',
    blogRss: 'blogRss',
    wuhanCNA: 'wuhanCNA',
    wuhanUpdated: 'wuhanUpdated',
    quotes: 'quotes',
}

app.get('/', function (req, res) {
    res.send(endpoints)
})


Object.keys(endpoints).forEach(function (key) {
    // console.table('Key : ' + key + ', Value : ' + data[key])
    app.get('/' + endpoints[key], function (req, res) {
        res.send(cachedData[key])
    })
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

            for (let i = 0; i < newPost.length; i++) {
                tweetApi.postTweet(`I wrote a new blog post: ${newPost[i].title}! Read it here: ${newPost[i].link}`)
            }
        }
        cachedData.blogRss = data;
    }).catch(error => {
        console.error(error);
    });

    fetchWuhanCNA();
    fetchQuotes();
    let today = new Date();
    tweetQOTD(today);
    cachedData.lastFetched = today;
}

function tweetQOTD(today) {
    console.log('date', getDate(today), today.getHours(), today.getMinutes());
    // 6 is 2pm on server
    // date is off by one on server not going to fix
    if (today.getHours() === 14 && today.getMinutes() >= 0 && today.getMinutes() < 5 && cachedData.quotes) {
        let todayQuote = cachedData.quotes.find(item => {
            let quoteDate = new Date(item.date)
            return getDate(quoteDate) === getDate(today);
        })
        if (todayQuote) {
            tweetApi.postTweet(todayQuote.quote);
        }
    }
}

function getDate(today) {
    return today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
}

function fetchWuhanCNA() {
    fetch('https://data.24liveplus.com/v1/retrieve_server/x/event/2441056855163817172/news/?inverted_order=1&last_nid=&limit=50&origin=https%253A%252F%252Fwww.channelnewsasia.com').then(data => {
        return data.json();
    }).then(jsonData => {
        let newsList = jsonData.data.news;
        let updatedDate = 0;
        for (let news of newsList) {
            updatedDate = Math.max(updatedDate, news.created);
        }
        cachedData.wuhanCNA = jsonData;
        cachedData[endpoints.wuhanUpdated] = { date: updatedDate };
    });
}

function fetchQuotes() {
    fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vTiY7YebipddEZfFGbuJZyLKHihqgCQl79yT4-3CH4A5sw7WzcrS-1HAe5cRP9JvfOiVK1lIl4SEPBc/pub?output=tsv&gid=67876643&output=tsv&single=true&range=A1').then(data => {
        return data.json();
    }).then(jsonData => {
        cachedData.quotes = jsonData;
    });
}

app.listen(port);
