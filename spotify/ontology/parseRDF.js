const fs = require("fs");
const { Parser } = require("n3");

// مسیر فایل‌های RDF
const paths = {
  song: "index-main/spotify/dataset/rdf/song.ttl",
  artist: "index-main/spotify/dataset/rdf/artist.ttl",
};

// مسیر خروجی JSON
const outputJsonPath =
  "songs_with_artists.json";

// پیشوندها
const prefixes = {
  spotify: "http://www.dei.unipd.it/GraphDatabases/SpotifyOntology#",
  foaf: "http://xmlns.com/foaf/0.1/",
  xsd: "http://www.w3.org/2001/XMLSchema#",
};

// ذخیره داده‌ها
const data = {
  songs: {},
  artists: {},
};

// پردازش کامل فایل RDF
const parseRDFFile = async (filePath, processor) => {
  return new Promise((resolve, reject) => {
    const rdfData = fs.readFileSync(filePath, "utf8");
    const parser = new Parser({ prefixes });

    parser.parse(rdfData, (error, quad) => {
      if (error) {
        console.error(`[ERROR] Parsing ${filePath}:`, error);
        reject(error);
        return;
      }

      if (quad) {
        processor(quad);
      } else {
        resolve();
      }
    });
  });
};

// پردازشگرها برای فایل‌های RDF
const processors = {
  song: (quad) => {
    const { subject, predicate, object } = quad;
    const songId = subject.value;

    if (!data.songs[songId]) {
      data.songs[songId] = { id: songId };
    }

    if (predicate.value.includes("songName")) {
      data.songs[songId].name = object.value;
    }

    if (predicate.value.includes("songUrl")) {
      data.songs[songId].url = object.value;
    }

    if (predicate.value.includes("PerformedBy")) {
      data.songs[songId].artistId = object.value;
    }
  },

  artist: (quad) => {
    const { subject, predicate, object } = quad;
    const artistId = subject.value;

    if (!data.artists[artistId]) {
      data.artists[artistId] = {};
    }

    if (predicate.value.includes("name")) {
      data.artists[artistId].name = object.value;
    }
  },
};

// ترکیب داده‌ها و ذخیره در فایل
const buildFinalJson = () => {
  console.log("[INFO] Building final JSON...");

  const combinedSongs = Object.values(data.songs).map((song) => {
    const artist = data.artists[song.artistId] || { name: "Unknown Artist" };
    return {
      name: song.name || "Unknown",
      url: song.url || "Unknown",
      artist: artist.name,
    };
  });

  fs.writeFileSync(
    outputJsonPath,
    JSON.stringify(combinedSongs, null, 4),
    "utf8"
  );
  console.log(`[SUCCESS] JSON file created at: ${outputJsonPath}`);
};

// اجرای پردازش
const run = async () => {
  try {
    console.log("[INFO] Parsing files...");
    await parseRDFFile(paths.song, processors.song);
    await parseRDFFile(paths.artist, processors.artist);

    buildFinalJson();
  } catch (error) {
    console.error("[ERROR] An error occurred during processing:", error);
  }
};

run();
