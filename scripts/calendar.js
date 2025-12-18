let viewedMonth = new Date().getMonth() + 1;
let viewedDay = new Date().getDate();
let viewedYear = new Date().getFullYear();
let selectedButton;

window.addEventListener('load', () => {
    checkThanChange();
});

function checkThanChange() {
    chrome.storage.local.get("calendarSwitch", calendarSwitch => {
        if (!calendarSwitch.calendarSwitch) {
            setTimeout(changeCalendar, 100);
        }
    });
}

async function changeCalendar() {
    try {
        const frame = window.frames["sisma"]; // Use the name attribute

        frame.addEventListener("load", () => {
            checkThanChange();
        });

        if (!frame) {
            console.error("Frame not found!");
            return;
        }
        const frameDoc = frame.document || frame.contentDocument;
        if (!frameDoc) {
            console.error("Cannot access frame content!");
            return;
        }

        const frameSet = document.querySelector('frameset'); // Select the frame element
        const mainTable = frameDoc.querySelector("#site > table")
        const style = mainTable.querySelector("tbody > tr:nth-child(3) > td > style:nth-child(1)");
        const navTable = mainTable.querySelector("tbody > tr:nth-child(2) > td > table")

        const table = mainTable.querySelector("table > tbody > tr:nth-child(3) > td > div:nth-child(5) > table");
        const fonts = table.querySelectorAll("font");
        const bottomRow = frameDoc.querySelector("#site > table > tbody > tr:nth-child(4) > td")
        bottomRow.remove();

        const tableBody = table.querySelector("tbody");
        if (!tableBody) {
            console.error("Table body not found inside frame!");
            return;
        }
        adjustTopFrame(frameSet);
        changeIcons(mainTable);
        replaceCSS(style);
        adjustNavTable(navTable, mainTable);
        adjustFont(fonts);
        const rows = tableBody.rows;
        table.classList.add("calendar-container");
        removeFirstColumns(rows);
        adjustCells(rows, navTable);
        adjustMainTable(mainTable);

    } catch (e) {
        console.error(e);
    }
}

function injectCSS(fileUrl, location) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = fileUrl;
    location.appendChild(link);
}

function replaceCSS(style) {
    if (style) {
        injectCSS(chrome.runtime.getURL("/css/styleCalendar.css"), style.parentElement);
    }
}

function adjustNavTable(navTable, mainTable) {
    const monthNames = {
        '01': 'ינואר', '02': 'פברואר', '03': 'מרץ', '04': 'אפריל',
        '05': 'מאי', '06': 'יוני', '07': 'יולי', '08': 'אוגוסט',
        '09': 'ספטמבר', '10': 'אוקטובר', '11': 'נובמבר', '12': 'דצמבר'
    };
    navTable.style.width = "100%";
    navTable.align = "center";

    //get elements
    const left = navTable.querySelector('tbody > tr > td:nth-child(3)');
    const center = navTable.querySelector('tbody > tr > td:nth-child(2)');
    const right = navTable.querySelector('tbody > tr > td:nth-child(1)');

    //set month navigation buttons
    changeNextButton(left, "〉");
    changeNextButton(right, "〈");

    //set the navigation table,div style
    const divTable = mainTable.querySelector("tr:nth-child(3) > td > div:nth-child(5)");
    divTable.style.display = "flex";
    divTable.style.width = "max-content";
    divTable.align = "center";
    divTable.style.margin = "20px auto 100px auto";
    const table = divTable.querySelector("table");
    divTable.insertBefore(right, table);
    divTable.insertBefore(left, table.nextSibling);

    center.parentElement.setAttribute("class", "top-nav");

    const reminderForm = createReminderForm();
    const scheduleButtons = createScheduleButtons(reminderForm);
    scheduleButtons.forEach(scheduleButton => {
        center.parentElement.appendChild(scheduleButton);
    })
    center.parentElement.appendChild(reminderForm);

    //set month title
    const link = center.querySelector('a[href]');
    const onClick = link.getAttribute('onclick');
    const href = link.getAttribute('href');
    const monthNumber = href.match(/(\d{2})$/)?.[1];
    const monthName = monthNames[monthNumber];

    viewedMonth = +monthNumber;
    viewedYear = href.match(/#(\d{4})/)?.[1];

    center.outerHTML = `<button class="month-title" onclick="window.parent.location.href=\'${onClick}\'">${monthName} ${viewedYear}</button>`


}

async function changeNextButton(element, text) {
    const oldLink = element.querySelector('a');
    if (oldLink) {
        const href = oldLink.getAttribute('href');
        element.innerHTML = `<button class="next" onclick="window.parent.location.href='${href}'">${text}</button>`;
    }
    element.remove();
}

function createReminderForm() {
    const div = document.createElement('div');
    div.id = 'reminderForm';
    div.style.display = 'none';
    div.setAttribute('class', 'reminder');

    // Create select element for notification title
    const titleLabel = document.createElement('label');
    titleLabel.textContent = 'תזכיר לי';
    titleLabel.setAttribute('class', 'reminder');
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.setAttribute('class', 'reminder');

    // Create input for message
    const messageLabel = document.createElement('label');
    messageLabel.textContent = 'פרטים';
    messageLabel.setAttribute('class', 'reminder');
    const messageInput = document.createElement('input');
    messageInput.type = 'text';
    messageInput.setAttribute('class', 'reminder');

    // Create input for time
    const timeLabel = document.createElement('label');
    timeLabel.textContent = 'ב-';
    timeLabel.setAttribute('class', 'reminder');
    const timeInput = document.createElement('input');
    timeInput.type = 'datetime-local';
    timeInput.setAttribute('class', 'reminder');
    timeInput.classList.add('time');

    // Create set reminder button
    const setReminderButton = document.createElement('button');
    setReminderButton.textContent = 'קבע';
    setReminderButton.setAttribute('class', 'reminder');

    // Append elements to form
    div.appendChild(titleLabel);
    div.appendChild(titleInput);
    div.appendChild(messageLabel);
    div.appendChild(messageInput);
    div.appendChild(timeLabel);
    div.appendChild(timeInput);
    div.appendChild(setReminderButton);

    setReminderButton.addEventListener('click', () => {
        const title = titleInput.value;
        const message = messageInput.value;
        const dateTime = timeInput.value;

        if (title && dateTime) {
            const date = new Date(dateTime);
            console.log(date + "");
            const reminderID = 'reminder-' + Date.now();

            if (Date.now() > date)
            {
                alert("Reminders are for future dates")
                return;
            }

            chrome.runtime.sendMessage({
                action: "setReminder",
                reminderID: reminderID,
                title: title,
                messageTxt: message,
                time: date.toISOString()
            });
            alert("Reminder set for " + date.toLocaleDateString() + " at " + date.toLocaleTimeString());
            titleInput.value = "";
            messageInput.value = "";
            timeInput.value = "";
        } else
            alert("Reminder missing title or time");
    });

    return div;
}

function createScheduleButtons(reminderForm) {
    let buttons = [];

    //set time button
    buttons.push(document.createElement('button'));
    buttons[0].setAttribute('class', 'time');
    buttons[0].textContent = "תזכורת חדשה";
    buttons[0].addEventListener('click', () => {
        reminderForm.style.display === 'none' ? reminderForm.style.display = 'block' : reminderForm.style.display = 'none';
    });

    //add to google calender button
    buttons.push(document.createElement('button'));
    buttons[1].setAttribute('class', 'time');
    buttons[1].textContent = "הוספה ליומן";
    buttons[1].addEventListener('click', () => {
        addToCalendar();
    });

    //clear time button
    buttons.push(document.createElement('button'));
    buttons[2].setAttribute('class', 'time');
    buttons[2].textContent = "ניקוי תזכורות";
    buttons[2].addEventListener('click', () => {
        clearReminders();
    });

    return buttons
}

async function addToCalendar() {
    if (selectedButton) {
        selectedButton.querySelectorAll('div').forEach((event) => {

            function extractTime(text) {
                const match = text.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
                return match ? {startTime: match[1], endTime: match[2]} : {startTime: '17:00', endTime: '18:00'};
            }

            const title = event.nextElementSibling.firstChild.textContent;
            let time = extractTime(event.textContent);
            if (title.substring(0, 4) === "מבחן")
                time = {startTime: '16:00', endTime: '19:30'};
            const {
                startDate,
                endDate
            } = convertToGoogleFormat(viewedYear, viewedMonth, viewedDay, time.startTime, time.endTime);

            const baseUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE";
            const url = `${baseUrl}&text=${encodeURIComponent(title)}
        &dates=${startDate}/${endDate}
        &details=${encodeURIComponent('')}`;
            window.open(url, "_blank");
        });
    } else
        alert("You need to select a date");
}

async function clearReminders() {
    chrome.runtime.sendMessage({action: "clearReminders"});
    alert("Notifications cleared");
}

function convertToGoogleFormat(year, month, day, startTime, endTime) {
    function formatDate(year, month, day, time) {
        const [hours, minutes] = time.split(":").map(Number);
        const date = new Date(year, month - 1, day, hours, minutes); // Month is 0-indexed in JS
        const localISOString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString(); // Adjust for local timezone
        return localISOString.replace(/[-:.]/g, "").slice(0, 15);  // Format to YYYYMMDDTHHMMSS

    }

    const startDate = formatDate(year, month, day, startTime);
    const endDate = formatDate(year, month, day, endTime);

    return {startDate, endDate};
}

function adjustFont(fonts) {
    for (const font of fonts) {
        font.size = (+font.size + 1).toString();
    }
}

function adjustMainTable(mainTable) {
    const rows = Array.from(mainTable.rows);
    mainTable.appendChild(rows[1]);
    mainTable.appendChild(rows[2]);
    mainTable.appendChild(rows[0])
    mainTable.style.width = "100%";
    mainTable.style.fontFamily = "sans-serif";
}

function adjustTopFrame(frameSet) {
    if (!frameSet) {
        console.error("Frameset not found!");
        return;
    }
    // Hide the frame
    frameSet.setAttribute('rows', '0%,100%');
}

function setImgSize(img) {
    const imgSize = "12px";
    img.style.width = imgSize;
    img.style.height = imgSize;
}

function changeIcons(mainTable) {
    mainTable.querySelectorAll("img").forEach((img) => {
        const attribute = img.getAttribute("alt");
        if (attribute === 'בחינת גמר שלי') {
            img.setAttribute("src", chrome.runtime.getURL("icons/examDay.png"));
            setImgSize(img);
        } else if (attribute === "מפגש בהנחיה מקוונת" || attribute === "מפגש") {
            img.setAttribute("src", chrome.runtime.getURL("icons/course.png"));
            setImgSize(img);
        } else if (attribute === "ממן") {
            img.setAttribute("src", chrome.runtime.getURL("icons/mmn.png"));
            setImgSize(img);
        } else if (attribute === "ממח") {
            img.setAttribute("src", chrome.runtime.getURL("icons/mmn.png"));
            img.style.filter = "hue-rotate(90deg)";
            setImgSize(img);
        } else if (attribute === "חגים ומועדים") {
            img.setAttribute("src", chrome.runtime.getURL("icons/holidays.png"));
            setImgSize(img);
        } else if (attribute === 'הנחיה טלפונית') {
            img.setAttribute("src", chrome.runtime.getURL("icons/telephone.png"));
            setImgSize(img);
        } else if (attribute === "היום") {
            img.setAttribute("src", chrome.runtime.getURL("icons/today.png"));
            img.style.width = "30px";
            img.style.height = "30px";
        }
    })
}

function adjustCells(rows, navTable) {
    for (let i = 0; i < rows.length; i++) {
        rows[i].classList.add("calendar-row");
        for (let j = 0; j < rows[i].cells.length; j++) {

            const br = rows[i].cells[j].querySelector("br")
            if (br) br.remove();

            rows[i].cells[j].querySelectorAll("a[href] font").forEach(font => {
                if (font.textContent.length > 2) {
                    font.size = (+font.size + 2).toString(); // Change only the second <font> element
                }
            });

            if (i !== 0) {
                rows[i].cells[j].querySelectorAll("img").forEach(img => {
                        const attribute = img.getAttribute("alt")
                        if (attribute === 'בחינת גמר שלי') {
                            rows[i].cells[j].classList.add("exam-cell");
                            changeTitle(img, attribute);
                        } else if (attribute === "מפגש בהנחיה מקוונת" || attribute === "מפגש") {
                            rows[i].cells[j].classList.add("course-cell");
                            changeTitle(img, attribute);
                        } else if (attribute === "ממן") {
                            rows[i].cells[j].classList.add("mmn-cell");
                            changeTitle(img, attribute);
                        } else if (attribute === "ממח") {
                            rows[i].cells[j].classList.add("mmh-cell");
                            changeTitle(img, "ממן");
                        } else if (attribute === "חגים ומועדים") {
                            rows[i].cells[j].classList.add("holiday-cell");
                            changeTitle(img, attribute);
                        }
                    }
                )
                ;
                rows[i].cells[j].classList.add("calendar-cell");

                //set up toggle button group, and selected button
                rows[i].cells[j].addEventListener("click", function () {
                    if (this.parentElement.parentElement.getElementsByClassName('selected')[0])
                        this.parentElement.parentElement.getElementsByClassName('selected')[0].classList.remove('selected');
                    this.classList.add('selected');
                    if (this.querySelector("a[name]"))
                        viewedDay = this.querySelector("a[name]").name;
                    selectedButton = this;

                });

            } else {
                rows[i].cells[j].classList.add("calendar-cell-header");
            }
        }
    }

    rows[0].classList.remove("calendar-row");
    rows[0].classList.add("calendar-header");
}

function changeTitle(img, attribute) {
    const div = img.nextElementSibling;
    if (!div) return;
    const aTag = div.nextElementSibling;
    if (!aTag) return;
    const font = aTag.firstChild;
    if (font) {
        if (attribute === "חגים ומועדים") {
            font.innerHTML = div.innerHTML;
        } else if (attribute === "בחינת גמר שלי") {
            const match = div.innerHTML.match(/קורס (.+?) \(\d+\)/);
            if (match) {
                font.innerHTML = "מבחן ב" + match[1].split(" ").slice(0, 3).join(" "); // Extracted course name
            }
        } else if (attribute === "ממן") {
            const match = div.innerHTML.match(/קורס (.+?) \(\d+\)/);
            if (match) {
                font.innerHTML = "ממן " + match[1].split(" ").slice(0, 3).join(" "); // Extracted course name
            }
        } else {
            const match = div.innerHTML.match(/\d{2}:\d{2} - \d{2}:\d{2} (.+?) \(\d+\)/);
            if (match) {
                font.innerHTML = match[1]; // Extracted course name
            }
        }

    }

}

function removeFirstColumns(rows) {
    for (let i = 0; i < rows.length; i++) {
        rows[i].removeChild(rows[i].cells[0]);
        rows[i].removeChild(rows[i].cells[0]);
    }
}
