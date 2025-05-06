const div = document.getElementById("vbox");

document.addEventListener("DOMContentLoaded", async () => {
    getReminders();

});

function createReminderButton(reminder){
    const hContainer = document.createElement("div");
    hContainer.style.display = "flex";
    hContainer.style.flexDirection = "row";
    console.log(reminder);

    const reminderTime = document.createElement("button");
    reminderTime.textContent = formatReminderTime(reminder.time);
    reminderTime.classList.add("button-expand");
    hContainer.appendChild(reminderTime);

    const reminderName = document.createElement("button");
    reminderName.textContent = reminder.title;
    reminderName.classList.add("button-expand");
    hContainer.appendChild(reminderName);

    const deleteButton = document.createElement("button");
    deleteButton.textContent = 'X';
    deleteButton.classList.add("button-fixed");
    hContainer.appendChild(deleteButton);
    deleteButton.addEventListener("click", (e) => {
        const res = confirm("Delete Reminder?");
        if (res) {
            deleteReminder(reminder.id);
            hContainer.remove();
        }

    });

    return hContainer;
}

function deleteReminder(reminderID){
    chrome.runtime.sendMessage({action:"deleteReminder", reminderID:reminderID});
}

function getReminders() {
    chrome.storage.local.get(null, (items) => {
        if (chrome.runtime.lastError) {
            console.error("Error getting storage:", chrome.runtime.lastError);
            return;
        }

        // Filter for keys that start with "reminder-"
        const reminders = Object.entries(items)
            .filter(([key, _]) => key.startsWith('reminder-'))
            .map(([key, value]) => ({ id: key, ...value }));

        reminders.forEach(reminder => {
            div.appendChild(createReminderButton(reminder));
        });
    });
}

function formatReminderTime(isoString) {
    const date = new Date(isoString);

    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are 0-based
    const year = date.getFullYear().toString().slice(-2); // Get last 2 digits
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}.${month}.${year} - ${hours}:${minutes}`;
}
