// زبان پیش‌فرض انگلیسی
let currentLanguage = "en";

// ترجمه‌ها برای دو زبان
const translations = {
  en: {
    title: "🎵 Music Finder",
    placeholder: "Ask about songs, artists, or genres...",
    searchButton: "Search",
    historyButton: "History",
    noResults: "No results found.",
    results: "Results:",
    songInfo: "Song Info",
  },
  // data
  it: {
    title: "🎵 Trova Musica",
    placeholder: "Chiedi di canzoni, artisti o generi...",
    searchButton: "Cerca",
    historyButton: "Cronologia",
    noResults: "Nessun risultato trovato.",
    results: "Risultati:",
    songInfo: "Informazioni sulla canzone",
  },
};
// وتی روی کارت یه آهنک کلیک میکنی، یه مودال باز میشه که جزئیات آهنک رو نمایش میده (مثل
// نام، سبک، محبوبیت، و تحلیل احساسی
function showSongInfo(song) {
  const modal = document.createElement("div");
  modal.classList.add("modal");

  const modalContent = document.createElement("div");
  modalContent.classList.add("modal-content");

  const closeButton = document.createElement("span");
  closeButton.classList.add("close-btn");
  closeButton.innerHTML = "&times;";
  closeButton.setAttribute("aria-label", "Close Modal");
  closeButton.addEventListener("click", () => {
    modal.remove();
  });

  modalContent.innerHTML = `
    <div class="modal-header">
      <h2>${song.name?.[currentLanguage] ||
    song.name?.english ||
    "<span class='unknown'>Unknown Title</span>"
    }</h2>
      <p><strong>Artist:</strong> ${song.artist || "<span class='unknown'>Unknown Artist</span>"
    }</p>
      <p><strong>Country:</strong> ${song.country || "<span class='unknown'>Unknown Country</span>"
    }</p>
    </div>
    <div class="modal-body">
      <div class="song-details">
        <p><strong>Match Percentage:</strong> ${song.matchPercentage
      ? `${Math.round(song.matchPercentage)}%`
      : "<span class='unknown'>N/A</span>"
    }</p>
        <p><strong>Style:</strong> ${song.style || "<span class='unknown'>Unknown Style</span>"
    }</p>
        <p><strong>Rating:</strong> ${song.rating || "<span class='unknown'>No Rating</span>"
    } / 10</p>
        <p><strong>Release Year:</strong> ${song.release_year || "<span class='unknown'>Unknown Year</span>"
    }</p>
        <p><strong>Duration:</strong> ${song.duration
      ? `${song.duration} seconds`
      : "<span class='unknown'>Unknown Duration</span>"
    }</p>
        <p><strong>Popularity:</strong> ${song.popularity
      ? `${song.popularity}%`
      : "<span class='unknown'>Unknown Popularity</span>"
    }</p>
        <p><strong>Language:</strong> ${song.language || "<span class='unknown'>Unknown Language</span>"
    }</p>
        <p><strong>Tags:</strong> ${song.tags?.length
      ? song.tags.join(", ")
      : "<span class='unknown'>No Tags</span>"
    }</p>
        <p><strong>Recommendations:</strong> ${song.recommendation?.length
      ? song.recommendation.join(", ")
      : "<span class='unknown'>No Recommendations</span>"
    }</p>
      </div>
      <hr />
      <h3>Audio Features</h3>
      <canvas id="audioFeaturesChart"></canvas>
      <p class="chart-description">
        This chart highlights key audio features such as tempo, energy, danceability, acousticness, and vocal power.
      </p>
      <hr />
      <h3>Emotional Analysis</h3>
      <canvas id="emotionalChart"></canvas>
      <p class="chart-description">
        The radar chart provides insights into the song's emotional aspects, including calmness, energy, romance, and more.
      </p>
    </div>
  `;

  modalContent.prepend(closeButton);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // اضافه کردن استایل ثابت برای هدر مودال
  const modalHeader = modalContent.querySelector(".modal-header");
  modalHeader.style.position = "sticky";
  modalHeader.style.top = "0";
  modalHeader.style.backgroundColor = "white";
  modalHeader.style.zIndex = "20";
  modalHeader.style.borderBottom = "1px solid #ddd";
  modalHeader.style.padding = "15px";

  // اضافه کردن رویداد برای بستن مودال
  modal.addEventListener("click", (event) => {
    if (
      event.target === modal ||
      event.target.classList.contains("close-btn")
    ) {
      modal.remove();
    }
  });

  // جلوگیری از بسته شدن هنگام کلیک روی محتوا
  modalContent.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  // رسم نمودار ویژگی‌های صوتی
  const audioFeaturesCanvas = document.getElementById("audioFeaturesChart");
  if (audioFeaturesCanvas) {
    const audioCtx = audioFeaturesCanvas.getContext("2d");
    new Chart(audioCtx, {
      type: "bar",
      data: {
        labels: [
          "Tempo",
          "Danceability",
          "Energy",
          "Acousticness",
          "Vocal Power",
        ],
        datasets: [
          {
            label: "Audio Features",
            data: [
              song.audio_features?.tempo || 0,
              (song.audio_features?.danceability || 0) * 100,
              (song.audio_features?.energy || 0) * 100,
              (song.audio_features?.acousticness || 0) * 100,
              (song.audio_features?.vocal_power || 0) * 100,
            ],
            backgroundColor: [
              "rgba(255, 99, 132, 0.6)",
              "rgba(54, 162, 235, 0.6)",
              "rgba(255, 206, 86, 0.6)",
              "rgba(75, 192, 192, 0.6)",
              "rgba(153, 102, 255, 0.6)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
            ],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: "top" },
          tooltip: { enabled: true },
        },
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
  }

  // رسم نمودار تحلیل احساسی
  const emotionalChartCanvas = document.getElementById("emotionalChart");
  if (emotionalChartCanvas) {
    const emotionalCtx = emotionalChartCanvas.getContext("2d");
    new Chart(emotionalCtx, {
      type: "radar",
      data: {
        labels: [
          "Calm",
          "Energetic",
          "Romantic",
          "Happy",
          "Sad",
          "Uplifting",
          "Party",
          "Danceable",
        ],
        datasets: [
          {
            label: "Emotional Analysis",
            data: [
              song.emotional_analysis?.calm || 0,
              song.emotional_analysis?.energetic || 0,
              song.emotional_analysis?.romantic || 0,
              song.emotional_analysis?.happy || 0,
              song.emotional_analysis?.sad || 0,
              song.emotional_analysis?.uplifting || 0,
              song.emotional_analysis?.party || 0,
              song.emotional_analysis?.danceable || 0,
            ],
            backgroundColor: "rgba(75, 192, 192, 0.3)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: "top" },
          tooltip: { enabled: true },
        },
        scales: {
          r: {
            angleLines: { display: false },
            suggestedMin: 0,
            suggestedMax: 100,
          },
        },
      },
    });
  }
}

// اتصال دکمه‌های مرتبط به این تابع
document.getElementById("searchButton").addEventListener("click", searchMusic);
document.getElementById("historyButton").addEventListener("click", showHistory);

// جستجوهای جدید به همراه نتایج در تاریخچه ذخیره میشن
function saveToHistory(query, results) {
  const history = JSON.parse(localStorage.getItem("searchHistory")) || [];
  history.push({ query, results });
  localStorage.setItem("searchHistory", JSON.stringify(history));
}

// :اطلاعات هنرمندها از یه سرور گرفته میشه و در لیستی داخل مودال نمایش داده میشه
function showHistory() {
  const responseBox = document.getElementById("chatGPTResponse");
  const history = JSON.parse(localStorage.getItem("searchHistory")) || [];

  if (history.length === 0) {
    responseBox.innerHTML = `<div class="text-danger">No search history found.</div>`;
    return;
  }

  // نمایش عبارت‌های جستجو به همراه دکمه "نمایش"
  responseBox.innerHTML = `<h3>Search History:</h3>`;
  history.forEach((entry, index) => {
    responseBox.innerHTML += `
      <div class="history-item">
        <span>${entry.query}</span>
        <button class="btn btn-secondary show-songs-button" data-index="${index}">Show Songs</button>
      </div>`;
  });

  // اتصال رویداد دکمه‌های "نمایش"
  document.querySelectorAll(".show-songs-button").forEach((button) => {
    button.addEventListener("click", (e) => {
      const index = e.target.getAttribute("data-index");
      showSongsFromHistory(index);
    });
  });
}
async function showSongsFromHistory(index) {
  const history = JSON.parse(localStorage.getItem("searchHistory")) || [];
  const selectedEntry = history[index];

  const responseBox = document.getElementById("chatGPTResponse");
  responseBox.innerHTML = `<h3>Results for: "${selectedEntry.query}"</h3>`;

  // نمایش کارت‌های آهنگ‌ها
  const songCards = await Promise.all(
    selectedEntry.results.map(async (song, songIndex) => {
      return await createSongCard(song, songIndex);
    })
  );

  // اضافه کردن کارت‌های آهنگ به صفحه
  responseBox.innerHTML += songCards.join(""); // join برای ترکیب کارت‌ها به صورت یک رشته

  // اتصال رویدادها بعد از اضافه شدن دکمه‌ها به DOM
  attachEventListeners(selectedEntry.results);
}
// Iبرای ارسال درخواست به سرور و دریافت دادههای آهنگ و هنرمندان استفاده میشه
async function fetchArtistInfo(artistName) {
  try {
    const response = await fetch("http://localhost:3000/artists");
    const artists = await response.json();

    // جستجوی هنرمند در لیست
    const artist = artists.find(
      (a) => a.name.toLowerCase() === artistName.toLowerCase()
    );

    return artist ? artist : null; // اگر هنرمند پیدا شد، اطلاعاتش رو بر می‌گردونه
  } catch (error) {
    console.error("Error fetching artist data:", error);
    return null;
  }
}
// :اطلاعات هر آهنگ به فرمت  HTMLتبدیل میشه و به صفحه اضافه میشه.
async function createSongCard(song, index) {
  const songName =
    song.name?.[currentLanguage] || song.name?.english || "Unknown Title";
  const artist = song.artistDetails?.name || song.artist || "Unknown Artist";
  const style =
    typeof song.style === "object"
      ? song.style[currentLanguage] || song.style.english || "Unknown Style"
      : song.style || "Unknown Style";
  const language =
    typeof song.language === "object"
      ? song.language[currentLanguage] ||
      song.language.english ||
      "Unknown Language"
      : song.language || "Unknown Language";
  const releaseYear = song.release_year || "Unknown Year";

  // جستجو برای اطلاعات هنرمند از فایل artists.json
  const artistInfo = await fetchArtistInfo(artist); // استفاده از await برای منتظر ماندن تا پاسخ کامل بیاید
  const matchPercentage = song.matchScore
    ? `${Math.round(song.matchScore)}%`
    : "N/A";
  let artistInfoHTML = "";
  if (artistInfo) {
    artistInfoHTML = `
      <p><strong>Artist Info:</strong></p>
      <ul>
        <li><strong>Name:</strong> ${artistInfo.name}</li>
        <li><strong>Birth Year:</strong> ${artistInfo.birthYear || "Unknown"
      }</li>
        <li><strong>Country:</strong> ${artistInfo.country || "Unknown"}</li>
        <li><a href="${artistInfo.spotifyLink || "#"
      }" target="_blank">Spotify Link</a></li>
      </ul>
    `;
  } else {
    artistInfoHTML = `<p><em></em></p>`;
  }

  // ساخت کارت آهنگ
  return `
    <div class="song-card">
      <div class="song-header">
        <h3>${songName}</h3>
        <p><strong>Artist:</strong> ${artist}</p>
        <p><strong>Match Percentage:</strong> ${matchPercentage}</p>
      </div>
      <div class="song-body">
        <p><strong>Style:</strong> ${style}</p>
        <p><strong>Language:</strong> ${language}</p>
        <p><strong>Release Year:</strong> ${releaseYear}</p>
        <p><strong>Popularity:</strong> 
          <span class="popularity-bar" style="width: ${song.popularity || 0
    }%"></span>
          ${song.popularity || "N/A"}%
        </p>
        ${artistInfoHTML} 
      </div>
      <div class="song-footer">
        <button class="btn btn-primary spotify-button" data-index="${index}">🎧 Listen on Spotify</button>
        <button class="btn btn-info song-info-button" data-index="${index}">${translations[currentLanguage].songInfo
    }</button>
      </div>
    </div>
  `;
}
// این تابع وقتی دکمه جستجو کلیک میشه اجرا میشه، سوال کاربر رو میکیره، به سرور میفرسته و نتایج
// رو به صورت کارت برمیکردونه
async function searchMusic() {
  const question = document.getElementById("questionInput").value.trim();
  const responseBox = document.getElementById("chatGPTResponse");
  responseBox.innerHTML = "<div>Processing...</div>";

  if (!question) {
    responseBox.innerHTML = `<div class="text-danger">${translations[currentLanguage].noResults}</div>`;
    return;
  }

  try {
    const response = await fetch("http://127.0.0.1:3000/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, language: currentLanguage }),
    });

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      responseBox.innerHTML = `<strong>${translations[currentLanguage].results}</strong>`;

      // استفاده از await برای جلوگیری از نمایش [object Promise]
      const songCards = await Promise.all(
        data.results.map((song, index) => createSongCard(song, index))
      );

      // اضافه کردن کارت‌های آهنگ به صفحه
      responseBox.innerHTML += songCards.join(""); // join برای تبدیل آرایه به رشته

      // اتصال رویدادها بعد از اضافه شدن دکمه‌ها به DOM
      attachEventListeners(data.results);

      // ذخیره در تاریخچه
      saveToHistory(question, data.results);
    } else {
      responseBox.innerHTML = `<strong>${translations[currentLanguage].noResults}</strong>`;
    }
  } catch (error) {
    console.error("Error:", error);
    responseBox.innerHTML = `<div class="text-danger">${error.message}</div>`;
  }
}

function attachEventListeners(results) {
  // اتصال دکمه "مشاهده آهنک در اسپاتیفای"
  document.querySelectorAll(".spotify-button").forEach((button) => {
    button.addEventListener("click", (e) => {
      const index = e.target.getAttribute("data-index");
      const song = results[index];
      window.open(song.url, "_blank");
    });
  });

  // اتصال دکمه "مشاهده اطلاعات آهنگ"
  document.querySelectorAll(".song-info-button").forEach((button) => {
    button.addEventListener("click", (e) => {
      const index = e.target.getAttribute("data-index");
      const song = results[index];
      showSongInfo(song);
    });
  });
}
