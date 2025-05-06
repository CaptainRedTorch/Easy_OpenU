chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "setReminder"){
        const {reminderID, title, messageTxt, time} = message;
        console.log(time);
        chrome.storage.local.set({[reminderID]:{title: title, message: messageTxt, time: time}});

        chrome.storage.local.get(message.reminderID, (data)=>{
            const reminder = data[message.reminderID];
            if (!reminder) return;

            const alarmTime = new Date(reminder.time).getTime();
            if (alarmTime > Date.now()) {
                chrome.alarms.create(message.reminderID, { when: alarmTime });
            }
        });
    }
    else if (message.action === "clearReminders") {
        clearAllReminders();
    }
    else if (message.action === "deleteReminder") {
       deleteReminders(message.reminderID);
    }
});

function deleteReminders(reminderID) {
    chrome.alarms.clear(reminderID);

    chrome.storage.local.remove(reminderID, () => {
        if (chrome.runtime.lastError) {
            console.error('Error removing reminder keys:', chrome.runtime.lastError);
        }
    });
}

function clearAllReminders() {
    chrome.alarms.clearAll();
    // Retrieve all items from storage
    chrome.storage.local.get(null, (items) => {
        if (chrome.runtime.lastError) {
            console.error('Error retrieving storage items:', chrome.runtime.lastError);
            return;
        }

        // Filter keys that start with 'reminder-'
        const reminderKeys = Object.keys(items).filter(key => key.startsWith('reminder-'));

        if (reminderKeys.length > 0) {
            // Remove all reminder keys
            chrome.storage.local.remove(reminderKeys, () => {
                if (chrome.runtime.lastError) {
                    console.error('Error removing reminder keys:', chrome.runtime.lastError);
                }
            });
        }
    });
}

chrome.alarms.onAlarm.addListener(handleAlarm);

function handleAlarm(alarm){
    chrome.storage.local.get(alarm.name, (result)=>{
        const reminder = result[alarm.name];
        if (reminder) {
            notification(reminder.title, reminder.message);
            chrome.storage.local.remove(alarm.name);
        }
    });
}

function notification(title,message){
    chrome.notifications.create(
        {
            title:"תזכורת: "+title,
            message: message,
            iconUrl: "icons/calendar.png",
            type: "basic",
            requireInteraction: true
        }
    );
}

chrome.runtime.onConnect.addListener(function(port) {
    if (port.name === "popup") {
        port.onDisconnect.addListener(function() {
            console.log("popup has been closed")
        });
    }
});




