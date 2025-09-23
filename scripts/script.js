//URL List
const assignmentSiteURL = "https://sheilta.apps.openu.ac.il/pls/mtl/student.login";
const sheiltaURL = "https://sheilta.apps.openu.ac.il/pls/dmyopt2/myop.myop_screen";
const calendarURL = "https://sheilta.apps.openu.ac.il/pls/dmyopt2/LUACH_SHANA.first?user_type=1";
const defaultMegaURL = "https://mega.nz/folder/bZgRnQbJ#fBIkzvx7nLDUFMqGad6jOw/folder/WZgwwIaY";
const defaultCourseInfoURL = "https://academic.openu.ac.il/cs/computer/program/AF.aspx";

document.getElementById("getGrades").addEventListener('click', (e) => {
    window.location.href = chrome.runtime.getURL('/html/grades.html');
});

document.getElementById("getAssignment").addEventListener('click', (e) => {
    chrome.tabs.create({ url: assignmentSiteURL });
})

document.getElementById("getCourses").addEventListener('click', (e) => {
    window.location.href = chrome.runtime.getURL('/html/courses.html');
});

document.getElementById("getSheilta").addEventListener('click', (e) => {
    chrome.tabs.create({ url: sheiltaURL });
});

document.getElementById("getCalendar").addEventListener('click', (e) => {
    chrome.tabs.create({ url: calendarURL });
});

// Open Materials Link or default Mega link if not set in settings
document.getElementById("getMega").addEventListener('click', (e) => {
    chrome.storage.local.get("materialsLink", materialsURL => {
        if (materialsURL.materialsLink && materialsURL.materialsLink.length > 10) {
            chrome.tabs.create({ url: materialsURL.materialsLink });
        } else
            chrome.tabs.create({ url: defaultMegaURL });
    });
});

// Open Course Info Link or default Course Info link if not set in settings
document.getElementById("getCourse").addEventListener('click', (e) => {
    chrome.storage.local.get("courseInfoLink", courseInfoURL => {
        if (courseInfoURL.courseInfoLink && courseInfoURL.courseInfoLink.length > 10) {
            chrome.tabs.create({ url: courseInfoURL.courseInfoLink });
        } else
            chrome.tabs.create({ url: defaultCourseInfoURL });

    });
});

document.getElementById("getCoursePlan").addEventListener('click', (e) => {
    window.location.href = chrome.runtime.getURL('/html/coursePlan.html');
});

document.getElementById("calendarNotifications").addEventListener('click', (e) => {
    window.location.href = chrome.runtime.getURL('/html/reminderManager.html');
});






