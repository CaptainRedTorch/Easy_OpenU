const studentIDField = document.getElementById('studentID');
const courseInfoField = document.getElementById('courseInfo');
const calendarSwitch = document.getElementById('calendarSwitch');

const storage = chrome?.storage?.local || browser?.storage?.local;

document.addEventListener('DOMContentLoaded', async () => {

    // Check if there's a student ID saved in chrome.storage.local
    const {studentID} = await storage.local.get('studentID');
    if (studentID) {
        studentIDField.value = studentID;  // Set the input field's value if it exists
    }

    // Check if there's a course link saved in chrome.storage.local
    const {courseInfoLink} = await storage.local.get('courseInfoLink');
    if (courseInfoLink) {
        courseInfoField.value = courseInfoLink;  // Set the input field's value if it exists
    }

    // Check if there's a calendar settings preference saved in chrome.storage.local
    const switchChecked = await storage.local.get("calendarSwitch");
    if (switchChecked.calendarSwitch) {
        calendarSwitch.click();
    }

});

studentIDField.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        await saveIDinfo();
    }
});

studentIDField.addEventListener('blur', async () => {
    await saveIDinfo();
});

async function saveIDinfo() {
    const id = studentIDField.value.trim();
    if (id) {
        storage.local.set({ studentID: id });
    }
}

courseInfoField.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        await saveCourseInfo();
    }
});

courseInfoField.addEventListener('blur', async () => {
    await saveCourseInfo();
});

async function saveCourseInfo() {
    const link = courseInfoField.value.trim();
    //if (link) {
        storage.local.set({ courseInfoLink: link });
    //}
}

document.getElementById("deleteButton").addEventListener('click', (e) => {
    studentIDField.value = '';
    const answer = confirm("Are you sure you want to delete all saved information?");
    if (answer) {
        storage.local.clear();
        alert("Memory was deleted.");
    } else {
        alert("Memory was not deleted.");
    }
});

calendarSwitch.addEventListener('click', (e) => {
    storage.local.set({calendarSwitch: e.target.checked});
});

