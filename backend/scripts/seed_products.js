import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '..', 'deepthi.db');

const products = [
  {
    name: 'Buffet Leaf Plates (10", 12", 14")',
    name_te: 'బఫెట్ ఆకు ప్లేట్లు',
    price: 6,
    unit: 'per piece',
    description: 'Eco-friendly natural leaf plates suitable for buffet meals and functions',
    description_te: 'విందులు మరియు కార్యక్రమాల కోసం సహజమైన పర్యావరణ హిత ఆకు ప్లేట్లు'
  },
  {
    name: 'Prasadam Round Doppalu (Small)',
    name_te: 'ప్రసాదం రౌండ్ దొప్పలు (చిన్న)',
    price: 4,
    unit: 'per piece',
    description: 'Small disposable round bowls used for prasadam serving',
    description_te: 'ప్రసాదం అందించడానికి ఉపయోగించే చిన్న గుండ్రని దొప్పలు'
  },
  {
    name: 'Prasadam Round Doppalu (Medium)',
    name_te: 'ప్రసాదం రౌండ్ దొప్పలు (మధ్యస్థ)',
    price: 6,
    unit: 'per piece',
    description: 'Medium-sized serving bowls for prasadam and snacks',
    description_te: 'ప్రసాదం మరియు అల్పాహారం కోసం మధ్యస్థ పరిమాణ దొప్పలు'
  },
  {
    name: 'Prasadam Round Doppalu (Large)',
    name_te: 'ప్రసాదం రౌండ్ దొప్పలు (పెద్ద)',
    price: 8,
    unit: 'per piece',
    description: 'Large-size bowls suitable for temple prasadam and sweets',
    description_te: 'దేవాలయ ప్రసాదం మరియు మిఠాయిల కోసం పెద్ద పరిమాణ దొప్పలు'
  },
  {
    name: 'Vistarakulu for Table Meals',
    name_te: 'విస్తరాకులు',
    price: 8,
    unit: 'per piece',
    description: 'Traditional full-size meal leaf plates used for table dining',
    description_te: 'టేబుల్ భోజనానికి ఉపయోగించే సంప్రదాయ పెద్ద ఆకులు'
  },
  {
    name: 'Organic Honey',
    name_te: 'సేంద్రియ తేనె',
    price: 215,
    unit: 'grams',
    description: 'Pure forest-collected organic honey',
    description_te: 'అడవిలో సేకరించిన స్వచ్ఛమైన సేంద్రియ తేనె'
  },
  {
    name: 'Earthen Tea Glasses',
    name_te: 'మట్టి టీ గ్లాసులు',
    price: 10,
    unit: 'per piece',
    description: 'Eco-friendly clay glasses used for serving tea',
    description_te: 'టీ వడ్డించడానికి ఉపయోగించే మట్టి గ్లాసులు'
  },
  {
    name: 'Water Glasses',
    name_te: 'నీటి గ్లాసులు',
    price: 12,
    unit: 'per piece',
    description: 'Reusable water glasses for home and events',
    description_te: 'ఇల్లు మరియు కార్యక్రమాల కోసం నీటి గ్లాసులు'
  },
  {
    name: 'Water Bottles',
    name_te: 'నీటి సీసాలు',
    price: 25,
    unit: 'per piece',
    description: 'Standard reusable water bottles',
    description_te: 'మళ్లీ ఉపయోగించగల సాధారణ నీటి సీసాలు'
  },
  {
    name: 'Organic Pulses',
    name_te: 'సేంద్రియ పప్పులు',
    price: 115,
    unit: 'kg',
    description: 'Premium-quality naturally grown pulses',
    description_te: 'సహజంగా పండించిన నాణ్యమైన పప్పులు'
  },
  {
    name: 'Millets',
    name_te: 'సిరిధాన్యాలు',
    price: 95,
    unit: 'kg',
    description: 'Healthy unpolished millet grains',
    description_te: 'ఆరోగ్యకరమైన మెరుగులు చేయని సిరిధాన్యాలు'
  },
  {
    name: 'Cold Pressed Oils',
    name_te: 'కోల్డ్ ప్రెస్ నూనెలు',
    price: 315,
    unit: 'liter',
    description: 'Natural cold-pressed edible oils',
    description_te: 'సహజ పద్ధతిలో తయారైన కోల్డ్ ప్రెస్ నూనెలు'
  }
];

async function seedProducts() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error connecting to database:', err);
        reject(err);
        return;
      }

      console.log('✓ Connected to database');

      db.serialize(() => {
        products.forEach((product, index) => {
          const productId = `p-${uuidv4()}`;
          const now = new Date().toISOString();

          db.run(
            `INSERT INTO products (id, name, name_te, price, unit, description, description_te, image, benefits, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              productId,
              product.name,
              product.name_te,
              product.price,
              product.unit,
              product.description,
              product.description_te,
              '/images/deepthi-logo.png',
              JSON.stringify(['100% Biodegradable', 'Handcrafted', 'Eco-safe']),
              now
            ],
            (err) => {
              if (err) {
                console.error(`Error adding product "${product.name}":`, err);
              } else {
                console.log(`✓ Added: ${product.name}`);
              }

              if (index === products.length - 1) {
                db.close((closeErr) => {
                  if (closeErr) {
                    console.error('Error closing database:', closeErr);
                    reject(closeErr);
                  } else {
                    console.log('\n✅ All products added successfully!');
                    resolve();
                  }
                });
              }
            }
          );
        });
      });
    });
  });
}

seedProducts().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
