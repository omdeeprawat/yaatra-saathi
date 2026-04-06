import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.database import SessionLocal
from models.stop import YatraStop

STOPS = [
  dict(
    stage_number=1, name="Nauti", name_hindi="नौटी",
    latitude=30.2450, longitude=79.2650, altitude_meters=1400,
    distance_from_prev_km=0.0, cumulative_km=0.0,
    stop_type="start",
    description="The sacred starting point of the Raj Jat Yatra in Chamoli district. The Chausingha (four-horned ram) joins the procession here.",
    significance="Assembly point where the royal palki of Goddess Nanda is inaugurated. The Yatra formally begins with elaborate fire rituals and the blessing of the Chausingha.",
    photos=[],
  ),
  dict(
    stage_number=2, name="Kulsari", name_hindi="कुलसारी",
    latitude=30.2850, longitude=79.2400, altitude_meters=1350,
    distance_from_prev_km=12.0, cumulative_km=12.0,
    stop_type="camp",
    description="First stage halt in the Pindar River valley. A small settlement with a significant Nanda Devi temple.",
    significance="The procession passes through cultivated fields and offers the first views of the Pindar River. An important pause for community rituals.",
    photos=[],
  ),
  dict(
    stage_number=3, name="Nandkesari", name_hindi="नंदकेसरी",
    latitude=30.3100, longitude=79.2150, altitude_meters=1600,
    distance_from_prev_km=14.0, cumulative_km=26.0,
    stop_type="camp",
    description="Village with one of the oldest Nanda Devi temples on the route. The trail ascends through oak and rhododendron forests.",
    significance="Home to an ancient Nanda Devi shrine revered across Garhwal. Local devtas (village deities) join the procession here.",
    photos=[],
  ),
  dict(
    stage_number=4, name="Ramni", name_hindi="रमणी",
    latitude=30.3450, longitude=79.1950, altitude_meters=2100,
    distance_from_prev_km=15.0, cumulative_km=41.0,
    stop_type="camp",
    description="Dense forested camp. Himalayan monal pheasants and black bears inhabit the surrounding forests.",
    significance="Gateway to the higher Himalayan forests. Pilgrims ford several small glacial streams between Nandkesari and Ramni.",
    photos=[],
  ),
  dict(
    stage_number=5, name="Narayanbagar", name_hindi="नारायणबगड़",
    latitude=30.3750, longitude=79.1700, altitude_meters=1800,
    distance_from_prev_km=10.0, cumulative_km=51.0,
    stop_type="camp",
    description="An important market town and administrative centre. Better facilities available here including medical camps.",
    significance="Historical trade junction in the Pindar valley. The procession briefly descends to the valley floor before the sustained climb begins.",
    photos=[],
  ),
  dict(
    stage_number=6, name="Mundoli", name_hindi="मुंडोली",
    latitude=30.3950, longitude=79.1450, altitude_meters=2000,
    distance_from_prev_km=18.0, cumulative_km=69.0,
    stop_type="camp",
    description="Traditional Garhwali village surrounded by terraced fields. A longer stage but on relatively gradual terrain.",
    significance="Pilgrims experience authentic mountain village life. Local families open their homes and courtyards for the procession.",
    photos=[],
  ),
  dict(
    stage_number=7, name="Wan", name_hindi="वाण",
    latitude=30.4200, longitude=79.1200, altitude_meters=2400,
    distance_from_prev_km=14.0, cumulative_km=83.0,
    stop_type="camp",
    description="The most important village on the entire route. The procession halts here for two nights. Grand rituals, Jagar performances, and community feasting.",
    significance="Wan's Nanda Devi temple is one of the holiest on the route. All-night Jagar singing sessions invoke the Goddess. The two-night halt allows pilgrims to acclimatise before the high-altitude stages.",
    photos=[],
  ),
  dict(
    stage_number=8, name="Bedni Bugyal", name_hindi="बेदनी बुग्याल",
    latitude=30.4550, longitude=79.0950, altitude_meters=3354,
    distance_from_prev_km=10.0, cumulative_km=93.0,
    stop_type="bugyal",
    description="One of the most spectacular high-altitude meadows in the Himalayas. The sacred Bedni Kund lake sits within the meadow, reflecting Trishul, Nanda Ghunti, and Roopkund peaks.",
    significance="Bedni Kund is sacred to Goddess Nanda. Major rituals are performed here at the lake's edge. The panoramic views of Trishul (7120m) and Nanda Ghunti are among the most dramatic on the route.",
    photos=[],
  ),
  dict(
    stage_number=9, name="Pathar Nachuni", name_hindi="पत्थर नाचुनी",
    latitude=30.4800, longitude=79.0700, altitude_meters=3700,
    distance_from_prev_km=8.0, cumulative_km=101.0,
    stop_type="camp",
    description="Rocky highland camp at 3700m. Snow is present even in summer months. The terrain becomes bare, rugged, and otherworldly.",
    significance="Named for flat stones (pathar) that look like a dancing floor. Pilgrims acclimatise here before the final push. Temperature drops sharply below freezing at night.",
    photos=[],
  ),
  dict(
    stage_number=10, name="Bagubasa", name_hindi="बागुबासा",
    latitude=30.5050, longitude=79.0500, altitude_meters=4000,
    distance_from_prev_km=5.0, cumulative_km=106.0,
    stop_type="camp",
    description="Final camp before Homkund. All pilgrims must rest here and acclimatise. The night sky at this altitude is extraordinary.",
    significance="The last point where support facilities exist. Pilgrims are advised to rest fully here — the final approach to Homkund is steep and exposed. The administration medical team is stationed here.",
    photos=[],
  ),
  dict(
    stage_number=11, name="Homkund", name_hindi="होमकुंड",
    latitude=30.5250, longitude=79.0300, altitude_meters=4200,
    distance_from_prev_km=5.0, cumulative_km=111.0,
    stop_type="destination",
    description="The sacred destination — a glacial lake at 4200m surrounded by eternal snow. The Chausingha ram is ceremonially sent forward from here to reach Kailash. The most emotionally charged moment of the entire Yatra.",
    significance="Homkund is where Goddess Nanda's journey to Lord Shiva's abode at Kailash is symbolically completed. The final rituals — immersion of offerings in the glacial lake and the release of the Chausingha — bring many pilgrims to tears. The lake is surrounded by peaks over 6000m.",
    photos=[],
  ),
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