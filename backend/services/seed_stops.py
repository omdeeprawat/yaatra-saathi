import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.database import SessionLocal
from models.stop import YatraStop

STOPS = [
  dict(stage_number=1, name="Nauti Village", name_hindi="नौटी गांव", latitude=30.20509, longitude=79.19933, altitude_meters=1400, distance_from_previous_km=0.0, cumulative_km=0.0, stop_type="start", description="The starting point of the Nanda Devi Raj Jat Yatra, where rituals begin.", significance="Assembly point where the royal palki of Goddess Nanda is inaugurated and the Chausingha joins the procession.", photos=[]),

  dict(stage_number=2, name="Ida Badhani", name_hindi="इडा बढ़ानी", latitude=30.245914, longitude=79.225521, altitude_meters=~1420, distance_from_previous_km=6.0, cumulative_km=6.0, stop_type="camp", description="Early halt on the opening stretch after Nauti.", significance="A smaller rest point where the procession gathers before the main valley route begins.", photos=[]),

  dict(stage_number=3, name="Kansuwa", name_hindi="कांसुवा", latitude=30.171793, longitude=79.209048, altitude_meters=~1440, distance_from_previous_km=5.0, cumulative_km=11.0, stop_type="camp", description="A village stop on the lower route toward the main pilgrimage corridor.", significance="A traditional pause point for pilgrims and local participants.", photos=[]),

  dict(stage_number=4, name="Sem", name_hindi="सेम", latitude=30.182867, longitude=79.263998, altitude_meters=~1460, distance_from_previous_km=6.0, cumulative_km=17.0, stop_type="camp", description="A small stop before the larger route junctions.", significance="Used as a practical resting point on the approach to Kulsari.", photos=[]),

  dict(stage_number=5, name="Koti", name_hindi="कोटी", latitude=30.174414, longitude=79.316750, altitude_meters=~1480, distance_from_previous_km=6.0, cumulative_km=23.0, stop_type="camp", description="Route halt along the valley-side approach.", significance="Part of the lower pilgrimage corridor where the yatra gains momentum.", photos=[]),

  dict(stage_number=6, name="Bhagoti", name_hindi="भगोटी", latitude=29.847979, longitude=79.302779, altitude_meters=~1500, distance_from_previous_km=6.0, cumulative_km=29.0, stop_type="camp", description="Intermediate stop before the Kulsari cluster.", significance="A local ritual pause and regrouping point.", photos=[]),

  dict(stage_number=7, name="Kulsari", name_hindi="कुलसारी", latitude=30.084416, longitude=79.460272, altitude_meters=~1050, distance_from_previous_km=12.0, cumulative_km=41.0, stop_type="camp", description="First major camp in the Pindar valley. A small settlement with a significant Nanda Devi temple.", significance="The procession passes through cultivated fields and offers the first views of the Pindar River. An important pause for community rituals.", photos=[]),

  dict(stage_number=8, name="Chepdue", name_hindi="चेपडू", latitude=30.0538, longitude=79.4500, altitude_meters=~1560, distance_from_previous_km=6.0, cumulative_km=47.0, stop_type="camp", description="A smaller halt between Kulsari and the Nand Kesari area.", significance="A traditional stop where pilgrims regroup before the climb toward the older shrines.", photos=[]),

  dict(
    stage_number=9, 
    name="Nand Kesari", 
    name_hindi="नंद केसरी", 
    latitude=30.041535,   
    longitude=79.572388,  
    altitude_meters=1240, 
    distance_from_previous_km=14.0, 
    cumulative_km=61.0, 
    stop_type="camp", 
    description="A major hub where palanquins from the Kumaon region join.", 
    significance="Home to one of the oldest Nanda Devi shrines along the route and a key ritual junction.", 
    photos=[]
  ),
  dict(
    stage_number=10, 
    name="Faldiya", 
    name_hindi="फल्डिया", 
    latitude=30.0931,   # Corrected from 30.4250
    longitude=79.5962,  # Corrected from 79.3350
    altitude_meters=1680, 
    distance_from_previous_km=10.0, 
    cumulative_km=71.0, 
    stop_type="camp", 
    description="Mid-route village on the ascent toward Mundoli.", 
    significance="A transitional halt between the lower villages and the more remote highland section.", 
    photos=[]
  ),
  dict(
    stage_number=11, 
    name="Mundoli", 
    name_hindi="मुंडोली", 
    latitude=30.125658,   # Corrected from 30.4500 (Maps to Tharali belt)
    longitude=79.612562,  # Corrected from 79.3600
    altitude_meters=2160, 
    distance_from_previous_km=15.0, 
    cumulative_km=86.0, 
    stop_type="camp", 
    description="Traditional Garhwali village surrounded by terraced fields.", 
    significance="Pilgrims experience authentic mountain village life; local families open their homes.", 
    photos=[]
  ),
  dict(
    stage_number=12, 
    name="Wan (Vaan)", 
    name_hindi="वाण", 
    latitude=30.205017,   # Corrected from 30.4850
    longitude=79.617979,  # Corrected from 79.3950
    altitude_meters=2435, 
    distance_from_previous_km=14.0, 
    cumulative_km=100.0, 
    stop_type="camp", 
    description="The final inhabited village on the route.", 
    significance="Wan is one of the holiest stops on the yatra and the procession halts here for extended rituals.", 
    photos=[]
  ),
  dict(
    stage_number=13, 
    name="Gairoli Patal", 
    name_hindi="गैरोली पाताल", 
    latitude=30.205643,   # Corrected from 30.5050
    longitude=79.651387,  # Corrected from 79.4150
    altitude_meters=2850, 
    distance_from_previous_km=10.0, 
    cumulative_km=110.0, 
    stop_type="camp", 
    description="High route stop above Wan where the landscape becomes more rugged and alpine.", 
    significance="An important staging point before the upper meadows.", 
    photos=[]
  ),
  dict(
    stage_number=14, 
    name="Bedni Bugyal", 
    name_hindi="बेदनी बुग्याल", 
    latitude=30.194067,   # Corrected from 30.5350
    longitude=79.645089,  # Corrected from 79.4350
    altitude_meters=3354, 
    distance_from_previous_km=10.0, 
    cumulative_km=120.0, 
    stop_type="bugyal", 
    description="A high-altitude alpine meadow where the famous Nanda Devi fair takes place.", 
    significance="Bedni Kund is sacred to Goddess Nanda; features panoramic views of Trishul.", 
    photos=[]
  ),
  dict(
    stage_number=15, 
    name="Patar Nachoniya", 
    name_hindi="पातर नाचोनिया", 
    latitude=30.238107,  
    longitude=79.692543,  
    altitude_meters=3650, 
    distance_from_previous_km=8.0, 
    cumulative_km=128.0, 
    stop_type="camp", 
    description="Rocky alpine stretch after Bedni where the trail becomes harsher.", 
    significance="A high-altitude acclimatisation stop before the final camps.", 
    photos=[]
  ),
  dict(
    stage_number=16, 
    name="Bhagwabasa ", 
    name_hindi="भाग्वबासा ", 
    latitude=30.2608,   
    longitude=79.7425,  
    altitude_meters=~4100, 
    distance_from_previous_km=11.0, 
    cumulative_km=139.0, 
    stop_type="camp", 
    description="The highest overnight camp on the ascent, characterized by natural rock shelters and bitter cold.", 
    significance="The final staging ground where pilgrims mentally and physically prepare for the high-altitude pass crossing.", 
    photos=[]
  ),
  dict(
    stage_number=17, 
    name="Roopkund & Junargali Pass", 
    name_hindi="रूपकुंड / ज्युनारगाली",
    latitude=30.262447,   
    longitude=79.731733,  
    altitude_meters=4751, 
    distance_from_previous_km=5.0, 
    cumulative_km=144.0, 
    stop_type="camp", 
    description="The infamous high-altitude glacial skeleton lake nestled tightly under the ridge of Junargali Pass.", 
    significance="A deeply historical and sacred zone where grand prayers are offered before navigating the hazardous ridge drop.",
    photos=[]
  ),
  dict(
    stage_number=18, 
    name="Shila Samudra", 
    name_hindi="शिला समुद्र", 
    latitude=30.281519,   
    longitude=79.739857,  
    altitude_meters=4150, 
    distance_from_previous_km=10.0, 
    cumulative_km=154.0, 
    stop_type="camp", 
    description="A stark glacier camp field entirely consisting of massive boulders and shifting scree slopes.", 
    significance="Known as the 'Ocean of Stones', it serves as the rugged wilderness camp directly behind Mount Trishul.", 
    photos=[]
  ),
  
  dict(
    stage_number=19, 
    name="Chandniya Ghat", 
    name_hindi="चांदनिया घाट", 
    latitude=30.2680,   # Corrected from 30.5800
    longitude=79.7210,  # Corrected from 79.4700
    altitude_meters=3550, 
    distance_from_previous_km=8.0, 
    cumulative_km=162.0, 
    stop_type="camp", 
    description="The river basin campsite sitting right on the approach valley leading up to the final shrine site.", 
    significance="The final water-source junction used by pilgrims to assemble before ascending into the ultimate sanctuary.", 
    photos=[]
  ),
  dict(
    stage_number=20, 
    name="Homkund", 
    name_hindi="होमकुंड", 
    latitude=30.270351,   
    longitude=79.724534, 
    altitude_meters=4200, 
    distance_from_previous_km=5.0, 
    cumulative_km=167.0, 
    stop_type="destination", 
    description="The absolute apex and sacred terminus point of the outbound pilgrimage trail.", 
    significance="The ultimate destination where the final havans are performed and the four-horned ram is set free toward Mount Kailash.", 
    photos=[]
  ),
  dict(
    stage_number=21, 
    name="Sutol", 
    name_hindi="सुतोल", 
    latitude=30.273397,   
    longitude=79.624768,  
    altitude_meters=2190, 
    distance_from_previous_km=21.0, 
    cumulative_km=188.0, 
    stop_type="return", 
    description="The first return-route settlement reached as the procession descends out of the wild glacial heights.", 
    significance="A crucial resting and overnight regrouping point where local villagers welcome back the homeward procession.", 
    photos=[]
  ),
  dict(
    stage_number=22, 
    name="Ghat", 
    name_hindi="घाट", 
    latitude=30.2547,   
    longitude=79.4678,  
    altitude_meters=1334, 
    distance_from_previous_km=18.0, 
    cumulative_km=206.0, 
    stop_type="return", 
    description="A larger, lower-altitude town situated in the valley section of the district.", 
    significance="The major terminal junction where the high-altitude foot march meets the regional motorable road network.", 
    photos=[]
  ),
  dict(
    stage_number=23, 
    name="Nauti Village", 
    name_hindi="नौटी गांव", 
    latitude = 30.20509, longitude=79.19933,  # Corrected from 79.2440
    altitude_meters=1400, 
    distance_from_previous_km=74.0, 
    cumulative_km=280.0, 
    stop_type="end", 
    description="The yatra concludes back at the starting point after the return journey.", 
    significance="The procession completes its full circuit and the closing rites are performed.", 
    photos=[]
  )
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