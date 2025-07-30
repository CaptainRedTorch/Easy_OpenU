const back = document.getElementById("back");
const settings = document.getElementById("settings");
const info = document.getElementById("info");

if(back){
    back.addEventListener("click", () => {
        window.location.href = chrome.runtime.getURL('/html/page.html');
    })
}

if(settings){
    settings.addEventListener("click", () => {
        window.location.href = chrome.runtime.getURL('/html/settings.html');
    })
}

if(info){
    info.addEventListener("click", () => {
        window.location.href = chrome.runtime.getURL('/html/info.html');
    })
}
