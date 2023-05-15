const { createUrl, getUrl, getUrlsForAccount } = require('./service-api');

const fastify = require('fastify')({ logger: true });
const cors = require("@fastify/cors");

fastify.register(cors, {
    origin: "*"
});

fastify.post('/create-url', async (req, res) => {
    const { longUrl, accountId } = req.body;

    try {
        new URL(longUrl);
    } catch (e) {
        res.status(500);
        res.send({ data: null, error: "invalid url" });
        return;
    }

    const shortId = await createUrl(longUrl, accountId);

    res.status(200);
    res.send({ data: shortId });
});


fastify.post('/get-url', async (req, res) => {
    const { shortId } = req.body;

    const data = await getUrl(shortId);

    res.status(200);
    res.send({ data });
});

fastify.get('/:shortId', async (req, res) => {
    const { shortId } = req.params;

    const data = await getUrl(shortId);

    if(!data.length) {
        res.status(404);
        return;
    }

    res.status(301);
    res.redirect(data[0].longUrl);
});

fastify.post('/get-urls', async (req, res) => {
    const { accountId } = req.body;

    if (!accountId) {
        res.status(500);
        res.send({});

        return;
    }

    const data = await getUrlsForAccount(accountId);

    res.status(200);
    res.send({ data });
});


const start = async () => {
    try {
        await fastify.listen({ port: 8080 })
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

start()