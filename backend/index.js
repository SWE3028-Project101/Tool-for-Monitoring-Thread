const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = 9000;
global.portNum = "";
global.hostName = "";

app.use(bodyParser.json());

// API 호출 함수
function fetchApiData() {

    if (!global.hostName || !global.portNum) {
        console.error('Host name or port number is missing!');
        return; // hostName 또는 portNum이 없으면 요청하지 않음
    }

    const options = {
        uri: `http://${global.hostName}:${global.portNum}/actuator/metrics/custom.memory.usage`
    };

    request(options, function (err, response, body) {
        if (err) {
            console.error('Request error:', err);
            return;
        }

        // body가 비어 있는지 확인
        if (!body) {
            console.error('Empty response body');
            return;
        }

        let resBody;
        try {
            resBody = JSON.parse(body); // JSON 문자열을 객체로 변환
        } catch (parseError) {
            console.error('JSON parsing error:', parseError);
            return;
        }

        const transformedData = {
            data: resBody.availableTags.find(tag => tag.tag === "requestNum")?.values.map((requestNumValue) => {
                const index = parseInt(requestNumValue) - 1; // 1-based index for `requestNum`

                const getValueBySuffix = (tag, suffix) => {
                    const tagData = resBody.availableTags.find(t => t.tag === tag);
                    const matchingValue = tagData?.values.find(value => value.endsWith(`-${suffix}`));
                    return matchingValue ? matchingValue.replace(/-\d+$/, '') : null;
                };

                // Suffix for URI
                const uriWithSuffix = resBody.availableTags.find(tag => tag.tag === "uri")?.values[index];
                const suffix = uriWithSuffix?.split('-').pop();

                // Extract values based on suffix
                const uri = uriWithSuffix ? uriWithSuffix.replace(/-\d+$/, '') : null;
                const memoryUsage = getValueBySuffix("memoryUsage", suffix);
                const executionTime = getValueBySuffix("executingTime", suffix);
                const time = getValueBySuffix("currentTime", suffix);
                const errorValue = getValueBySuffix("error", suffix);

                // Determine isError based on error tag value
                const isError = errorValue && errorValue.includes("no error") ? "false" : "true";

                return {
                    uri: uri,
                    memoryUsage: memoryUsage,
                    executionTime: executionTime,
                    time: time,
                    isError: isError,
                    calledNum: 0
                };
            })
        };

        const updateCalledNumConsistently = (dataArray) => {
            // Count occurrences of each unique URI
            const uriCountMap = {};

            // First pass to count total occurrences for each unique URI
            dataArray.forEach(item => {
                const uri = item.uri;
                if (!uriCountMap[uri]) {
                    uriCountMap[uri] = 1;
                } else {
                    uriCountMap[uri] += 1;
                }
            });

            // Second pass to set calledNum based on uriCountMap
            return dataArray.map(item => ({
                ...item,
                calledNum: uriCountMap[item.uri] // Set calledNum as the total count for this URI
            }));
        };

        fs.writeFileSync('data.json', JSON.stringify(updateCalledNumConsistently(transformedData.data), null, 2), 'utf-8');
        console.log('Data saved to data.json');
    })
}

// 5초마다 API 호출
setInterval(fetchApiData, 5000);

app.post('/api', (req, res) => {
    const {host, port: targetPort, threadPoolSize} = req.body;

    global.portNum = targetPort
    global.hostName = host

    fetchApiData();

    try {
        const data = fs.readFileSync('data.json', 'utf-8');
        const jsonData = JSON.parse(data); // JSON 문자열을 객체로 변환
        res.json(jsonData); // 클라이언트에 JSON 데이터 전송
    } catch (error) {
        console.error('파일을 읽거나 파싱하는 중 오류가 발생했습니다');
        return res.status(500).send('오류가 발생했습니다.');
    }
});

app.get('/api/mainPage', (req, res) => {
    try {
        const data = fs.readFileSync('data.json', 'utf-8');
        const jsonData = JSON.parse(data); // JSON 문자열을 객체로 변환
        res.send(jsonData);
    } catch (error) {
        console.error('파일을 읽거나 파싱하는 중 오류가 발생했습니다');
        return res.status(500).send('오류가 발생했습니다.');
    }
});

//post로 host와 port를 먼저 받아야 함.
app.get('/api', (req, res) => {

        try {
            const data = fs.readFileSync('data.json', 'utf-8');
            const jsonData = JSON.parse(data); // JSON 문자열을 객체로 변환

            const searchString = req.query.search
            const date = req.query.date // 형식은 2024-10-06
            const time = req.query.time // 형식은 18
            const memoryUsage = parseFloat(req.query.memoryUsage); // memoryUsage 기준 값
            const executionTime = parseFloat(req.query.executionTime);
            const dateTime = date + "T" + time

            // searchString과 dateTime을 포함하는 항목만 필터링
            const matchingEntries = [...jsonData].filter(item => item.uri.includes(searchString) && item.time.includes(dateTime));

            // executionTime이 기준 이상인 항목 필터링 후 오름차순 정렬
            const filteredAndSortedByExecutionTime = matchingEntries
                .filter(item => parseFloat(item.executionTime.replace('ms', '')) >= executionTime)
                .sort((a, b) => parseFloat(a.executionTime.replace('ms', '')) - parseFloat(b.executionTime.replace('ms', '')));

            // memoryUsage가 기준 이상인 항목 필터링 후 오름차순 정렬
            const filteredAndSortedByMemoryUsage = filteredAndSortedByExecutionTime
                .filter(item => parseFloat(item.memoryUsage) >= memoryUsage)
                .sort((a, b) => parseFloat(a.memoryUsage) - parseFloat(b.memoryUsage));

            res.send({data: filteredAndSortedByMemoryUsage, number: filteredAndSortedByMemoryUsage.length});

        } catch
            (error) {
            console.error('파일을 읽거나 파싱하는 중 오류가 발생했습니다');
            return res.status(500).send('오류가 발생했습니다.');
        }
    }
)
;

app.get('/api/error', (req, res) => {

    try {
        const data = fs.readFileSync('data.json', 'utf-8');
        const jsonData = JSON.parse(data);

        const filteredAndSortedData = jsonData
            .filter(item => item.isError === "true") // isError가 true인 항목만 필터링
            .sort((a, b) => new Date(b.time) - new Date(a.time)); // 최신순으로 정렬
        res.send(filteredAndSortedData);

    } catch (error) {
        console.error('파일을 읽거나 파싱하는 중 오류가 발생했습니다');
        return res.status(500).send('오류가 발생했습니다.');
    }
});

app.get('/api/rank', (req, res) => {

    try {
        const data = fs.readFileSync('data.json', 'utf-8');
        const jsonData = JSON.parse(data); // JSON 문자열을 객체로 변환
        const title = req.query.title
        const date = req.query.date // 형식은 2024-10-06
        const time = req.query.time // 형식은 18
        const dateTime = date + "T" + time

        const groupedByDateTime = jsonData.filter(item => item.time.includes(dateTime));

        if (title === "memoryUsage") {
            groupedByDateTime.sort((a, b) => parseFloat(b.memoryUsage) - parseFloat(a.memoryUsage));
        } else if (title === "callCount") {
            groupedByDateTime.sort((a, b) => parseInt(b.calledNum) - parseInt(a.calledNum));
        }

        res.send({data: groupedByDateTime});
    } catch (error) {
        console.error('파일을 읽거나 파싱하는 중 오류가 발생했습니다');
        return res.status(500).send('오류가 발생했습니다.');
    }
})

app.get('/api/state', (req, res) => {

    const options = {
        uri: `http://${global.hostName}:${global.portNum}/actuator/threaddump`, // 프로토콜 추가
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

        const transformedData = resBody
        let data = transformedData.threads;

        const waitingThreadsCount = data.filter(thread => thread.threadState === "WAITING").length;
        const runnableThreadsCount = data.filter(thread => thread.threadState === "RUNNABLE").length;
        const timedWaitingThreadsCount = data.filter(thread => thread.threadState === "TIMED_WAITING").length;
        const terminatedThreadsCount = data.filter(thread => thread.threadState === "TERMINATED").length;

        res.send({
            waitingCount: waitingThreadsCount,
            runnableCount: runnableThreadsCount,
            timedWaitingCount: timedWaitingThreadsCount,
            terminatedCount: terminatedThreadsCount,
        });
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
