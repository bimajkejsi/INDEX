async function searchMusic() {
    const question = document.getElementById("questionInput").value.trim();
    const responseBox = document.getElementById("chatGPTResponse");
    responseBox.textContent = "Processing...";

    if (!question) {
        alert("Please enter a question!");
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:3000/ask", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ question }),
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            responseBox.innerHTML = `<strong>Results:</strong><ul>`;
            data.results.forEach((song) => {
                responseBox.innerHTML += `
            <li>
              <strong>${song.name}</strong> by ${song.artist}
              (<a href="${song.url}" target="_blank" rel="noopener noreferrer">Listen</a>)
            </li>`;
            });
            responseBox.innerHTML += `</ul>`;
        } else {
            responseBox.innerHTML = `<strong>No results found for your question.</strong>`;
        }
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error:`, error);
        responseBox.innerHTML = `<span class="text-danger">Error: ${error.message}</span>`;
    }
}