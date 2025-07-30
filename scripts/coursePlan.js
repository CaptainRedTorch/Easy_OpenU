chrome.runtime.connect({ name: "popup" });

const tableBody = document.getElementById("courseTable").getElementsByTagName("tbody")[0];
const addRowButton = document.getElementById("addRow");

const colors = [
    "#ffb9b9","#c8f1b5",
    "#eec5ff","#c5e9ff",
    "#ffd49e", "#d7caff",
]; // Rotate over 5 colors
let semesterColors = {}; // Store colors for semester years
let colorIndex = 0;
const defaultColor= "#e7e7e7";

addRowButton.addEventListener("click", addRow);
document.getElementById("export").addEventListener("click", exportTableToCSV);
document.getElementById("save").addEventListener("click", saveTableToStorage);

function addRow(e,point, courseName, index, semester, fromSave) {
    point = point? point: "נז";
    courseName = courseName? courseName: "שם קורס";
    index = index? index: "מספר";
    semester = semester? semester: "סמסטר";

    const row = tableBody.insertRow();
    row.setAttribute("draggable", true);
    row.addEventListener("dragstart", dragStart);
    row.addEventListener("dragover", dragOver);
    row.addEventListener("drop", drop);

    // Editable semester points
    createEditableCell(row, row.insertCell(0), point);

    // Editable course name
    createEditableCell(row, row.insertCell(1), courseName);

    // Editable semester index
    createEditableCell(row, row.insertCell(2), index);

    // Editable semester period
    createEditableCell(row, row.insertCell(3), semester);


    // Delete button
    const actionsCell = row.insertCell(4);
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "X";
    deleteBtn.classList.add("delete");
    deleteBtn.onclick = () => {
        row.remove();
        updatePointTotal();
    }
    actionsCell.appendChild(deleteBtn);

    tableBody.appendChild(row);
    if (fromSave)
        updateRowColors(row);
    else
        row.style.backgroundColor = defaultColor;

}

function createEditableCell(row, cell, defaultValue) {
    cell.classList.add("editable");
    cell.textContent = defaultValue;
    cell.addEventListener("click", function () {
        const newValue = prompt(`Edit ${defaultValue}`, cell.textContent);
        if (newValue !== null) {
            cell.textContent = newValue;
            if (cell === row.cells[3])
                updateRowColors(row); // Update colors in case semester year changes

            if (cell === row.cells[2])
                updateCourseData(row, cell, defaultValue);

            if (cell === row.cells[0])
                updatePointTotal();
        }
    });
}

async function updateCourseData(row, cell) {
    const courseNumber = cell.textContent;
    if (!isNaN(+courseNumber.toString())) {
        fetchCourseData(courseNumber).then((data) => {
            row.cells[1].textContent =data.name;
            row.cells[0].textContent = data.points;
            updatePointTotal();
            saveTableToStorage();
        });
    }
}

async function fetchCourseData(courseNumber) {
    let url = "https://www.openu.ac.il/courses/" + courseNumber + ".htm";
    try {
        const html = await fetchHTML(url);
        if (html) {
            const parser = new DOMParser();
            const doc = await parser.parseFromString(html, "text/html");
            //get course name
            const courseName = doc.querySelector("#course_title").textContent.replace(/[0-9]/g, '');
            //get course points
            const coursePoints = extractPoints(doc);

            return {name: courseName, points: coursePoints};
        }
        throw new Error("couldn't find course name");
    } catch (err) {
        console.log(err);
        return {name: "Invalid", points: 0};
    }
}

function extractPoints(doc){
    for (const element of doc.querySelectorAll("strong")) {
        if (element.innerHTML.includes("זכות")) {
            const p = element.innerHTML.replace(/[^0-9]/g, '');
            let sum =0;
            for (let i = 0; i < p.length; i++) {
                sum += +p.charAt(i);
            }
            return sum
        }
    }
    return '0'
}

function updatePointTotal() {
    const rows = tableBody.getElementsByTagName("tr");
    let totalPoints = 0;
    for (let row of rows) {
        const points = row.cells[0].textContent.trim();
        if (!isNaN(+points.toString())) {
            totalPoints += +points.toString();
        }
    }
    document.getElementById("totalPoints").innerHTML = totalPoints;
}

function updateRowColors(row) {
    const semesterYear = row.cells[3].textContent.trim(); // Semester year is in column 3
    if (!/\d/.test(semesterYear)) {
        row.style.backgroundColor = defaultColor; // Set default color if no number found
    } else {
        if (!semesterColors[semesterYear]) {
            semesterColors[semesterYear] = colors[colorIndex % colors.length];
            colorIndex++;
        }
        row.style.backgroundColor = semesterColors[semesterYear];
    }
}

function dragStart(e) {
    e.dataTransfer.setData("text/plain", e.target.rowIndex);
}

function dragOver(e) {
    e.preventDefault();
}

function drop(e) {
    const draggedRowIndex = e.dataTransfer.getData("text/plain");
    const draggedRow = document.getElementById('courseTable').rows[draggedRowIndex];
    const targetRow = e.target.closest('tr');

    if (draggedRow && targetRow && draggedRow !== targetRow) {
        const table = document.getElementById('courseTable').getElementsByTagName('tbody')[0];
        table.insertBefore(draggedRow, targetRow);
    }
}

async function exportTableToCSV() {
    const tableBody = document.getElementById("courseTable").getElementsByTagName("tbody")[0];
    let csvContent = "\uFEFF";

    // Loop through rows
    for (let row of tableBody.rows) {
        let rowData = [];
        for (let i = 3; i >= 0; i--) {
            rowData.push(`"${row.cells[i].textContent.replace(/"/g, '""')}"`);
        }
        csvContent += rowData.join(",") + "\n";
    }
    // Open a file picker
    try {
        const handle = await window.showSaveFilePicker({
            suggestedName: "coursesPlan.csv",
            types: [
                {
                    description: "CSV Files",
                    accept: {"text/csv": [".csv"]}
                }
            ]
        });

        // Write to file
        const writable = await handle.createWritable();
        await writable.write(csvContent);
        await writable.close();
    } catch (err) {
        console.error("File save cancelled or failed:", err);
    }
}

async function saveTableToStorage(){
    var data = [];
    for (var i = 0; i < tableBody.rows.length; i++) {
        var tableRow = tableBody.rows[i];
        var rowData = [];
        for (let j = 3; j >= 0; j--) {
            rowData.push(tableRow.cells[j].innerHTML);
        }
        data.push(rowData);
    }
    const isEmpty = data.length > 0;
    chrome.storage.local.set({coursesPlanner: data , colorData: {colors :semesterColors, index: colorIndex} ,hasPlanner: isEmpty});
}

function loadTableFromStorage(data){
    data.forEach(row => {
        // Call the addRow function for each row in the JSON array
        addRow("none",row[3], row[2], row[1], row[0], true); // Reverse the order as per your data structure
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    chrome.storage.local.get("hasPlanner",(response) => {
        hasPlanner = response.hasPlanner;
        if (hasPlanner) {
            chrome.storage.local.get("coursesPlanner" , (response) => {
                const data = response.coursesPlanner;
                chrome.storage.local.get("colorData",(response)=>{
                    console.log(response);
                    semesterColors = response.colorData.colors;
                    colorIndex = response.colorData.index;
                    console.log(semesterColors);
                    loadTableFromStorage(data);
                });
            });
        }
    });
});

document.addEventListener("", async () => {})

document.getElementById("clear").addEventListener('click', (e) => {
    const answer = confirm("Are you sure?");
    if (answer) {
        semesterColors = {};
        colorIndex = 0;
        const rows = tableBody.getElementsByTagName("tr");
        const rowCount = rows.length;
        for (let i = rowCount - 1; i >= 0; i--) {
            tableBody.removeChild(rows[i]);
        }
    }
});

