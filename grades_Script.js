document.addEventListener("DOMContentLoaded", async () => {
    chrome.storage.local.get("gradeTableData", res => {
        if (res.gradeTableData && res.gradeTableData.length > 0) {
            console.log("grades are already loaded");
            loadInfo(res.gradeTableData);
        } else {
            getInfo();
        }
    });
});

const gradeTable = document.getElementById("gradeTable").getElementsByTagName("tbody")[0];
const averageGrade = document.getElementById("gradeAverage");
const pointTotal = document.getElementById("pointTotal");

async function loadInfo(tableData) {
    let averageGradeCalc = 0;
    let pointTotalCalc = 0;
    let pointTotalDivide = 0;

    gradeTable.innerHTML = "";

    for (let i = 0; i < tableData.length; i++) {

        const points = tableData[i][4] === true? +tableData[i][0]*1.5 : +tableData[i][0]; // Multiply points for advanced courses
        if (tableData[i][1] !== "") { // Only include in weighted calculation if not passing binary
            pointTotalDivide += points;
            averageGradeCalc += +tableData[i][1] * points; // Multiply grade by points
        }
        pointTotalCalc += +tableData[i][0]; // Sum total points
    }

    averageGrade.textContent = Math.round(averageGradeCalc/pointTotalDivide).toString()
    pointTotal.textContent = pointTotalCalc.toString();

    tableData.forEach(row => {
        const newRow = gradeTable.insertRow();

        newRow.insertCell(0).textContent = row[0];
        newRow.cells.item(0).setAttribute("style", "display: none;");
        newRow.insertCell(1).textContent = row[1];
        newRow.insertCell(2).textContent = row[2];
        newRow.insertCell(3).textContent = row[3];
        newRow.cells.item(3).classList.add("flex");
    });
}

async function getInfo() {
    try {
        const html = await fetchHTML("https://sheilta.apps.openu.ac.il/pls/dmyopt2/course_info.courses");
        const parser = new DOMParser();
        const doc = await parser.parseFromString(html, "text/html");
        const tbody = doc.querySelector("body > table > tbody > tr:nth-child(5) > td > table > tbody > tr > td > table > tbody");

        //redirected
        if (!tbody){
            const script = doc.querySelector("script");
            const redirectedUrl =  script?.textContent?.match(/top\.location\.href\s*=\s*"([^"]+)"/);
            console.log("Redirected to:", redirectedUrl[1]);
            window.open(redirectedUrl[1], '_blank');
        }

        const rows = tbody.querySelectorAll("tr");

        let tableData= [];
        for (const row of rows) {
            const points = row.cells.item(2).querySelector("font").textContent.trim();
            if (+points > 0) {

                let rowData = [];
                rowData.push(points);
                rowData.push(row.cells.item(4).querySelector("font").textContent)
                rowData.push(row.cells.item(5).querySelector("font").textContent);
                rowData.push(row.cells.item(7).querySelector("font").textContent.trim());
                const advanced = await isAdvanced(row.cells.item(8).querySelector("a").textContent);
                rowData.push(advanced);

                tableData.push(rowData);
            }
        }
        await chrome.storage.local.set({gradeTableData: tableData});
        loadInfo(tableData);

    } catch (error) {
        console.error("Error while getting info: ", error);
    }
}

async function isAdvanced(courseNumber) {
    let url = "https://www.openu.ac.il/courses/" + courseNumber + ".htm";
    try {
        const html = await fetchHTML(url);
        if (html) {
            const parser = new DOMParser();
            const doc = await parser.parseFromString(html, "text/html");

            for (const element of doc.querySelectorAll("strong")) {
                if (element.innerHTML.includes("רגילה" ,18)){
                    return false;
                }
                else if (element.innerHTML.includes("מתקדמת" ,18)) {
                    return true;
                }
            }
            return false;
        }
    } catch (err) {
        console.log(err);
        return false;
    }
}

document.getElementById("refresh").addEventListener('click', (e) => {
    gradeTable.innerHTML = "";
    getInfo();
});