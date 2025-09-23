// Select all rows from the table
const rows = document.querySelectorAll("table.content_tbl tbody tr");

// Define the statuses we want to filter out
const blockedStatuses = [
	"מבוטל", // Cancelled
	"הוחלף", // Replaced
	"נדחה", // Postponed
	"הועבר", // transferred
];

let toggle = true

async function filterCourses(toggle) {
// Go through each row
	rows.forEach((row) => {
		const statusCell = row.cells[3]; // 4th column contains the status
		if (!statusCell) return; // Skip if no status cell

		const statusText = statusCell.textContent.trim();

		// Status is in blocked list → remove row
		if (blockedStatuses.some((status) => statusText.includes(status))) {
			if (toggle)
				row.style.display = "none";
			else
				row.style.display = "table-row";
			return;
		}
	});
}

// Insert toggle switch
const targetElement = document.querySelector("body > table > tbody > tr:nth-child(5) > td > table")
// toggleSwitch element
const htmlToggleSwitch = `
<div class="switch-container">
        <label class="switch">
            <input type="checkbox" id="courseFilterSwitch" checked="checked">
            <span class="slider round"></span>
        </label>
        <label style="font-weight: bold; font-size: 14px;">הסתר: החולף, נדחה, בוטל</label>
    </div>
`

if (targetElement)
{
	targetElement.insertAdjacentHTML("beforebegin", htmlToggleSwitch);
}

const toggleSwitch = document.getElementById("courseFilterSwitch");
toggleSwitch.addEventListener('click', (e) => {
	toggle = !toggle;
	filterCourses(toggle);
})


