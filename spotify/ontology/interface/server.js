const express = require("express");
const cors = require("cors");
const fs = require("fs");
const OpenAI = require("openai");
const Fuse = require("fuse.js"); // برای fuzzy matching

const app = express();
app.use(cors());
app.use(express.json());

// مسیر فایل JSON که شامل اطلاعات آهنگ‌ها و هنرمندان است
const songsJsonPath =
    "songs_with_artists.json";

// پیکربندی OpenAI
// const openai = new OpenAI({
//   apiKey:
//     "",
// });

// خواندن داده‌ها از فایل songs_with_artists.json
const readSongsData = () => {
    try {
        const data = fs.readFileSync(songsJsonPath, "utf8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading the songs JSON file:", error);
        return [];
    }
};



// Endpoint برای تحلیل سوال و جستجو
app.post("/ask", async (req, res) => {
    try {
        const { question } = req.body;

        console.log(`[${new Date().toISOString()}] Received question: ${question}`);

        // ارسال سوال به ChatGPT برای تحلیل
        console.log(`[${new Date().toISOString()}] Sending question to ChatGPT...`);
        const chatResponse = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content:
                        "You are a music assistant. Analyze the user's question and return only one relevant keyword. For example, if the question is about love songs, return 'love'. If the question is about an artist, return the artist's name.",
                },
                {
                    role: "user",
                    content: question,
                },
            ],
            max_tokens: 10,
        });

        const keyword = chatResponse.choices[0].message.content
            .trim()
            .toLowerCase();
        console.log(`[${new Date().toISOString()}] Extracted keyword: ${keyword}`);

        // خواندن داده‌ها از فایل songs_with_artists.json
        const songsData = readSongsData();

        // فیلتر کردن نتایج بر اساس کلمه کلیدی با استفاده از fuzzy matching
        const results = fuzzySearch(keyword, songsData);

        if (results.length === 0) {
            console.log(
                `[${new Date().toISOString()}] No results found for keyword: ${keyword}`
            );
            res.json({
                message: "No songs found for the given keyword.",
                results: [],
            });
        } else {
            console.log(
                `[${new Date().toISOString()}] Found ${results.length
                } results for keyword: ${keyword}`
            );
            res.json({
                message: "Songs found based on your request.",
                results: results.slice(0, 10), // محدود کردن به 10 نتیجه
            });
        }
    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] Error processing the request:`,
            error
        );
        res.status(500).send({ error: "Error processing the request" });
    }
});

// اجرای سرور
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
