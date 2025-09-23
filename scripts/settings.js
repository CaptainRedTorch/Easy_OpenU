const studentIDField = document.getElementById('studentID');
const courseInfoField = document.getElementById('courseInfo');
const materialsField = document.getElementById('materialsLink');
const calendarSwitch = document.getElementById('calendarSwitch');

document.addEventListener('DOMContentLoaded', async () => {

    // Check if there's a student ID saved in chrome.storage.local
    const { studentID } = await chrome.storage.local.get('studentID');
    if (studentID) {
        studentIDField.value = studentID;  // Set the input field's value if it exists
    }

    // Check if there's a course link saved in chrome.storage.local
    const { courseInfoLink } = await chrome.storage.local.get('courseInfoLink');
    if (courseInfoLink) {
        courseInfoField.value = courseInfoLink;  // Set the input field's value if it exists
    }

    // Check if there's a materials link saved in chrome.storage.local
    const { materialsLink } = await chrome.storage.local.get('materialsLink');
    if (materialsLink) {
        materialsField.value = materialsLink;  // Set the input field's value if it exists
    }

    // Check if there's a calendar settings preference saved in chrome.storage.local
    const switchChecked = await chrome.storage.local.get("calendarSwitch");
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
        chrome.storage.local.set({ studentID: id });
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
    chrome.storage.local.set({ courseInfoLink: link });
}
// Event listeners for materials link field, to save on 'Enter' key press or when the field loses focus
materialsField.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        await saveMaterialsInfo();
    }
});

materialsField.addEventListener('blur', async () => {
    await saveMaterialsInfo();
});

async function saveMaterialsInfo() {
    const link = materialsField.value.trim();
    chrome.storage.local.set({ materialsLink: link });
}


document.getElementById("deleteButton").addEventListener('click', (e) => {
    studentIDField.value = '';
    const answer = confirm("Are you sure you want to delete all saved information?");
    if (answer) {
        chrome.storage.local.clear();
        alert("Memory was deleted.");
    } else {
        alert("Memory was not deleted.");
    }
});

calendarSwitch.addEventListener('click', (e) => {
    chrome.storage.local.set({ calendarSwitch: e.target.checked });
});

