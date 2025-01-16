const express = require("express");
const cors = require("cors");
const fs = require("fs");
const OpenAI = require("openai");
require("dotenv").config(); // Load environment variables

const app = express();
app.use(cors());
app.use(express.json());

const artistsJsonPath = "artists.json";
const songsJsonPath =
  "songs_with_artists.json";

// OpenAI configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Read song data
const readSongsData = async () => {
  try {
    const data = await fs.promises.readFile(songsJsonPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading song JSON file:", error);
    return [];
  }
};

// Read artist data
const readArtistsData = async () => {
  try {
    const data = await fs.promises.readFile(artistsJsonPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading artist JSON file:", error);
    return [];
  }
};

// API to get artists
app.get("/artists", async (req, res) => {
  try {
    const artists = await readArtistsData();
    res.json(artists);
  } catch (error) {
    console.error("Error sending artists:", error);
    res.status(500).json({ error: "Error processing the request." });
  }
});
const advancedSearch = (filters, songsData, language) => {
  const {
    keyword = "",
    mood = [],
    activity = [],
    style = "",
    popularity = 0,
    tags = [],
    region = [],
    language: filterLanguage = "",
  } = filters;

  const keywordLower = keyword.toLowerCase();

  const weights = {
    keywordMatch: 150,
    artistExactMatch: 400, // وزن بالاتر برای تطابق دقیق نام خواننده
    artistPartialMatch: 300, // وزن برای تطابق جزئی یا غلط املایی در نام خواننده
    emotionalMatch: 10,
    audioFeatureMatch: {
      acousticness: 50,
      tempo: 40,
      energy: 30,
      danceability: 30,
    },
    activityMatch: 80,
    styleMatch: 120,
    popularity: 1,
    regionMatch: 50,
    languageMatch: 70,
    tagMatch: 40,
    recommendationMatch: 60,
    overallEmotional: 2,
  };
  const maxScore = 1500; // تنظیم سقف امتیاز با توجه به تغییرات جدید

  const results = songsData
    .map((song) => {
      let score = 0;

      const songName = song.name?.[language] || song.name?.english || "Unknown";
      const artistName = song.artist?.toLowerCase() || "Unknown Artist";

      // اگر فقط نام خواننده وارد شده باشد، تطابق 100 درصد
      if (filters.matchExactArtist && artistName === keywordLower) {
        score = maxScore; // درصد تطابق 100
      } else {
        // تطابق نام آهنگ یا خواننده (تطابق دقیق)
        if (
          songName.toLowerCase().includes(keywordLower) ||
          artistName === keywordLower
        ) {
          score += weights.artistExactMatch;
        } else if (artistName.includes(keywordLower)) {
          // تطابق جزئی با نام خواننده
          score += weights.artistPartialMatch;
        }
      }

      // Emotional analysis match
      if (mood.length > 0 && song.emotional_analysis) {
        mood.forEach((m) => {
          const moodScore = song.emotional_analysis[m.toLowerCase()] || 0;
          score += moodScore * weights.emotionalMatch;
        });
      }

      // Audio features match
      if (song.audio_features) {
        score +=
          song.audio_features.acousticness > 0.6
            ? weights.audioFeatureMatch.acousticness
            : 0;
        score +=
          song.audio_features.tempo >= 60 && song.audio_features.tempo <= 100
            ? weights.audioFeatureMatch.tempo
            : 0;
        score +=
          song.audio_features.energy < 0.4
            ? weights.audioFeatureMatch.energy
            : 0;
        score +=
          song.audio_features.danceability > 0.7
            ? weights.audioFeatureMatch.danceability
            : 0;
      }

      // Match by activity
      if (activity.length > 0 && song.search_filters?.activity) {
        activity.forEach((a) => {
          if (song.search_filters.activity.includes(a)) {
            score += weights.activityMatch;
          }
        });
      }

      // Match by style
      if (style) {
        const songStyle = song.style?.toLowerCase() || "";
        if (songStyle.includes(style.toLowerCase())) {
          score += weights.styleMatch;
        }
      }

      // Popularity match
      score += (song.popularity || 0) * weights.popularity;

      // Match by region
      if (region.length > 0 && song.search_filters?.region) {
        region.forEach((r) => {
          if (song.search_filters.region.includes(r)) {
            score += weights.regionMatch;
          }
        });
      }

      // Match by language
      if (
        filterLanguage &&
        typeof song.language === "string" &&
        song.language.toLowerCase() === filterLanguage.toLowerCase()
      ) {
        score += weights.languageMatch;
      }

      // Match by tags
      if (tags.length > 0 && song.tags) {
        tags.forEach((tag) => {
          if (song.tags.includes(tag)) {
            score += weights.tagMatch;
          }
        });
      }

      // Match by recommendations
      if (song.recommendation) {
        song.recommendation.forEach((rec) => {
          if (rec.toLowerCase().includes(keywordLower)) {
            score += weights.recommendationMatch;
          }
        });
      }

      // Match by keyword in tags
      if (
        song.tags &&
        song.tags.some((tag) => tag.toLowerCase().includes(keywordLower))
      ) {
        score += weights.tagMatch;
      }

      // Match by mood and activity in search filters
      if (song.search_filters) {
        if (song.search_filters.mood) {
          mood.forEach((m) => {
            if (song.search_filters.mood.includes(m)) {
              score += weights.activityMatch;
            }
          });
        }
        if (song.search_filters.activity) {
          activity.forEach((a) => {
            if (song.search_filters.activity.includes(a)) {
              score += weights.activityMatch;
            }
          });
        }
      }

      // Overall emotional score
      score +=
        (song.emotional_analysis?.overall_emotional || 0) *
        weights.overallEmotional;

      // Calculate match score as percentage
      const matchScore =
        score > 0 ? Math.min((score / maxScore) * 100, 100) : 0;

      return { ...song, score, matchScore, displayName: songName };
    })
    .filter((song) => song.matchScore >= 1) // Filter out songs with 0 match score
    .sort((a, b) => b.matchScore - a.matchScore);

  // Fill results if not enough
  if (results.length < 15) {
    const fillerSongs = songsData
      .filter((song) => !results.includes(song))
      .slice(0, 15 - results.length)
      .map((song) => ({
        ...song,
        score: 0,
        matchScore: 0,
        displayName: song.name?.[language] || song.name?.english || "Unknown",
      }));
    results.push(...fillerSongs);
  }

  return results.slice(0, 5);
};

// Analyze user question with OpenAI
const analyzeQuestionWithAI = async (question) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            'You are a music assistant. Analyze the user question and return filters in JSON format (e.g., {"keyword":"love","mood":["romantic"],"activity":["party"],"style":"pop","popularity":80}). Ensure the filters are relevant to the question.',
        },
        { role: "user", content: question },
      ],
      max_tokens: 200,
    });

    const aiResponse = response.choices[0].message.content.trim();

    if (aiResponse.startsWith("{") && aiResponse.endsWith("}")) {
      return JSON.parse(aiResponse);
    } else {
      throw new Error("Invalid JSON response from OpenAI.");
    }
  } catch (error) {
    console.error("Error analyzing question with OpenAI:", error);
    return {
      keyword: question,
      mood: [],
      activity: [],
      style: "",
      popularity: 0,
    }; // Default
  }
};

// Extract artist name from question
const extractArtistFromQuestion = (question, artists) => {
  const lowerCaseQuestion = question.toLowerCase();

  // Fuzzy match for artist names
  const matchedArtist = artists.find((artist) => {
    const artistName = artist.name.toLowerCase();
    return lowerCaseQuestion.includes(artistName);
  });

  return matchedArtist ? matchedArtist.name : null;
};

// API routes
app.get("/", (req, res) => {
  res.send("Server is running. Use POST /ask for queries.");
});
app.post("/ask", async (req, res) => {
  try {
    const { question, language = "english" } = req.body;

    // بررسی وجود سوال در درخواست
    if (!question) {
      return res.status(400).json({ error: "Please provide a question." });
    }

    console.log(`[${new Date().toISOString()}] Received question: ${question}`);
    console.log(`[${new Date().toISOString()}] Selected language: ${language}`);

    // بارگذاری داده‌های هنرمندان
    const artists = await readArtistsData();
    if (!artists || artists.length === 0) {
      return res.status(404).json({ error: "Artists data not found." });
    }
    console.log(
      `[${new Date().toISOString()}] Artists data loaded: ${artists.length
      } artists`
    );

    // تحلیل سوال با OpenAI
    let filters = await analyzeQuestionWithAI(question);
    if (!filters) {
      return res.status(400).json({ error: "Unable to analyze the question." });
    }

    // بررسی وجود نام هنرمند در سوال
    const artistName = extractArtistFromQuestion(question, artists);
    if (artistName) {
      console.log(`Artist "${artistName}" found in question.`);
      filters.keyword = artistName; // جایگزینی یا افزودن هنرمند به فیلترهای جستجو

      // اگر فقط اسم خواننده داده شده باشد، درصد تطابق را 100 تنظیم می‌کنیم
      filters.matchExactArtist = true; // این فیلد به ما می‌گوید که سوال فقط برای جستجوی خواننده است
    } else {
      console.log("No artist found in question.");
    }

    console.log(`[${new Date().toISOString()}] Extracted filters:`, filters);

    // بارگذاری داده‌های آهنگ‌ها
    const songsData = await readSongsData();
    if (!songsData || songsData.length === 0) {
      return res.status(404).json({ error: "Songs data not found." });
    }
    console.log(
      `[${new Date().toISOString()}] Songs data loaded: ${songsData.length
      } songs`
    );

    // اجرای جستجوی پیشرفته
    const results = advancedSearch(filters, songsData, language);

    console.log(
      `[${new Date().toISOString()}] Number of results found: ${results.length}`
    );
    res.json({
      message: "Songs found!",
      results,
    });
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error processing request:`,
      error
    );
    res.status(500).json({ error: "Error processing your request." });
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at: http://127.0.0.1:${PORT}`);
});

// Merge songs with artists
const mergeSongsWithArtists = async () => {
  try {
    const songs = await readSongsData(); // Read song data
    const artists = await readArtistsData(); // Read artist data

    return songs.map((song) => {
      const matchedArtist = artists.find(
        (artist) =>
          artist.name.trim().toLowerCase() === song.artist.trim().toLowerCase()
      );

      return {
        ...song,
        artistDetails: matchedArtist || null, // If artist not found, set to null
      };
    });
  } catch (error) {
    console.error("Error merging songs and artists:", error);
    return [];
  }
};

// API to get songs with artist details
app.get("/songs", async (req, res) => {
  try {
    const mergedData = await mergeSongsWithArtists(); // Get merged data
    res.json(mergedData); // Send data to client
  } catch (error) {
    console.error("Error sending song data:", error);
    res.status(500).json({ error: "Error processing the request." });
  }
});
