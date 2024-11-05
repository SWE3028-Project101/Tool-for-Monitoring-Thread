const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const app = express();
const port = 9000;
global.portNum = "";
global.hostName = "";

app.use(bodyParser.json());

app.post('/api', (req, res) => {
    const { host, port: targetPort, threadPoolSize } = req.body;

    global.portNum = targetPort
    global.hostName = host

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

        res.send(data)
    });
});

//post로 host와 port를 먼저 받아야 함.
app.get('/api', (req, res) => {

    const options = {
        uri: `http://${global.hostName}:${global.portNum}/actuator/metrics/custom.memory.usage`, // 프로토콜 추가
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
        const searchString = req.query.search
        const date = req.query.date // 형식은 2024-10-06
        const time = req.query.time // 형식은 18
        const memoryUsage = req.query.memoryUsage
        const executionTime = req.query.executionTime // 형식은 18
        const dateTime = date + "T" + time

        const matchingEntries = [...data].filter(item => item.uri.includes(searchString));
        const groupedByDateTime = matchingEntries.filter(item => item.time.includes(dateTime));

        // time 기준으로 정렬 (오름차순, 내림차순)
        // let groupedByRecentTime = [...data].sort((a, b) => new Date(b.time) - new Date(a.time))
        // let groupedByEarlyTime = [...data].sort((a, b) => new Date(a.time) - new Date(b.time))

        if (executionTime === "desc") {
            groupedByDateTime.sort((a, b) => {
                const timeA = a.executionTime ? parseFloat(a.executionTime.replace('ms', '')) : 0; // 기본값 0 설정
                const timeB = b.executionTime ? parseFloat(b.executionTime.replace('ms', '')) : 0; // 기본값 0 설정
                return timeB - timeA;
            });
        } else if (executionTime === "asc") {
            groupedByDateTime.sort((a, b) => {
                const timeA = a.executionTime ? parseFloat(a.executionTime.replace('ms', '')) : 0; // 기본값 0 설정
                const timeB = b.executionTime ? parseFloat(b.executionTime.replace('ms', '')) : 0; // 기본값 0 설정
                return timeA - timeB;
            });
        }

        if (memoryUsage === "desc") {
            groupedByDateTime.sort((a, b) => parseFloat(b.memoryUsage) - parseFloat(a.memoryUsage));
        } else if (memoryUsage === "asc") {
            groupedByDateTime.sort((a, b) => parseFloat(a.memoryUsage) - parseFloat(b.memoryUsage));
        }

        res.send({data: groupedByDateTime, number: groupedByDateTime.length});
    });
});

app.get('/api/rank', (req, res) => {

    const options = {
        uri: `http://${global.hostName}:${global.portNum}/actuator/metrics/custom.memory.usage`, // 프로토콜 추가
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
        const title = req.query.title
        const date = req.query.date // 형식은 2024-10-06
        const time = req.query.time // 형식은 18
        const dateTime = date + "T" + time

        const groupedByDateTime = data.filter(item => item.time.includes(dateTime));

        if (title === "memoryUsage") {
            groupedByDateTime.sort((a, b) => parseFloat(b.memoryUsage) - parseFloat(a.memoryUsage));
        } else if (title === "callCount") {
            groupedByDateTime.sort((a, b) => parseInt(b.calledNum) - parseInt(a.calledNum));
        }

        res.send({data: groupedByDateTime});
    });
});

//TODO
// app.get('/api/state', (req, res) => {
//
//     const options = {
//         uri: `http://${global.hostName}:${global.portNum}/actuator/metrics/custom.memory.usage`, // 프로토콜 추가
//     };
//
//     request(options, function (err, response, body) {
//         if (err) {
//             console.error('Request error:', err);
//             return res.status(500).send('Error fetching actuator data');
//         }
//
//         // body가 비어 있는지 확인
//         if (!body) {
//             console.error('Empty response body');
//             return res.status(500).send('Received empty response');
//         }
//
//         let resBody;
//         try {
//             resBody = JSON.parse(body); // JSON 문자열을 객체로 변환
//         } catch (parseError) {
//             console.error('JSON parsing error:', parseError);
//             return res.status(500).send('Error parsing JSON data');
//         }
//
//         const transformedData = {
//             data: resBody.availableTags[0].values.map((_, index) => {
//                 const errorTag = resBody.availableTags.find(tag => tag.tag === "error");
//
//                 return {
//                     uri: resBody.availableTags.find(tag => tag.tag === "uri")?.values[index],
//                     memoryUsage: resBody.availableTags.find(tag => tag.tag === "memoryUsage")?.values[index],
//                     executionTime: resBody.availableTags.find(tag => tag.tag === "executingTime")?.values[index],
//                     time: resBody.availableTags.find(tag => tag.tag === "currentTime")?.values[index],
//                     isError: errorTag && errorTag.values[index] && errorTag.values[index].includes("error") ? "true" : "false",
//                     calledNum: resBody.availableTags.find(tag => tag.tag === "requestNum")?.values[index]
//                 };
//             })
//         }
//         let data = transformedData.data;
//
//         res.send(data);
//     });
// });

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
