import json
import sys

# مسیر فایل JSON
songs_json_path = "songs_with_artists.json"


# تابع خواندن داده‌ها
def load_songs_data():
    try:
        with open(songs_json_path, "r", encoding="utf-8") as file:
            return json.load(file)
    except Exception as e:
        return {"error": f"خطا در خواندن فایل JSON: {e}"}


# جستجوی پیشرفته
def search_songs(query):
    try:
        # بررسی ورودی
        if not isinstance(query, dict):
            return {"error": "ورودی باید یک دیکشنری معتبر باشد."}

        # بارگذاری داده‌ها
        songs = load_songs_data()
        if "error" in songs:
            return songs

        # اعمال فیلترها
        results = []
        for song in songs:
            score = 0

            # تطابق کلمه کلیدی
            if query.get("keyword"):
                keyword = query["keyword"].lower()
                if (
                    keyword in song.get("name", {}).get("english", "").lower()
                    or keyword in song.get("artist", "").lower()
                ):
                    score += 50

            # فیلتر حالت روحی
            if query.get("mood") and song.get("emotional_analysis"):
                for mood in query["mood"]:
                    score += song["emotional_analysis"].get(mood.lower(), 0)

            # فیلتر فعالیت‌ها
            if query.get("activity") and song.get("search_filters", {}).get("activity"):
                for activity in query["activity"]:
                    if activity in song["search_filters"]["activity"]:
                        score += 30

            # فیلتر محبوبیت
            if query.get("popularity", 0) <= song.get("popularity", 0):
                score += 20

            # اضافه کردن به نتایج اگر امتیاز بالا باشد
            if score > 50:
                results.append({**song, "score": score})

        # مرتب‌سازی نتایج بر اساس امتیاز
        results.sort(key=lambda x: x["score"], reverse=True)

        if not results:
            return {"message": "هیچ آهنگی با شرایط مشخص‌شده یافت نشد.", "results": []}

        return {"results": results[:10]}  # بازگرداندن 10 نتیجه برتر
    except Exception as e:
        return {"error": f"خطا در جستجو: {e}"}


if __name__ == "__main__":
    try:
        # دریافت ورودی از command line
        if len(sys.argv) > 1:
            query = json.loads(sys.argv[1])
        else:
            raise ValueError("ورودی JSON یافت نشد.")
        response = search_songs(query)
        print(json.dumps(response, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"error": f"خطا در پردازش: {str(e)}"}))
