document.addEventListener("DOMContentLoaded", async () => {
    const {hasLoaded} = await chrome.storage.local.get("hasLoaded");
    if (!hasLoaded) {
        fetchCourses();
        await waitForLoaded();
    }
    await load();

});

document.getElementById("refresh").addEventListener('click', (e) => {
    chrome.storage.local.set({hasLoaded: false});
    window.location.reload();
});

async function fetchHTML(url) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',  // Include cookies for authentication
        });
        if (response.redirected) {
            const redirectedUrl = response.url;  // Get the URL where it's redirected
            console.log("Redirected to:", redirectedUrl);
            window.open(redirectedUrl, '_blank');

        }
        if (response.ok) {
            const html = await response.text();
            return html;  // Return the fetched HTML
        } else {
            throw new Error("Failed to fetch HTML: " + response.statusText);
        }
    } catch (err) {
        console.error("Error fetching HTML:", err);
        throw err; // Re-throw the error so it can be handled in fetchCourses
    }
}

async function fetchCourses() {
    try {
        const html = await fetchHTML("https://opal.openu.ac.il/my/");
        if (html) {
            const parser = new DOMParser();
            const doc = await parser.parseFromString(html, "text/html");
            const courses = [];



            const courseLinks = doc.querySelectorAll('li.position-relative.mycourselink.opal:not(.submenu .mycourselink)');
            console.log(courseLinks);
            courseLinks.forEach(element => {
                const courseName = element.querySelector(".text-wrapper span")?.textContent.trim().replace(/\s*\(.*?\)\s*/g, "");
                const courseUrl = element.querySelector("a")?.getAttribute('href');

                if (courseName && courseUrl) {
                    courses.push({name: courseName, courseUrl: courseUrl, booklet: null, book: null});
                }
            });
            chrome.storage.local.set({courses: courses, hasLoaded: false}, () => {
                console.log("loged:", courses);
            });
            console.log("Stored:" + courses.length);
            return fetchCourseData(courses);
        }
    } catch (error) {
        console.error("Error fetching courses:", error);
    }
}

async function fetchCourseData(courses) {

    const updatedCourses = await Promise.all(
        courses.map(async (course) => {
            try {
                const html = await fetchHTML(course.courseUrl);

                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                const booklet = await fetchBooklet(doc);
                const book = await fetchBooks(doc);

                // Return updated course with the booklets and books
                return {...course, booklet, book};

            } catch (error) {
                console.error("Error fetching data for:", course.name, error);
                // Return course with an empty booklets array if there's an error
                return {...course, booklet: null, book: null};
            }
        })
    );

    // Save the updated courses data to chrome.storage.local
    chrome.storage.local.set({courses: updatedCourses}, () => {
        chrome.storage.local.set({hasLoaded: true});
        console.log("Courses data updated with data.");
    });

}

async function fetchBooklet(doc) {
    // Extract the booklet URLs
    const bookletLinks = doc.querySelector('a[href*="booklet.viewbook"]');
    const bookletUrl = bookletLinks ? bookletLinks.getAttribute('href') : null;
    return bookletUrl;
}

async function fetchBooks(doc) {
    const ebookPageElement = doc.querySelector('.quicklink a[href*="ouil_ebook"]');
    const ebooksUrl = ebookPageElement ? ebookPageElement.getAttribute('href') : null;
    return ebooksUrl;
}

async function load() {
    const container = document.getElementById("vbox");
    const {courses} = await chrome.storage.local.get("courses");
    if (!courses) return;
    console.log("loaded " + courses.length + " courses books");
    courses.forEach((course) => {

        const hContainer = document.createElement("div");
        hContainer.style.display = "flex";
        hContainer.style.flexDirection = "row";

        container.appendChild(hContainer);
        //Book
        if (course.book) {
            const courseBook = document.createElement("button");
            courseBook.innerHTML = '<i class="fa fa-book" aria-hidden="true"></i>';
            courseBook.classList.add("button-fixed");
            courseBook.addEventListener("click", () => chrome.tabs.create({url: course.book}));
            hContainer.appendChild(courseBook);
        }
        //Booklet
        if (course.booklet) {
            const courseBooklet = document.createElement("button");
            courseBooklet.innerHTML = '<i class="fa fa-file-text-o" aria-hidden="true"></i>';
            courseBooklet.classList.add("button-fixed");
            courseBooklet.addEventListener("click", () => chrome.tabs.create({url: course.booklet}));
            hContainer.appendChild(courseBooklet);
        }
        //Course name
        if (course.name) {
            const courseUrl = document.createElement("button");
            courseUrl.textContent = course.name.slice(0, 25);

            courseUrl.classList.add("button-expand");
            courseUrl.addEventListener("click", () => chrome.tabs.create({url: course.courseUrl}));
            hContainer.appendChild(courseUrl);
        }

    });
}

// Function to wait for `hasLoaded` to be true
async function waitForLoaded() {
    const container = document.getElementById("container");
    const loaderWrapper = document.createElement("div");
    loaderWrapper.classList.add("loader-wrapper");
    container.appendChild(loaderWrapper);
    const loader = document.createElement("div");
    loader.classList.add("loader");
    loaderWrapper.appendChild(loader);

    return new Promise((resolve) => {
        const checkLoaded = setInterval(async () => {
            const {hasLoaded} = await chrome.storage.local.get("hasLoaded");
            if (hasLoaded) {
                clearInterval(checkLoaded);
                loaderWrapper.remove();
                resolve();
            }
        }, 50); // Check every 50ms
    });
}

