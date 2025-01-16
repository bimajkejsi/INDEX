// عناصر DOM
const artistsButton = document.getElementById("artistsButton");
const artistsModal = document.getElementById("artistsModal");
const closeArtistsModal = document.getElementById("closeArtistsModal");
const closeArtistsFooter = document.getElementById("closeArtistsFooter");
const artistsList = document.getElementById("artistsList");
const artistSearchInput = document.getElementById("artistSearchInput");

// ذخیره لیست کامل هنرمندان برای جستجو
let allArtists = [];

// دریافت اطلاعات هنرمندان از سرور
const fetchArtists = async () => {
  try {
    const response = await fetch("http://127.0.0.1:3000/artists");
    if (!response.ok) throw new Error("خطا در دریافت اطلاعات هنرمندان.");
    return await response.json();
  } catch (error) {
    console.error("خطا:", error);
    return [];
  }
};

// تابع برای نمایش لیست هنرمندان
const displayArtists = (artists) => {
  // پاک کردن لیست قدیمی
  artistsList.innerHTML = "";

  // افزودن هنرمندان به لیست
  artists.forEach((artist) => {
    const listItem = document.createElement("li");
    listItem.className =
      "list-group-item d-flex justify-content-between align-items-center";
    listItem.innerHTML = `
      <div>
        <strong>${artist.name}</strong> - ${artist.country} (${artist.birthYear})
      </div>
      <a href="${artist.spotifyLink}" target="_blank" class="btn btn-sm btn-primary">Spotify</a>
    `;
    artistsList.appendChild(listItem);
  });
};

// فیلتر کردن لیست هنرمندان بر اساس جستجو
const filterArtists = (query) => {
  const normalizedQuery = query.trim().toLowerCase();
  return allArtists.filter((artist) => {
    const nameMatch = artist.name.toLowerCase().includes(normalizedQuery);
    const countryMatch = artist.country.toLowerCase().includes(normalizedQuery);
    return nameMatch || countryMatch;
  });
};

// مدیریت باز شدن مودال و دریافت داده‌ها
artistsButton.addEventListener("click", async () => {
  artistsList.innerHTML = ""; // پاک کردن لیست قدیمی
  artistSearchInput.value = ""; // پاک کردن فیلد جستجو

  // دریافت هنرمندان از سرور
  allArtists = await fetchArtists();
  displayArtists(allArtists); // نمایش لیست کامل

  // نمایش مودال
  artistsModal.style.display = "flex";
});

// جستجو در لیست هنگام تایپ
artistSearchInput.addEventListener("input", (e) => {
  const query = e.target.value;
  const filteredArtists = filterArtists(query);
  displayArtists(filteredArtists); // نمایش نتایج جستجو
});

// بستن مودال
[closeArtistsModal, closeArtistsFooter].forEach((btn) =>
  btn.addEventListener("click", () => {
    artistsModal.style.display = "none";
  })
);
