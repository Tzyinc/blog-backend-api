require('dotenv').config();
const fetch = require('node-fetch');
const TOKEN = process.env.DEV_TO_TOKEN;


function postBlog({title, content, tags = [], url="", series = ""}) {
    const body = { article: {
        title: title,
        published:true,
        body_markdown: content,
        tags: tags,
        series,
        canonical_url: url
    }};

    fetch('https://dev.to/api/articles', {
        method: 'post',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json', 'api-key': TOKEN },
    })
        .then(res => res.json())
        .then(json => console.log(json));
}
// https://dev.to/api/articles
// {
//     "article": {
//         "title": "Hello, World!",
//             "published": true,
//                 "body_markdown": "Hello DEV, this is my first post",
//                     "tags": [
//                         "discuss",
//                         "help"
//                     ],
//                         "series": "Hello series",
//                             "canonical_url": "https://example.com/blog/hello"
//     }
// }

module.exports = {
    postBlog
};
