const { createDocument, getDocuments } = require('./mongo-api');

const collectionName = "URL_LIST";

async function createUrl(longUrl, accountId) {
    const checkUrl = await getDocuments(collectionName, {
        longUrl, accountId
    });

    if(checkUrl.length) {
        return checkUrl[0].shortId;
    }

    const shortId = (+new Date).toString(36).slice(-5);

    await createDocument(collectionName, {
        longUrl,
        shortId,
        accountId
    });

    return shortId;
}

async function getUrl(shortId) {
    const doc = await getDocuments(collectionName, { shortId });
    return doc;
}

async function getUrlsForAccount(accountId) {
    const doc = await getDocuments(collectionName, { accountId });
    return doc;
}

module.exports = {
    createUrl,
    getUrl,
    getUrlsForAccount
}