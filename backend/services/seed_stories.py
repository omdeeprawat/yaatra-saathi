import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.database import SessionLocal
from models.story import Story

STORIES = [
    {
      "slug": "legend-of-nanda-devi",
      "title": "The Legend of Nanda Devi",
      "category": "mythology",
      "is_featured": True,
      "display_order": 1,
      "read_time_minutes": 5,
      "cover_image_url": None,
      "teaser": """In the ancient kingdoms of Garhwal and Kumaon, long before the first stone temples rose in the valleys, the people looked to the highest peaks and saw divinity itself. Among these sacred mountains, none commanded more reverence than Nanda Devi — the "Bliss-Giving Goddess."

The legends say she was born as the daughter of the Himalayan king, a princess of unsurpassed grace and devotion. Her beauty was said to rival the first snow of winter, and her compassion flowed like the mountain springs that gave life to the valleys below.""",
      "full_content": """# The Legend of Nanda Devi

In the ancient kingdoms of Garhwal and Kumaon, long before the first stone temples rose in the valleys, the people looked to the highest peaks and saw divinity itself. Among these sacred mountains, none commanded more reverence than Nanda Devi — the "Bliss-Giving Goddess."

## The Divine Princess

The legends say she was born as the daughter of the Himalayan king, a princess of unsurpassed grace and devotion. Her beauty was said to rival the first snow of winter, and her compassion flowed like the mountain springs that gave life to the valleys below.

From her earliest years, Nanda showed an extraordinary connection to the natural world. Birds would gather at her window at dawn. Flowers bloomed more brilliantly in her presence. The mountain winds themselves seemed to gentle when she walked among the high meadows.

## The Sacred Union

When she came of age, the cosmic dance of destiny brought her to the attention of Lord Shiva, the ascetic god who dwelt in meditation atop Mount Kailash. Their union was celebrated across the three worlds — the marriage of the mountain's daughter to the lord of the peaks themselves.

But according to tradition, every daughter must return to her parental home. And so, once every twelve years — aligned with the cycle of Jupiter around the sun — Nanda Devi is believed to journey from Kailash back to the mountains of Uttarakhand, visiting the land of her birth.

## Birth of the Raj Jat

The Raj Jat Yatra arose from this cosmic cycle. The people of Garhwal and Kumaon would not let their beloved goddess make this journey alone. And so they created the grandest procession the mountains had ever seen — a royal pilgrimage to escort Nanda Devi home.

From Nauti village to the glacial heights of Homkund, thousands gather to walk the ancient paths. The Chausingha, the sacred four-horned ram, leads the way — believed to carry the goddess's blessings. Musicians play the turhi and damau. The Jagaris sing through the night, their voices echoing off the peaks.

At Homkund, 4,200 meters above the sea, the final rituals are performed. The Chausingha is released to continue onward, carrying prayers to the divine realm. And there, beneath the eternal snows, pilgrims bid farewell to Nanda Devi, knowing they will wait twelve more years to escort her home again.

## Living Tradition

Today, the legend lives on in every stone placed at the wayside shrines, in every flower offered to the mountain streams, in every footstep of the millions who have walked this sacred path. The Raj Jat is more than memory — it is faith made manifest, carved into the very landscape of the Himalayas.

> "Nanda is not merely worshipped — she is lived, breathed, and carried in the hearts of her people through each valley and over each ridge, from generation to generation." — Ancient Garhwali saying
"""
    },
  {
    "slug": "mystery-of-chausingha",
    "title": "The Mystery of the Chausingha",
    "category": "mythology",
    "is_featured": True,
    "display_order": 2,
    "read_time_minutes": 4,
    "cover_image_url": None,
    "teaser": """Among all the symbols and rituals of the Nanda Devi Raj Jat Yatra, none captures the imagination quite like the Chausingha — the sacred four-horned ram that leads the entire procession. This is no ordinary animal. According to tradition, the Chausingha must be found naturally in the wild, never bred or forced.""",
    "full_content": """# The Mystery of the Chausingha

Among all the symbols and rituals of the Nanda Devi Raj Jat Yatra, none captures the imagination quite like the Chausingha — the sacred four-horned ram that leads the entire procession.

## What is the Chausingha?

This is no ordinary animal. The Chausingha is a sheep (not a true ram) born with four horns instead of the usual two. In the Himalayan pastoral traditions, such animals appear rarely — perhaps one in tens of thousands of births. They are considered deeply auspicious, a sign of divine favor.

According to tradition, the Chausingha for the Raj Jat must be found naturally in the wild, never bred or forced. Shepherds and village elders begin their search years in advance, watching their flocks and the mountain herds for this rare manifestation.

## The Divine Carrier

Why four horns? The symbolism runs deep in Hindu cosmology:
- Four represent the four Vedas (sacred texts)
- Four yugas (cosmic ages)
- Four directions from which pilgrims gather
- Four stages of life (ashrama)

The Chausingha is believed to be a divine vehicle — carrying the presence of Goddess Nanda herself during the journey. Some say it is an incarnation of Nandi, Lord Shiva's sacred bull, come in a different form to guide his consort home.

## The Search and Selection

When a potential Chausingha is discovered, village priests examine it carefully. The horns must be naturally formed, healthy, and balanced. The animal must show no fear of humans — for it is said the goddess chooses her own carrier, and the right Chausingha will recognize its purpose.

Once selected, the Chausingha is treated with utmost reverence. It is garlanded with flowers, fed the finest grains, and housed in a place of honor. Children touch its head for blessings. Pilgrims seek its darshan (sacred viewing) as they would approach a deity in a temple.

## The Sacred Journey

During the Yatra, the Chausingha walks at the front of the procession, guided gently but never forced. If it stops, the entire procession stops. If it chooses a particular path, that path is followed. The belief is that the animal is divinely guided, knowing the sacred route better than any human map.

Elders say that Chausinghas selected for past Yatras have displayed uncanny behavior:
- Walking confidently over treacherous terrain they'd never seen
- Stopping at sacred spots not marked on any route
- Remaining calm through thunder and storms that scattered other animals
- Showing no fatigue even at extreme altitudes

## The Release at Homkund

At the journey's end at Homkund, the most poignant moment occurs. After the final rituals are performed and prayers offered, the Chausingha is released. Garlands are removed, and it is set free to walk onward toward the peaks beyond.

According to legend, the Chausingha ascends toward the eternal snows, carrying the goddess's blessings to Kailash. None follow. None can. That realm belongs to the divine alone.

Shepherds who have witnessed this moment speak of it with tears. Some say the animal never returns to the lower valleys. Others claim to have seen four-horned prints in fresh snow on impossible peaks. The mystery remains.

## The 2014 Chausingha

In the most recent Yatra of 2014, the Chausingha was discovered in a village near Tharali. Villagers reported that as a lamb, it would often stand on high rocks gazing toward the mountains, as if waiting for something. When selected, it showed no fear — walking directly to the decorated platform prepared for it.

Throughout the 19-day journey, it led over 100,000 pilgrims without hesitation. At Homkund, witnesses reported that as it was released, it paused, turned back once toward the assembled crowd, and then walked steadily upward into the mist. Within moments, it had vanished from sight.

The next Yatra will be in 2026. Somewhere in the high pastures of Uttarakhand, shepherds are already watching their flocks, waiting for the next divine sign.

> "The Chausingha is not merely leading the procession — it is teaching us that faith requires no map, only trust in the path beneath our feet." — Pilgrim testimony, 2000 Yatra
"""
    },
    {
      "slug": "first-raj-jat-1000-ad",
      "title": "The First Recorded Raj Jat",
      "category": "historical",
      "is_featured": True,
      "display_order": 3,
      "read_time_minutes": 6,
      "cover_image_url": None,
      "teaser": """While the Nanda Devi Raj Jat is rooted in mythology stretching back to antiquity, the first reliably documented Yatra appears in copper plate inscriptions and temple chronicles from around 1000 CE. These records paint a vivid picture of a kingdom's devotion made manifest.""",
      "full_content": """# The First Recorded Raj Jat (1000 AD)

While the Nanda Devi Raj Jat is rooted in mythology stretching back to antiquity, the first reliably documented Yatra appears in copper plate inscriptions and temple chronicles from around 1000 CE.

## The Kingdom of Katyur

In the early medieval period, the Katyuri dynasty ruled over the Kumaon and Garhwal regions. These kings traced their lineage to the Shaivite tradition and held Goddess Nanda as their kuldevta (family deity). Historical evidence suggests they formalized the Raj Jat as a royal procession — hence the name "Raj" (royal) Jat (journey).

Copper plate grants from the reign of King Brahmadev (circa 1000-1025 AD) make specific reference to "the great mountain pilgrimage undertaken in the blessed year of the goddess." While not naming the Raj Jat directly, the dates align with the twelve-year cycle, and the described route matches the traditional path.

## The Medieval Procession

According to these historical fragments, the early Raj Jat was an affair of considerable political as well as religious significance:

**Royal Participation:** The king himself led the procession, accompanied by ministers, generals, and representatives from every village under his domain. It was a demonstration of sovereignty as much as devotion — the king claiming dominion over both the valleys and the sacred high places.

**Tributary Allegiance:** Smaller mountain chieftains were expected to join the Yatra with their own contingents. Their participation signaled loyalty to the Katyuri crown. The procession became a mobile court, where political negotiations occurred alongside religious observance.

**Ritual Complexity:** Medieval chronicles describe elaborate fire ceremonies (yajnas) performed at key stops — Nauti, Wan, and Bedni. Brahmin priests from as far as Varanasi were invited to preside over these rites. Sanskrit hymns to Nanda and Shiva echoed across the mountains.

## Evidence from Temple Architecture

Perhaps the most tangible evidence of the Raj Jat's antiquity lies in the temples dotting the route. Many show architectural features consistent with 10th-12th century Himalayan temple construction:

The **Nanda Devi temple at Nandkesari** contains stone inscriptions in Devanagari script describing donations made "for the welfare of pilgrims undertaking the sacred mountain journey." Carbon dating of wooden elements in the temple structure suggests original construction around 950-1000 AD.

At **Wan village**, the central shrine has been renovated many times, but its inner sanctum preserves stone carvings in the distinct Katyuri style. One carving depicts a procession ascending a mountain path, with what appears to be a four-horned animal at its head.

## The Role of Music and Oral Tradition

The Jagar tradition — the all-night singing that invokes the goddess — likely predates even written records. Linguistic analysis of Jagar songs reveals archaic Pahari dialect forms no longer used in daily speech. Some verses contain grammatical structures found in early medieval Garhwali, suggesting composition before 1000 AD.

These songs served as oral history, preserving stories of past Yatras, miraculous events, and the names of devoted pilgrims who attained spiritual merit. In an age before widespread literacy, the Jagaris were the keepers of collective memory.

## Continuity Through Political Change

The Katyuri dynasty eventually fragmented around 1200 AD, giving way to smaller regional kingdoms. Yet the Raj Jat persisted. Each successive ruling family — the Parmar dynasty of Garhwal, the Chand dynasty of Kumaon — adopted the Yatra as their own sacred duty.

This continuity across political upheavals speaks to the Raj Jat's deep roots in popular devotion. It was not imposed from above but emerged from the faith of common villagers, shepherds, and mountain communities. Kings merely formalized and patronized what the people had already made sacred.

## Decline and British Suppression

The British colonial period brought challenges. After 1857, British authorities viewed large religious gatherings with suspicion, fearing them as potential covers for anti-colonial organizing. The Raj Jat, involving tens of thousands of pilgrims crossing remote mountain territory, was particularly concerning.

Records from the British District Commissioner of Almora (1880s-1890s) mention "restrictions on the mountain pilgrimage to Homkund" and "limitations on assembly size." While the Yatra was never formally banned, administrative obstacles made it difficult to organize on its traditional grand scale.

## The 20th Century Revival

The Raj Jat of 1987 marked a triumphant return. After decades of reduced activity during colonial rule and the tumult of Indian independence, mountain communities came together to revive the full traditional procession. Over 50,000 people participated, many elders bringing their grandchildren to witness what they themselves had only heard about in stories.

Subsequent Yatras in 2000 and 2014 saw participation swell to over 100,000. The ancient pilgrimage had not only survived a millennium — it had grown stronger, carrying the faith of medieval kingdoms into the modern age.

> "What kings began, the people have preserved. The Raj Jat belongs not to any dynasty or era, but to the mountains themselves — eternal and enduring." — Dr. Shivani Dhasmana, Himalayan Cultural Studies, 2015
"""
    },
    {
      "slug": "jagar-tradition",
      "title": "The Sacred Jagar Tradition",
      "category": "cultural",
      "is_featured": False,
      "display_order": 4,
      "read_time_minutes": 5,
      "cover_image_url": None,
      "teaser": """As darkness falls over the mountain camps and the last pilgrims settle around flickering fires, a haunting sound rises through the night. The deep, rhythmic beating of the dhol drums. The metallic ring of a brass thali struck in complex patterns. And above it all, the voice of the Jagari — calling out to the goddess.""",
      "full_content": """# The Sacred Jagar Tradition

As darkness falls over the mountain camps and the last pilgrims settle around flickering fires, a haunting sound rises through the night. The deep, rhythmic beating of the dhol drums. The metallic ring of a brass thali struck in complex patterns. And above it all, the voice of the Jagari — calling out to the goddess.

## What is a Jagar?

The word "jagar" literally means "to awaken" in the Kumaoni and Garhwali languages. But a Jagar is far more than a song — it is an invocation, a trance-inducing ritual, and a form of oral history all woven together.

During the Raj Jat Yatra, Jagars are performed at major halts, especially at Wan and Bedni Bugyal. These all-night sessions serve multiple purposes:
- Invoking the presence of Goddess Nanda
- Recounting her mythology and past Yatras
- Creating a collective spiritual experience
- Passing traditions to younger generations

## The Jagari — Keeper of Memory

The Jagari is both singer and priest, genealogist and mystic. In traditional mountain society, becoming a Jagari required years of apprenticeship. Young aspirants would memorize thousands of verses, learn the intricate rhythms, and study the proper ritual sequences.

The knowledge was closely guarded, passed down through lineages. A skilled Jagari could perform for eight to twelve hours without repetition, drawing from a vast repertoire of verses about Nanda Devi, Shiva, the Pandavas who passed through these same mountains, and historical events dating back centuries.

## The Performance

A typical Jagar during the Raj Jat unfolds in phases:

**Opening (9 PM - 11 PM):** Gentle invocations. The Jagari begins with ancestral verses, calling upon past Jagaris and seeking their blessings. The pace is slow, meditative. Pilgrims sit in large circles around the fire.

**Building (11 PM - 2 AM):** The tempo increases. Verses now focus on Nanda's story — her divine birth, her marriage to Shiva, her love for these mountains. The dhol beats grow more insistent. Some listeners begin to sway.

**Peak (2 AM - 4 AM):** The trance state. The Jagari's voice reaches an intense, almost hypnotic pitch. The thali rings out like thunder. In this phase, witnesses report that some participants enter a state called "dhan aana" — being possessed by the deity. They may shake, speak in tongues, or dance with wild abandon, believed to be the goddess manifesting through them.

**Resolution (4 AM - Dawn):** As the first light touches the peaks, the Jagar slowly descends in intensity. The final verses are gentle again — prayers for safe journey, for the well-being of all pilgrims, for the goddess's continued blessings on these mountains and valleys.

## The Instruments

Three instruments form the core of Jagar music:

**The Dhol:** A double-headed drum worn around the performer's shoulder. The right hand strikes with a curved stick for sharp beats; the left hand uses palm strikes for bass tones. The dhol provides the heartbeat of the Jagar.

**The Thali:** A large brass or copper plate struck with metal rings worn on the fingers. In skilled hands, the thali becomes a complete percussion orchestra — its overtones and harmonics adding layers of complexity to the rhythm.

**The Damau:** A smaller kettledrum, sometimes used in addition to the dhol. Its higher pitch cuts through the mountain air.

Occasionally, wind instruments like the turhi (brass horn) or ransingha (curved horn) join in, their deep notes echoing off the surrounding peaks.

## The Language of the Mountains

Jagar verses are performed in archaic forms of Garhwali and Kumaoni. Many words and phrases are no longer used in modern speech. Some verses contain Sanskrit terms; others use forms that linguists believe predate even medieval Pahari dialects.

For modern listeners, especially younger Uttarakhandi youth educated in Hindi or English, understanding every word is difficult. But the power of the Jagar transcends literal comprehension — it works through rhythm, repetition, and the sheer emotional weight of tradition.

## Contemporary Challenges

The Jagar tradition faces pressures in the modern era. Fewer young people want to undergo the years of training required. The memorization of thousands of verses in archaic language competes poorly with modern education and employment opportunities.

During the 2014 Raj Jat, organizers noted that the number of active Jagaris had declined compared to previous Yatras. Many were elderly men, raising questions about who would carry the tradition forward.

However, there are signs of revival. Cultural organizations in Uttarakhand have begun documenting Jagars — recording audio and video, transcribing verses. Universities offer courses on Himalayan oral traditions. Some young artists are experimenting with fusion forms, bringing Jagar rhythms into contemporary music while preserving the core spiritual elements.

## Experiencing a Jagar

Those who have witnessed a Jagar during the Raj Jat describe it as unforgettable:

"I understood maybe one word in ten," says Priya Rawat, who attended the 2000 Yatra as a college student. "But it didn't matter. The rhythm entered your bones. The voice of the Jagari seemed to come from the mountain itself. When the sun finally rose and the last notes faded away, I felt like I'd traveled a thousand years into the past and returned."

Another pilgrim, Diwan Singh Bisht, a shepherd from Chamoli, put it simply: "The Jagar is how we talk to Nanda Ma. Not with our words, but with the words of our grandfathers, and their grandfathers, going back to when the first human looked at these peaks and felt something sacred."

> "In the Jagar, time collapses. The ancient and the modern, the mythic and the historical, the individual and the collective — all merge in the firelight and the drum's beat." — Dr. Yashodhara Mathpal, Folklore Studies, Kumaon University
"""
    },
]


def seed():
    db = SessionLocal()
    try:
      existing = db.query(Story).count()
      if existing > 0:
        print(f"[INFO] Stories already seeded ({existing} records). Skipping.")
        return

      for story_data in STORIES:
        story = Story(**story_data)
        db.add(story)

      db.commit()
      print(f"[OK] Seeded {len(STORIES)} stories successfully.")


    except Exception as e:
      db.rollback()
      print(f"[ERROR] Seeding failed: {e}")

      raise
    finally:
      db.close()


if __name__ == "__main__":
  seed()