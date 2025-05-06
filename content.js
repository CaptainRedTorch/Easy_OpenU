//wait for load page
window.addEventListener('load', () => {
    console.log("Script running in:", window.location.origin);
    if (window.location.origin === "https://sso.apps.openu.ac.il") {
        console.log("Detected login page!");

        const studentIdField = document.querySelector("#p_mis_student");
        if (studentIdField) {
            console.log("Student ID field found, autofilling...");

            chrome.storage.local.get("studentID", (result) => {
                if (result.studentID) {
                    studentIdField.value = result.studentID;
                    console.log("Autofilled Student ID:", result.studentID);
                } else {
                    console.warn("No student ID found in storage");
                }
            });
        } else {
            console.warn("Student ID field not found on this page.");
        }
    }
});


