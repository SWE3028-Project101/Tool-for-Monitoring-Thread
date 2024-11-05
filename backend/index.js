const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const app = express();
const port = 9000;

app.use(bodyParser.json());

app.post('/api/:method', (req, res) => {
    const { host, port: targetPort, threadPoolSize } = req.body;

    const options = {
        uri: `http://${host}:${targetPort}/actuator/metrics/custom.memory.usage`, // 프로토콜 추가
    };

    request(options, function (err, response, body) {
        if (err) {
            console.error('Request error:', err);
            return res.status(500).send('Error fetching actuator data');
        }

        // body가 비어 있는지 확인
        if (!body) {
            console.error('Empty response body');
            return res.status(500).send('Received empty response');
        }

        let resBody;
        try {
            resBody = JSON.parse(body); // JSON 문자열을 객체로 변환
        } catch (parseError) {
            console.error('JSON parsing error:', parseError);
            return res.status(500).send('Error parsing JSON data');
        }

        const transformedData = {
            data: resBody.availableTags[0].values.map((_, index) => {
                const errorTag = resBody.availableTags.find(tag => tag.tag === "error");

                return {
                    uri: resBody.availableTags.find(tag => tag.tag === "uri")?.values[index],
                    memoryUsage: resBody.availableTags.find(tag => tag.tag === "memoryUsage")?.values[index],
                    executionTime: resBody.availableTags.find(tag => tag.tag === "executingTime")?.values[index],
                    time: resBody.availableTags.find(tag => tag.tag === "currentTime")?.values[index],
                    isError: errorTag && errorTag.values[index] && errorTag.values[index].includes("error") ? "true" : "false",
                    calledNum: resBody.availableTags.find(tag => tag.tag === "requestNum")?.values[index]
                };
            })
        }
        let data = transformedData.data;

        let groupedByRecentTime = [...data].sort((a, b) => new Date(b.time) - new Date(a.time))
        let groupedByEarlyTime = [...data].sort((a, b) => new Date(a.time) - new Date(b.time))

        let groupedByMemoryUsageAsc = [...data].sort((a, b) => parseFloat(a.memoryUsage) - parseFloat(b.memoryUsage));
        let groupedByMemoryUsageDesc = [...data].sort((a, b) => parseFloat(b.memoryUsage) - parseFloat(a.memoryUsage));

        const groupedByExecutionTimeAsc = [...data].sort((a, b) => {
            const timeA = a.executionTime ? parseFloat(a.executionTime.replace('ms', '')) : 0; // 기본값 0 설정
            const timeB = b.executionTime ? parseFloat(b.executionTime.replace('ms', '')) : 0; // 기본값 0 설정
            return timeA - timeB;
        });

        // executionTime 기준으로 정렬 (내림차순)
        const groupedByExecutionTimeDesc = [...data].sort((a, b) => {
            const timeA = a.executionTime ? parseFloat(a.executionTime.replace('ms', '')) : 0; // 기본값 0 설정
            const timeB = b.executionTime ? parseFloat(b.executionTime.replace('ms', '')) : 0; // 기본값 0 설정
            return timeB - timeA;
        });

        const method = req.params.method

        if (method === "recentTime") {
            res.send({data: groupedByRecentTime})
        } else if (method === "earlyTime") {
            res.send({data: groupedByEarlyTime})
        } else if (method === "memoryUsageAsc") {
            res.send({data: groupedByMemoryUsageAsc})
        } else if (method === "memoryUsageDesc") {
            res.send({data: groupedByMemoryUsageDesc})
        } else if (method === "executionTimeAsc") {
            res.send({data: groupedByExecutionTimeAsc})
        } else if (method === "executionTimeDesc") {
            res.send({data: groupedByExecutionTimeDesc})
        } else if (method === "basic") {
            res.send(transformedData); // 변환된 데이터를 응답으로 보냄
        } else {
            res.send("Error api endpoint")
        }
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
