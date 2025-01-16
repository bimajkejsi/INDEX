const fs = require("fs");

// مسیر فایل JSON
const filePath =
  "songs_with_artists.json";

function fixFields() {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    const songs = JSON.parse(data);

    // اصلاح فیلدهای artist و style
    songs.forEach((song) => {
      // بررسی و اصلاح artist
      if (typeof song.artist !== "string") {
        song.artist = song.artist?.english || "Unknown Artist";
      }

      // بررسی و اصلاح style
      if (typeof song.style !== "string") {
        song.style = song.style?.english || "Unknown Style";
      }
    });

    fs.writeFileSync(filePath, JSON.stringify(songs, null, 2), "utf8");
    console.log("فیلدهای هنرمند و سبک با موفقیت اصلاح شدند.");
  } catch (error) {
    console.error("خطا در اصلاح فایل:", error);
  }
}

fixFields();
