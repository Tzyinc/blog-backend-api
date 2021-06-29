const linkPreview = require('link-preview-js')

async function previewLink({link}) {
    return await linkPreview.getLinkPreview(link);
}

module.exports = {
    previewLink
};
