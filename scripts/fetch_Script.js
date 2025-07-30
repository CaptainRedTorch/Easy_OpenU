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
            const arrayBuffer = await response.arrayBuffer(); // Read raw bytes
            const decoder = new TextDecoder("windows-1255"); // Decode using Hebrew encoding
            return decoder.decode(arrayBuffer);
        } else {
            throw new Error("Failed to fetch HTML: " + response.statusText);
        }
    } catch (err) {
        console.error("Error fetching HTML:", err);
        throw err; // Re-throw the error so it can be handled
    }
}



