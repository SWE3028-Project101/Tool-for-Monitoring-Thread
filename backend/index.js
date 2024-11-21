const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = 9000;
let transformedData;
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
        if (!body) {
            console.error('Empty response body');
            transformedData = {};
            return;
        }

        let resBody;
        try {
            resBody = JSON.parse(body); // JSON 문자열을 객체로 변환
        } catch (parseError) {
            console.error('JSON parsing error:', parseError);
            return;
        }

        transformedData = {
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
    console.log('host : ' + host);
    console.log('port : ' + port);
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
        //const data = fs.readFileSync('data.json', 'utf-8');
        //const jsonData = JSON.parse(data); // JSON 문자열을 객체로 변환
        console.log("send", transformedData);
        res.send(transformedData);
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
            const page = parseInt(req.query.page, 10) || 1;

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
            const itemsPerPage = 10;                           // 한 페이지에 표시할 항목 수
            const totalPage = Math.ceil(filteredAndSortedByMemoryUsage.length / itemsPerPage); // 전체 페이지 수
            const currentPage = Math.min(page, totalPage);     // 요청한 페이지가 최대 페이지를 초과하지 않도록 제한
            const startIndex = (currentPage - 1) * itemsPerPage; // 현재 페이지 시작 인덱스
            const paginatedData = filteredAndSortedByMemoryUsage.slice(startIndex, startIndex + itemsPerPage);
            res.send({
                data: paginatedData,  // 현재 페이지의 데이터
                totalPage,            // 전체 페이지 수
                currentPage,      // 현재 페이지 번호
                number: filteredAndSortedByMemoryUsage.length
            });

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
        const startDate = req.query.startDate // 형식은 2024-10-06
        const startHour = req.query.startHour
        const endDate = req.query.endDate // 형식은 2024-10-06
        const endHour = req.query.endHour
        const calc = req.query.calc
        const startTime = new Date(`${startDate}T${startHour.toString().padStart(2, '0')}:00:00`);
        const endTime = new Date(`${endDate}T${endHour.toString().padStart(2, '0')}:00:00`);
        const page = parseInt(req.query.page, 10) || 1;

        if (title === "memoryUsage" && calc === "average") {
            const groupedData = jsonData.reduce((acc, item) => {
                const uri = item.uri;
                const memoryUsage = parseFloat(item.memoryUsage);

                if (!acc[uri]) {
                    acc[uri] = {totalMemoryUsage: 0, count: 0};
                }
                acc[uri].totalMemoryUsage += memoryUsage;
                acc[uri].count += 1;

                return acc;
            }, {});

            const result = Object.entries(groupedData).map(([uri, {totalMemoryUsage, count}]) => ({
                uri,
                averageMemoryUsage: (totalMemoryUsage / count).toFixed(0), // 평균값 계산 및 소수점 제거
            }));

            const itemsPerPage = 10;                           // 한 페이지에 표시할 항목 수
            const totalPage = Math.ceil(result.length / itemsPerPage); // 전체 페이지 수
            const currentPage = Math.min(page, totalPage);     // 요청한 페이지가 최대 페이지를 초과하지 않도록 제한
            const startIndex = (currentPage - 1) * itemsPerPage; // 현재 페이지 시작 인덱스
            const paginatedData = result.slice(startIndex, startIndex + itemsPerPage);
            res.send({
                data: paginatedData,  // 현재 페이지의 데이터
                totalPage,            // 전체 페이지 수
                currentPage           // 현재 페이지 번호
            });

        } else if (title === "memoryUsage" && calc === "max") {
            const groupedData = jsonData.reduce((acc, item) => {
                const uri = item.uri;
                const memoryUsage = parseFloat(item.memoryUsage);

                if (!acc[uri]) {
                    acc[uri] = {maxMemoryUsage: memoryUsage};
                } else {
                    acc[uri].maxMemoryUsage = Math.max(acc[uri].maxMemoryUsage, memoryUsage);
                }

                return acc;
            }, {});

// 결과 변환
            const result = Object.entries(groupedData).map(([uri, {maxMemoryUsage}]) => ({
                uri,
                maxMemoryUsage: maxMemoryUsage.toString() // 숫자를 문자열로 변환
            }));
            const itemsPerPage = 10;                           // 한 페이지에 표시할 항목 수
            const totalPage = Math.ceil(result.length / itemsPerPage); // 전체 페이지 수
            const currentPage = Math.min(page, totalPage);     // 요청한 페이지가 최대 페이지를 초과하지 않도록 제한
            const startIndex = (currentPage - 1) * itemsPerPage; // 현재 페이지 시작 인덱스
            const paginatedData = result.slice(startIndex, startIndex + itemsPerPage);
            res.send({
                data: paginatedData,  // 현재 페이지의 데이터
                totalPage,            // 전체 페이지 수
                currentPage           // 현재 페이지 번호
            });


        } else if (title === "callCount") {

            // 지정된 시간 범위에 포함된 데이터 필터링
            const groupedByDateTime = jsonData.filter(item => {
                const itemTime = new Date(item.time); // item.time도 Date 객체로 변환
                return itemTime >= startTime && itemTime <= endTime;
            });

            const groupedData = groupedByDateTime.reduce((acc, item) => {
                const uri = item.uri;
                const calledNum = parseFloat(item.calledNum);

                if (!acc[uri]) {
                    acc[uri] = { uri, calledNum: 0 };
                }

                // 중복된 uri가 있으면 calledNum 증가
                acc[uri].calledNum += 1;

                return acc;
            }, {});
            const sortedData = Object.values(groupedData).sort((a, b) => b.calledNum - a.calledNum);

            const itemsPerPage = 10;                           // 한 페이지에 표시할 항목 수
            const totalPage = Math.ceil(sortedData.length / itemsPerPage); // 전체 페이지 수
            const currentPage = Math.min(page, totalPage);     // 요청한 페이지가 최대 페이지를 초과하지 않도록 제한
            const startIndex = (currentPage - 1) * itemsPerPage; // 현재 페이지 시작 인덱스
            const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);
            res.send({
                data: paginatedData,  // 현재 페이지의 데이터
                totalPage,            // 전체 페이지 수
                currentPage           // 현재 페이지 번호
            });
        } else {
            res.send("get api parameter를 올바르게 넣어주세요.");
        }

    } catch
        (error) {
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
