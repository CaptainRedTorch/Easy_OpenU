document.getElementById("getGrades").addEventListener('click', (e) => {
    window.location.href = chrome.runtime.getURL('grades.html');
});

document.getElementById("getAssignment").addEventListener('click', (e) => {
    chrome.tabs.create({url: "https://sheilta.apps.openu.ac.il/pls/mtl/student.login"});
})

document.getElementById("getCourses").addEventListener('click', (e) => {
    window.location.href = chrome.runtime.getURL('courses.html');
});

document.getElementById("getSheilta").addEventListener('click', (e) => {
    chrome.tabs.create({url: "https://sheilta.apps.openu.ac.il/pls/dmyopt2/myop.myop_screen"});
});

document.getElementById("getCalendar").addEventListener('click', (e) => {
    chrome.tabs.create({url: "https://sheilta.apps.openu.ac.il/pls/dmyopt2/LUACH_SHANA.first?user_type=1"});
});

document.getElementById("getMega").addEventListener('click', (e) => {
    chrome.tabs.create({url: "https://mega.nz/folder/Ibl2CSIY#em77k1KkiqhFsQKXZkHdGw"});
});

document.getElementById("getCourse").addEventListener('click', (e) => {
    chrome.storage.local.get("courseInfoLink", courseInfoURL => {
        if (courseInfoURL.courseInfoLink && courseInfoURL.courseInfoLink.length > 10) {
            chrome.tabs.create({url: courseInfoURL.courseInfoLink});
        } else
            chrome.tabs.create({url: "https://academic.openu.ac.il/cs/computer/program/AF.aspx"});

    });
});

document.getElementById("getCoursePlan").addEventListener('click', (e) => {
    window.location.href = chrome.runtime.getURL('coursePlan.html');
});

document.getElementById("calendarNotifications").addEventListener('click', (e) => {
    window.location.href = chrome.runtime.getURL('reminderManager.html');
});

document.addEventListener("DOMContentLoaded", async () => {

});






