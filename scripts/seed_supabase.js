const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key to bypass RLS for seeding

if (!url || !key) {
  console.error("Missing Supabase credentials in .env file. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.");
  process.exit(1);
}

console.log("Connecting to Supabase for seeding at:", url);
const supabase = createClient(url, key);

const products = [
  {
    name: 'Amuraa Puffer Tote Bag',
    category: 'Puffer Tote Bags',
    fabric: 'Pink Leopard Print',
    price: 75,
    compare_at_price: 90,
    stock: 8,
    images: ['/images/products/tote_pink_leopard_1.jpg', '/images/products/tote_pink_leopard_2.jpg'],
    description: 'A spacious, cloud-soft quilted tote bag featuring a bold pink leopard print. Perfect for daily essentials, laptops, and market runs. Features a comfortable padded shoulder strap and a convenient inner zipper pocket.',
    dimensions: '14" H x 16" W x 4" D. Strap drop: 11"',
    care_instructions: 'Hand wash cold with mild detergent. Lay flat to dry. Do not iron or bleach.',
    is_featured: true,
    status: 'active',
    slug: 'amuraa-puffer-tote-bag-pink-leopard'
  },
  {
    name: 'Amuraa Puffer Tote Bag - Mauve Check',
    category: 'Puffer Tote Bags',
    fabric: 'Mauve Check',
    price: 75,
    compare_at_price: 0,
    stock: 5,
    images: ['/images/products/tote_mauve_check_1.jpg', '/images/products/tote_mauve_check_2.jpg'],
    description: 'A cozy quilted puffer tote in a charming mauve check pattern. Offers light cushioning for your belongings and adds a stylish craft detail to any outfit.',
    dimensions: '14" H x 16" W x 4" D. Strap drop: 11"',
    care_instructions: 'Hand wash cold. Lay flat to dry.',
    is_featured: true,
    status: 'active',
    slug: 'amuraa-puffer-tote-bag-mauve-check'
  },
  {
    name: 'Amuraa Puffer Tote Bag - Pink Polka Dot',
    category: 'Puffer Tote Bags',
    fabric: 'Pink Polka Dot',
    price: 75,
    compare_at_price: 0,
    stock: 3,
    images: ['/images/products/tote_pink_polka_1.jpg'],
    description: 'Playful and retro, this pink polka dot puffer tote brings a joyful vibe. Crafted with thick quilting and soft premium lining.',
    dimensions: '14" H x 16" W x 4" D. Strap drop: 11"',
    care_instructions: 'Hand wash cold. Lay flat to dry.',
    is_featured: false,
    status: 'active',
    slug: 'amuraa-puffer-tote-bag-pink-polka-dot'
  },
  {
    name: 'Amuraa Puffer Tote Bag - Pink Gingham',
    category: 'Puffer Tote Bags',
    fabric: 'Pink Gingham',
    price: 75,
    compare_at_price: 0,
    stock: 6,
    images: ['/images/products/tote_pink_gingham_1.jpg'],
    description: 'Classic cottage-core styling meets puffer function. Made from a lovely soft pink and cream gingham fabric, fully lined with pink pastel fabric.',
    dimensions: '14" H x 16" W x 4" D. Strap drop: 11"',
    care_instructions: 'Hand wash cold. Lay flat to dry.',
    is_featured: false,
    status: 'active',
    slug: 'amuraa-puffer-tote-bag-pink-gingham'
  },
  {
    name: 'Heart Print Mini Bag',
    category: 'Heart Print Mini Bags',
    fabric: 'Sweetheart Print',
    price: 58,
    compare_at_price: 70,
    stock: 4,
    images: ['/images/products/mini_heart_1.jpg', '/images/products/mini_heart_2.jpg'],
    description: 'An adorable mini bag detailed with heart-printed fabric and a feminine ruffle strap design. Fits your phone, keys, and lip gloss. Zippered top closures keep your essentials safe.',
    dimensions: '7" H x 9" W x 2" D. Strap drop: 8"',
    care_instructions: 'Hand wash cold. Spot clean ruffles carefully. Dry flat.',
    is_featured: true,
    status: 'active',
    slug: 'heart-print-mini-bag'
  },
  {
    name: 'Striped Ruffle-Strap Shoulder Bag',
    category: 'Striped Ruffle-Strap Shoulder Bags',
    fabric: 'Blue & White Stripes',
    price: 62,
    compare_at_price: 0,
    stock: 7,
    images: ['/images/products/shoulder_striped_1.jpg', '/images/products/shoulder_striped_2.jpg'],
    description: 'A refreshing blue and white stripe shoulder bag with playful ruffled strap details. Perfectly quilted for structure and softness. A dreamy addition to summer strolls.',
    dimensions: '8" H x 11" W x 3" D. Strap drop: 10"',
    care_instructions: 'Hand wash cold. Lay flat to dry.',
    is_featured: true,
    status: 'active',
    slug: 'striped-ruffle-strap-shoulder-bag'
  },
  {
    name: 'Amuraa AirPod Bag / Pouch - Heart',
    category: 'AirPod Bags / Small Pouches',
    fabric: 'Heart Print',
    price: 24,
    compare_at_price: 0,
    stock: 12,
    images: ['/images/products/pouch_heart_1.jpg'],
    description: 'Keep your AirPods or tiny items secure in this quilted mini pouch. Includes a small lobster clasp to hook onto your tote bag or belt loop.',
    dimensions: '4" H x 3.5" W x 1" D',
    care_instructions: 'Spot clean with a damp cloth.',
    is_featured: false,
    status: 'active',
    slug: 'amuraa-airpod-bag-pouch-heart'
  },
  {
    name: 'Amuraa AirPod Bag / Pouch - Leopard',
    category: 'AirPod Bags / Small Pouches',
    fabric: 'Leopard Print',
    price: 24,
    compare_at_price: 0,
    stock: 9,
    images: ['/images/products/pouch_leopard_1.jpg'],
    description: 'A fierce mini accessory! Perfect size for AirPods, keys, or spare change. Softly quilted with premium zip closure.',
    dimensions: '4" H x 3.5" W x 1" D',
    care_instructions: 'Spot clean with a damp cloth.',
    is_featured: false,
    status: 'active',
    slug: 'amuraa-airpod-bag-pouch-leopard'
  },
  {
    name: 'Handmade Makeup Pouch - Floral Grey',
    category: 'Makeup Pouches',
    fabric: 'Floral Grey',
    price: 32,
    compare_at_price: 0,
    stock: 10,
    images: ['/images/products/makeup_floral_grey_1.jpg'],
    description: 'A stylish cosmetic bag in muted grey floral print. Generous flat-bottom design stands upright, making it easy to access your makeup. Quilted layer protects glass bottles.',
    dimensions: '5.5" H x 8" W x 4" D',
    care_instructions: 'Machine wash gentle cold in a mesh laundry bag. Lay flat to dry.',
    is_featured: false,
    status: 'active',
    slug: 'handmade-makeup-pouch-floral-grey'
  },
  {
    name: 'Handmade Makeup Pouch - Leaf Print',
    category: 'Makeup Pouches',
    fabric: 'Leaf Print',
    price: 32,
    compare_at_price: 0,
    stock: 6,
    images: ['/images/products/makeup_leaf_1.jpg'],
    description: 'Bring nature to your vanity with this green leaf print makeup pouch. Offers ample room for brushes, moisturizers, and cosmetic tools.',
    dimensions: '5.5" H x 8" W x 4" D',
    care_instructions: 'Hand wash cold. Lay flat to dry.',
    is_featured: false,
    status: 'active',
    slug: 'handmade-makeup-pouch-leaf-print'
  },
  {
    name: 'Handmade Makeup Pouch - Blue Gingham',
    category: 'Makeup Pouches',
    fabric: 'Blue Gingham',
    price: 32,
    compare_at_price: 0,
    stock: 8,
    images: ['/images/products/makeup_blue_gingham_1.jpg'],
    description: 'Cute and highly functional. Blue and white gingham quilted pouch. Keeps your skincare and makeup organized in style.',
    dimensions: '5.5" H x 8" W x 4" D',
    care_instructions: 'Hand wash cold. Lay flat to dry.',
    is_featured: false,
    status: 'active',
    slug: 'handmade-makeup-pouch-blue-gingham'
  },
  {
    name: 'Indigo Block-Print Organizer Pouch',
    category: 'Indigo Block-Print Organizer Pouches',
    fabric: 'Traditional Indigo Block-Print',
    price: 38,
    compare_at_price: 45,
    stock: 11,
    images: ['/images/products/organizer_indigo_1.jpg', '/images/products/organizer_indigo_2.jpg'],
    description: 'A gorgeous multi-purpose organizer quilted from traditional indigo block-printed cotton fabric. Features a secure zipper and multiple pockets inside to keep passports, chargers, or stationery neat.',
    dimensions: '6.5" H x 9.5" W x 2" D',
    care_instructions: 'Wash separately in cold water as indigo dye may bleed slightly in first wash. Lay flat to dry.',
    is_featured: true,
    status: 'active',
    slug: 'indigo-block-print-organizer-pouch'
  }
];

async function run() {
  try {
    // 1. Clear existing products if any
    console.log("Checking products table...");
    const { error: clearError } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (clearError) {
      if (clearError.message && clearError.message.includes("images")) {
        console.error("\n❌ ERROR: The 'images' column is missing from your 'products' table.");
        console.error("Please run the following SQL command in your Supabase SQL Editor first:\n");
        console.error("   ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}'::text[];\n");
        process.exit(1);
      }
      console.error("Error clearing products table:", clearError);
      process.exit(1);
    }
    
    console.log("Seeding products...");
    const { data, error } = await supabase.from('products').insert(products).select();
    
    if (error) {
      console.error("Error inserting products:", error);
      process.exit(1);
    }
    
    console.log(`✅ Success! Seeded ${data.length} products into Supabase.`);
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

run();
