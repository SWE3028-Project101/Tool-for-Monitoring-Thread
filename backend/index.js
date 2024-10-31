const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const app = express();
const port = 9000;

app.use(bodyParser.json());

app.post('/api', (req, res) => {
    const { host, port: targetPort, threadPoolSize } = req.body;
    console.log(req.body);

    const options = {
        uri: `http://${host}:${targetPort}/actuator`, // 프로토콜 추가
    };

    request(options, function (err, response, body) {
        if (err) {
            console.error('Request error:', err);
            return res.status(500).send('Error fetching actuator data');
        }
        console.log(response.body);
        res.send(response.body);
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
