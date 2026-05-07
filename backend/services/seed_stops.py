import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.database import SessionLocal
from models.stop import YatraStop

STOPS = [
  dict(stage_number=1, name="Nauti Village", name_hindi="नौटी गांव", latitude=30.2735, longitude=79.2440, altitude_meters=1400, distance_from_previous_km=0.0, cumulative_km=0.0, stop_type="start", description="The starting point of the Nanda Devi Raj Jat Yatra, where rituals begin.", significance="Assembly point where the royal palki of Goddess Nanda is inaugurated and the Chausingha joins the procession.", photos=[]),
  dict(stage_number=2, name="Ida Badhani", name_hindi="इडा बढ़ानी", latitude=30.2790, longitude=79.2510, altitude_meters=1420, distance_from_previous_km=6.0, cumulative_km=6.0, stop_type="camp", description="Early halt on the opening stretch after Nauti.", significance="A smaller rest point where the procession gathers before the main valley route begins.", photos=[]),
  dict(stage_number=3, name="Kansuwa", name_hindi="कांसुवा", latitude=30.2870, longitude=79.2600, altitude_meters=1440, distance_from_previous_km=5.0, cumulative_km=11.0, stop_type="camp", description="A village stop on the lower route toward the main pilgrimage corridor.", significance="A traditional pause point for pilgrims and local participants.", photos=[]),
  dict(stage_number=4, name="Sem", name_hindi="सेम", latitude=30.3000, longitude=79.2700, altitude_meters=1460, distance_from_previous_km=6.0, cumulative_km=17.0, stop_type="camp", description="A small stop before the larger route junctions.", significance="Used as a practical resting point on the approach to Kulsari.", photos=[]),
  dict(stage_number=5, name="Koti", name_hindi="कोटी", latitude=30.3150, longitude=79.2800, altitude_meters=1480, distance_from_previous_km=6.0, cumulative_km=23.0, stop_type="camp", description="Route halt along the valley-side approach.", significance="Part of the lower pilgrimage corridor where the yatra gains momentum.", photos=[]),
  dict(stage_number=6, name="Bhagoti", name_hindi="भगोटी", latitude=30.3300, longitude=79.2900, altitude_meters=1500, distance_from_previous_km=6.0, cumulative_km=29.0, stop_type="camp", description="Intermediate stop before the Kulsari cluster.", significance="A local ritual pause and regrouping point.", photos=[]),
  dict(stage_number=7, name="Kulsari", name_hindi="कुलसारी", latitude=30.3640, longitude=79.2950, altitude_meters=1350, distance_from_previous_km=12.0, cumulative_km=41.0, stop_type="camp", description="First major camp in the Pindar valley. A small settlement with a significant Nanda Devi temple.", significance="The procession passes through cultivated fields and offers the first views of the Pindar River. An important pause for community rituals.", photos=[]),
  dict(stage_number=8, name="Chepdue", name_hindi="चेपडू", latitude=30.3850, longitude=79.3050, altitude_meters=1560, distance_from_previous_km=6.0, cumulative_km=47.0, stop_type="camp", description="A smaller halt between Kulsari and the Nand Kesari area.", significance="A traditional stop where pilgrims regroup before the climb toward the older shrines.", photos=[]),
  dict(stage_number=9, name="Nand Kesari", name_hindi="नंद केसरी", latitude=30.4050, longitude=79.3200, altitude_meters=1600, distance_from_previous_km=14.0, cumulative_km=61.0, stop_type="camp", description="A major hub where palanquins from the Kumaon region join.", significance="Home to one of the oldest Nanda Devi shrines along the route and a key ritual junction.", photos=[]),
  dict(stage_number=10, name="Faldiya", name_hindi="फल्डिया", latitude=30.4250, longitude=79.3350, altitude_meters=1750, distance_from_previous_km=10.0, cumulative_km=71.0, stop_type="camp", description="Mid-route village on the ascent toward Mundoli.", significance="A transitional halt between the lower villages and the more remote highland section.", photos=[]),
  dict(stage_number=11, name="Mundoli", name_hindi="मुंडोली", latitude=30.4500, longitude=79.3600, altitude_meters=2000, distance_from_previous_km=15.0, cumulative_km=86.0, stop_type="camp", description="Traditional Garhwali village surrounded by terraced fields.", significance="Pilgrims experience authentic mountain village life; local families open their homes and courtyards for the procession.", photos=[]),
  dict(stage_number=12, name="Wan (Vaan)", name_hindi="वाण", latitude=30.4850, longitude=79.3950, altitude_meters=2400, distance_from_previous_km=14.0, cumulative_km=100.0, stop_type="camp", description="The final inhabited village on the route.", significance="Wan is one of the holiest stops on the yatra and the procession halts here for extended rituals and acclimatisation.", photos=[]),
  dict(stage_number=13, name="Gairoli Patal", name_hindi="गैरोली पाताल", latitude=30.5050, longitude=79.4150, altitude_meters=2850, distance_from_previous_km=10.0, cumulative_km=110.0, stop_type="camp", description="High route stop above Wan where the landscape becomes more rugged and alpine.", significance="An important staging point before the upper meadows.", photos=[]),
  dict(stage_number=14, name="Bedni Bugyal", name_hindi="बेदनी बुग्याल", latitude=30.5350, longitude=79.4350, altitude_meters=3354, distance_from_previous_km=10.0, cumulative_km=120.0, stop_type="bugyal", description="A high-altitude alpine meadow where the famous Nanda Devi fair and traditional dances take place.", significance="Bedni Kund is sacred to Goddess Nanda and the panoramic views of Trishul and Nanda Ghunti are among the route's highlights.", photos=[]),
  dict(stage_number=15, name="Patar Nachoniya", name_hindi="पातर नाचोनिया", latitude=30.5550, longitude=79.4550, altitude_meters=3600, distance_from_previous_km=8.0, cumulative_km=128.0, stop_type="camp", description="Rocky alpine stretch after Bedni where the trail becomes harsher and more exposed.", significance="A high-altitude acclimatisation stop before the final camps above 3700 meters.", photos=[]),
  dict(stage_number=16, name="Bhagwabasa / Roopkund", name_hindi="भाग्वबासा / रूपकुंड", latitude=30.5700, longitude=79.4800, altitude_meters=4000, distance_from_previous_km=11.0, cumulative_km=139.0, stop_type="camp", description="The mysterious high-altitude zone associated with Roopkund and the final camping sector before Homkund.", significance="A dramatic and historically significant part of the pilgrimage landscape, often associated with the Skeleton Lake region and harsh weather.", photos=[]),
  dict(stage_number=17, name="Shila Samudra", name_hindi="शिला समुद्र", latitude=30.5850, longitude=79.4950, altitude_meters=4100, distance_from_previous_km=7.0, cumulative_km=146.0, stop_type="camp", description="A stark high-altitude section of rock and snow between the upper camps and the sacred destination.", significance="Marks the final exposed approach before Homkund and the concluding rituals.", photos=[]),
  dict(stage_number=18, name="Homkund", name_hindi="होमकुंड", latitude=30.5950, longitude=79.5100, altitude_meters=4200, distance_from_previous_km=5.0, cumulative_km=151.0, stop_type="destination", description="The culmination point where final fire rituals are performed and the sacred four-horned ram is released toward Mount Kailash.", significance="Homkund is where Goddess Nanda's journey to Lord Shiva's abode at Kailash is symbolically completed. The final rituals immerse offerings in the glacial lake and conclude the pilgrimage.", photos=[]),
  dict(stage_number=19, name="Chandniya Ghat", name_hindi="चांदनिया घाट", latitude=30.5800, longitude=79.4700, altitude_meters=3550, distance_from_previous_km=28.0, cumulative_km=179.0, stop_type="return", description="Return journey halt after the Homkund rituals, on the way back down from the upper basin.", significance="Represents the beginning of the descent phase after the culmination at Homkund.", photos=[]),
  dict(stage_number=20, name="Sutol", name_hindi="सुतोल", latitude=30.5400, longitude=79.4300, altitude_meters=2800, distance_from_previous_km=35.0, cumulative_km=214.0, stop_type="return", description="Return-route stop as the procession descends toward the inhabited mid-route belt.", significance="A resting and regrouping point for the homeward procession.", photos=[]),
  dict(stage_number=21, name="Ghat", name_hindi="घाट", latitude=30.4800, longitude=79.3300, altitude_meters=1300, distance_from_previous_km=35.0, cumulative_km=249.0, stop_type="return", description="Lower-altitude return stop in the valley section of the route.", significance="A major descent point where the pilgrimage re-enters the more accessible road-linked belt.", photos=[]),
  dict(stage_number=22, name="Nauti Village", name_hindi="नौटी गांव", latitude=30.2735, longitude=79.2440, altitude_meters=1400, distance_from_previous_km=31.0, cumulative_km=280.0, stop_type="end", description="The yatra concludes back at the starting point after the return journey.", significance="The procession completes its full circuit and the closing rites are performed where the journey began.", photos=[]),
]


def seed():
  db = SessionLocal()
  try:
    existing = db.query(YatraStop).count()
    if existing > 0:
      print(f"[INFO] Stops already seeded ({existing} records). Skipping.")
      return

    for stop_data in STOPS:
      stop = YatraStop(**stop_data)
      db.add(stop)

    db.commit()
    print(f"[OK] Seeded {len(STOPS)} Yatra stops successfully.")


  except Exception as e:
    db.rollback()
    print(f"[ERROR] Seeding failed: {e}")
    raise

  
  finally:
    db.close()


if __name__ == "__main__":
    seed()