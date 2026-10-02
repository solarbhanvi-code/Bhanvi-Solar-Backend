/**
 * Standalone database seed script — connects directly with Mongoose rather
 * than bootstrapping the full Nest app (no HTTP server, guards, etc. needed).
 *
 * Run with: npm run seed
 *
 * All catalogue/showcase content this script inserts is clearly labeled as
 * demo data in its own text (see NO FAKE PRODUCTION DATA in the README) and
 * is safe to delete via the admin panel, or in bulk with `npm run seed:clear`.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import * as argon2 from 'argon2';
import { randomBytes } from 'node:crypto';
import { UserSchema } from '../users/schemas/user.schema';
import { CategorySchema } from '../categories/schemas/category.schema';
import { ProductSchema } from '../products/schemas/product.schema';
import { ProjectSchema } from '../projects/schemas/project.schema';
import { ServiceSchema } from '../services/schemas/service.schema';
import { TestimonialSchema } from '../testimonials/schemas/testimonial.schema';
import { FaqSchema } from '../faqs/schemas/faq.schema';
import { SettingsSchema } from '../settings/schemas/settings.schema';
import { toSlug } from '../common/utils/slugify.util';
import { Availability, ProjectType, UserRole } from '../common/types/enums';

const UserModel = mongoose.model('User', UserSchema);
const CategoryModel = mongoose.model('Category', CategorySchema);
const ProductModel = mongoose.model('Product', ProductSchema);
const ProjectModel = mongoose.model('Project', ProjectSchema);
const ServiceModel = mongoose.model('Service', ServiceSchema);
const TestimonialModel = mongoose.model('Testimonial', TestimonialSchema);
const FaqModel = mongoose.model('Faq', FaqSchema);
const SettingsModel = mongoose.model('Settings', SettingsSchema);

const DEMO_TAG = '[Demo]';

async function seedAdmin() {
  const email = (
    process.env.ADMIN_EMAIL ?? 'admin@bhanvisolar.example'
  ).toLowerCase();
  const existing = await UserModel.findOne({ email }).exec();
  if (existing) {
    console.log(`Admin user already exists (${email}) — skipping.`);
    return;
  }

  // Nullish coalescing alone would keep an *empty* ADMIN_PASSWORD="" from
  // .env as a real (blank) password, so explicitly treat blank as unset.
  const envPassword = process.env.ADMIN_PASSWORD?.trim();
  const usingGeneratedPassword = !envPassword;
  const password = usingGeneratedPassword
    ? randomBytes(9).toString('base64url')
    : envPassword;
  const hash = await argon2.hash(password);
  await UserModel.create({
    name: process.env.ADMIN_NAME ?? 'Bhanvi Solar Admin',
    email,
    password: hash,
    role: UserRole.ADMIN,
  });

  console.log('Created initial admin user:');
  console.log(`  email:    ${email}`);
  if (usingGeneratedPassword) {
    console.log(
      `  password: ${password}  (generated — save this now, it will not be shown again)`,
    );
  } else {
    console.log('  password: (from ADMIN_PASSWORD env var)');
  }
}

async function seedCategories() {
  const names = [
    'Solar Panels',
    'Solar Batteries',
    'Inverters',
    'Solar Lights',
    'Solar Accessories',
    'Other',
  ];
  const categories: Record<string, mongoose.Types.ObjectId> = {};
  for (const [index, name] of names.entries()) {
    const slug = toSlug(name);
    const doc = await CategoryModel.findOneAndUpdate(
      { slug },
      { $setOnInsert: { name, slug, order: index } },
      { upsert: true, returnDocument: 'after' },
    ).exec();
    categories[name] = doc._id;
  }
  console.log(`Seeded ${names.length} categories.`);
  return categories;
}

async function seedProducts(
  categories: Record<string, mongoose.Types.ObjectId>,
) {
  const count = await ProductModel.countDocuments().exec();
  if (count > 0) {
    console.log('Products already exist — skipping product seed.');
    return;
  }

  const products = [
    {
      name: '550W Monocrystalline Solar Panel',
      category: categories['Solar Panels'],
      shortDescription: `${DEMO_TAG} High-efficiency mono PERC panel for residential and commercial rooftops.`,
      description: `${DEMO_TAG} A high-output monocrystalline PERC solar panel suited for residential and commercial rooftop installations. Sample catalogue entry for development/preview purposes — replace with verified manufacturer data before launch.`,
      price: 14500,
      brand: 'Demo Manufacturer Co.',
      specifications: [
        { key: 'Power', value: '550W' },
        { key: 'Efficiency', value: '21.3%' },
        { key: 'Dimensions', value: '2278 x 1134 x 35 mm' },
        { key: 'Weight', value: '27.5 kg' },
        { key: 'Voltage', value: '41.7V' },
        { key: 'Technology', value: 'Monocrystalline PERC' },
        { key: 'Warranty', value: '25-year performance / 12-year product' },
      ],
      features: [
        'High module efficiency',
        'PID resistant',
        'Low light performance',
        'Anti-reflective glass',
      ],
      warranty: '25-year performance / 12-year product warranty',
      applications: [
        'Residential rooftop',
        'Commercial rooftop',
        'Ground mount',
      ],
      featured: true,
    },
    {
      name: '450W Monocrystalline Solar Panel',
      category: categories['Solar Panels'],
      shortDescription: `${DEMO_TAG} Compact mono panel ideal for space-constrained rooftops.`,
      description: `${DEMO_TAG} A compact, efficient monocrystalline panel for space-constrained rooftops. Sample catalogue entry for development/preview purposes.`,
      price: 11800,
      brand: 'Demo Manufacturer Co.',
      specifications: [
        { key: 'Power', value: '450W' },
        { key: 'Efficiency', value: '20.9%' },
        { key: 'Dimensions', value: '2094 x 1038 x 35 mm' },
        { key: 'Weight', value: '23.5 kg' },
        { key: 'Voltage', value: '38.5V' },
        { key: 'Technology', value: 'Monocrystalline PERC' },
        { key: 'Warranty', value: '25-year performance / 12-year product' },
      ],
      features: [
        'Compact form factor',
        'High module efficiency',
        'Durable aluminium frame',
      ],
      warranty: '25-year performance / 12-year product warranty',
      applications: ['Residential rooftop', 'Small commercial installations'],
      featured: true,
    },
    {
      name: '5.12 kWh Lithium Battery',
      category: categories['Solar Batteries'],
      shortDescription: `${DEMO_TAG} Stackable LiFePO4 battery for home solar storage.`,
      description: `${DEMO_TAG} A stackable lithium iron phosphate (LiFePO4) battery module for home energy storage. Sample catalogue entry for development/preview purposes.`,
      price: 145000,
      brand: 'Demo Power Storage',
      specifications: [
        { key: 'Capacity', value: '5.12 kWh' },
        { key: 'Voltage', value: '51.2V' },
        { key: 'Technology', value: 'LiFePO4' },
        { key: 'Cycle Life', value: '6000+ cycles @ 80% DoD' },
        { key: 'Weight', value: '48 kg' },
        { key: 'Warranty', value: '10 years' },
      ],
      features: ['Stackable design', 'Built-in BMS', 'Wall or floor mount'],
      warranty: '10-year warranty',
      applications: ['Residential backup power', 'Off-grid systems'],
      featured: true,
    },
    {
      name: '10 kWh Lithium Battery',
      category: categories['Solar Batteries'],
      shortDescription: `${DEMO_TAG} Higher-capacity battery for whole-home backup.`,
      description: `${DEMO_TAG} A higher-capacity lithium battery for whole-home backup applications. Sample catalogue entry for development/preview purposes.`,
      brand: 'Demo Power Storage',
      specifications: [
        { key: 'Capacity', value: '10 kWh' },
        { key: 'Voltage', value: '51.2V' },
        { key: 'Technology', value: 'LiFePO4' },
        { key: 'Cycle Life', value: '6000+ cycles @ 80% DoD' },
        { key: 'Weight', value: '92 kg' },
        { key: 'Warranty', value: '10 years' },
      ],
      features: [
        'Whole-home backup capacity',
        'Built-in BMS',
        'App monitoring ready',
      ],
      warranty: '10-year warranty',
      applications: ['Residential backup power', 'Small commercial backup'],
      featured: false,
    },
    {
      name: '5kW Hybrid Solar Inverter',
      category: categories['Inverters'],
      shortDescription: `${DEMO_TAG} Hybrid inverter supporting grid-tied and battery backup operation.`,
      description: `${DEMO_TAG} A hybrid inverter that supports grid-tied operation with battery backup. Sample catalogue entry for development/preview purposes.`,
      price: 95000,
      brand: 'Demo Inverter Works',
      specifications: [
        { key: 'Rated Power', value: '5 kW' },
        { key: 'Type', value: 'Hybrid (Grid-tied + Battery)' },
        { key: 'MPPT Trackers', value: '2' },
        { key: 'Peak Efficiency', value: '97.6%' },
        { key: 'Warranty', value: '5 years' },
      ],
      features: ['Dual MPPT', 'Battery-ready', 'Wi-Fi monitoring'],
      warranty: '5-year warranty',
      applications: ['Residential', 'Small commercial'],
      featured: true,
    },
    {
      name: '3kW On-Grid Solar Inverter',
      category: categories['Inverters'],
      shortDescription: `${DEMO_TAG} Compact on-grid inverter for small residential systems.`,
      description: `${DEMO_TAG} A compact on-grid inverter suited to small residential solar systems. Sample catalogue entry for development/preview purposes.`,
      price: 42000,
      brand: 'Demo Inverter Works',
      specifications: [
        { key: 'Rated Power', value: '3 kW' },
        { key: 'Type', value: 'On-Grid' },
        { key: 'MPPT Trackers', value: '1' },
        { key: 'Peak Efficiency', value: '97.1%' },
        { key: 'Warranty', value: '5 years' },
      ],
      features: ['Compact design', 'Wi-Fi monitoring', 'IP65 rated enclosure'],
      warranty: '5-year warranty',
      applications: ['Residential'],
      featured: false,
    },
    {
      name: 'Solar Garden Light 12W',
      category: categories['Solar Lights'],
      shortDescription: `${DEMO_TAG} Motion-sensing solar garden light for pathways and driveways.`,
      description: `${DEMO_TAG} A motion-sensing solar-powered garden light for pathways and driveways. Sample catalogue entry for development/preview purposes.`,
      price: 1499,
      brand: 'Demo Lighting Co.',
      specifications: [
        { key: 'Power', value: '12W' },
        { key: 'Battery', value: '2000mAh Li-ion' },
        { key: 'IP Rating', value: 'IP65' },
        { key: 'Sensor', value: 'PIR Motion' },
        { key: 'Warranty', value: '1 year' },
      ],
      features: [
        'Motion sensor',
        'Weatherproof',
        'Dusk-to-dawn auto operation',
      ],
      warranty: '1-year warranty',
      applications: ['Gardens', 'Driveways', 'Pathways'],
      featured: false,
    },
    {
      name: 'Solar Street Light 60W',
      category: categories['Solar Lights'],
      shortDescription: `${DEMO_TAG} All-in-one solar street light for roads and compounds.`,
      description: `${DEMO_TAG} An all-in-one solar street light with an integrated panel, battery and LED head. Sample catalogue entry for development/preview purposes.`,
      price: 8500,
      brand: 'Demo Lighting Co.',
      specifications: [
        { key: 'Power', value: '60W' },
        { key: 'Battery', value: '30Ah LiFePO4' },
        { key: 'IP Rating', value: 'IP66' },
        { key: 'Autonomy', value: '3 cloudy days' },
        { key: 'Warranty', value: '2 years' },
      ],
      features: [
        'All-in-one design',
        'Automatic dusk-to-dawn',
        'Remote control option',
      ],
      warranty: '2-year warranty',
      applications: ['Streets', 'Compounds', 'Parking areas'],
      featured: true,
    },
    {
      name: 'MC4 Connector Pair',
      category: categories['Solar Accessories'],
      shortDescription: `${DEMO_TAG} Weatherproof MC4 connector pair for panel wiring.`,
      description: `${DEMO_TAG} A weatherproof MC4 connector pair used for solar panel wiring. Sample catalogue entry for development/preview purposes.`,
      price: 199,
      brand: 'Demo Accessories',
      specifications: [
        { key: 'Rated Current', value: '30A' },
        { key: 'Rated Voltage', value: '1500V DC' },
        { key: 'IP Rating', value: 'IP68' },
      ],
      features: ['Weatherproof', 'Tool-free locking'],
      warranty: '1-year warranty',
      applications: ['Panel-to-panel wiring', 'Panel-to-inverter wiring'],
      featured: false,
    },
    {
      name: 'Roof Mounting Structure Kit',
      category: categories['Solar Accessories'],
      shortDescription: `${DEMO_TAG} Galvanized mounting structure kit for pitched or flat roofs.`,
      description: `${DEMO_TAG} A galvanized steel mounting structure kit suitable for pitched and flat roof installations. Sample catalogue entry for development/preview purposes.`,
      brand: 'Demo Accessories',
      specifications: [
        { key: 'Material', value: 'Hot-dip galvanized steel' },
        { key: 'Wind Load Rating', value: 'Up to 150 km/h' },
        { key: 'Compatible Panels', value: 'Up to 4 panels per kit' },
      ],
      features: ['Corrosion resistant', 'Adjustable tilt angle'],
      warranty: '10-year structural warranty',
      applications: ['Pitched roofs', 'Flat roofs'],
      availability: Availability.PRE_ORDER,
      featured: false,
    },
  ];

  for (const product of products) {
    const slug = toSlug(product.name);
    await ProductModel.create({ ...product, slug });
  }
  console.log(`Seeded ${products.length} demo products.`);
}

async function seedServices() {
  const count = await ServiceModel.countDocuments().exec();
  if (count > 0) {
    console.log('Services already exist — skipping service seed.');
    return;
  }

  const services = [
    {
      name: 'Residential Solar',
      shortDescription: 'Rooftop solar systems designed for homes.',
      description:
        'Custom-designed rooftop solar systems for homes, sized to your household consumption and roof profile, with transparent quotes and professional installation.',
      icon: 'Home',
      highlights: [
        'Free site assessment',
        'Custom system sizing',
        'Net-metering assistance',
      ],
      order: 0,
    },
    {
      name: 'Commercial Solar',
      shortDescription:
        'Solar systems for businesses and commercial buildings.',
      description:
        'Solar systems designed for offices, factories and commercial buildings looking to reduce operating costs and energy dependence.',
      icon: 'Building2',
      highlights: [
        'Load analysis',
        'Scalable system design',
        'ROI-focused planning',
      ],
      order: 1,
    },
    {
      name: 'Solar Installation',
      shortDescription: 'End-to-end professional installation services.',
      description:
        'Certified installation teams handle mounting, wiring, inverter setup and commissioning, following safety and quality best practices.',
      icon: 'Wrench',
      highlights: [
        'Certified installers',
        'Quality-checked wiring',
        'Post-install testing',
      ],
      order: 2,
    },
    {
      name: 'Solar Maintenance',
      shortDescription: 'Ongoing maintenance to keep systems performing.',
      description:
        'Periodic cleaning, inspection and performance checks to help your solar system continue operating efficiently over its lifetime.',
      icon: 'ShieldCheck',
      highlights: [
        'Panel cleaning',
        'Performance inspection',
        'Fault diagnostics',
      ],
      order: 3,
    },
    {
      name: 'Consultation',
      shortDescription: 'Expert guidance before you invest in solar.',
      description:
        'One-on-one consultation to help you understand system sizing, expected costs, savings potential and financing options before you commit.',
      icon: 'MessageCircle',
      highlights: [
        'No-obligation consultation',
        'Site-specific guidance',
        'Clear cost breakdown',
      ],
      order: 4,
    },
    {
      name: 'System Upgrades',
      shortDescription: 'Expand or upgrade an existing solar installation.',
      description:
        'Add panels, upgrade inverters or add battery storage to an existing solar installation as your energy needs grow.',
      icon: 'TrendingUp',
      highlights: [
        'Battery retrofits',
        'Capacity expansion',
        'Inverter upgrades',
      ],
      order: 5,
    },
  ];

  for (const service of services) {
    const slug = toSlug(service.name);
    await ServiceModel.create({ ...service, slug });
  }
  console.log(`Seeded ${services.length} services.`);
}

async function seedProjects() {
  const count = await ProjectModel.countDocuments().exec();
  if (count > 0) {
    console.log('Projects already exist — skipping project seed.');
    return;
  }

  const projects = [
    {
      name: `${DEMO_TAG} Residential Rooftop Installation`,
      location: 'Sample City',
      capacity: '5 kW',
      projectType: ProjectType.RESIDENTIAL,
      description:
        'This is placeholder demo content for development/preview purposes only. Replace with a real completed project (with real photos and details) before launching the site.',
      installationDate: new Date('2025-01-15'),
      images: [],
      featured: true,
    },
    {
      name: `${DEMO_TAG} Commercial Office Rooftop System`,
      location: 'Sample Town',
      capacity: '25 kW',
      projectType: ProjectType.COMMERCIAL,
      description:
        'This is placeholder demo content for development/preview purposes only. Replace with a real completed project (with real photos and details) before launching the site.',
      installationDate: new Date('2025-03-20'),
      images: [],
      featured: true,
    },
    {
      name: `${DEMO_TAG} Industrial Ground-Mount System`,
      location: 'Sample Industrial Area',
      capacity: '100 kW',
      projectType: ProjectType.INDUSTRIAL,
      description:
        'This is placeholder demo content for development/preview purposes only. Replace with a real completed project (with real photos and details) before launching the site.',
      installationDate: new Date('2025-05-10'),
      images: [],
      featured: false,
    },
  ];

  for (const project of projects) {
    const slug = toSlug(project.name);
    await ProjectModel.create({ ...project, slug });
  }
  console.log(`Seeded ${projects.length} demo projects.`);
}

async function seedTestimonials() {
  const count = await TestimonialModel.countDocuments().exec();
  if (count > 0) {
    console.log('Testimonials already exist — skipping testimonial seed.');
    return;
  }

  const testimonials = [
    {
      name: `${DEMO_TAG} Sample Customer A`,
      location: 'Sample City',
      message:
        'This is a sample testimonial for development/preview purposes only. Replace with real, verifiable customer feedback before launching the site.',
      rating: 5,
      published: true,
      order: 0,
    },
    {
      name: `${DEMO_TAG} Sample Customer B`,
      location: 'Sample Town',
      message:
        'This is a sample testimonial for development/preview purposes only. Replace with real, verifiable customer feedback before launching the site.',
      rating: 4,
      published: true,
      order: 1,
    },
  ];

  for (const testimonial of testimonials) {
    await TestimonialModel.create(testimonial);
  }
  console.log(`Seeded ${testimonials.length} demo testimonials.`);
}

async function seedFaqs() {
  const count = await FaqModel.countDocuments().exec();
  if (count > 0) {
    console.log('FAQs already exist — skipping FAQ seed.');
    return;
  }

  const faqs = [
    {
      question: 'How long does a typical residential solar installation take?',
      answer:
        'A typical residential rooftop installation takes a few days on-site once the system design and paperwork are finalized, though exact timelines depend on system size and site conditions.',
      category: 'Installation',
      order: 0,
    },
    {
      question: 'How much maintenance does a solar system need?',
      answer:
        'Solar systems generally require minimal maintenance — periodic panel cleaning and an occasional performance check are usually enough to keep a system running efficiently.',
      category: 'Maintenance',
      order: 1,
    },
    {
      question: 'What happens on a cloudy or rainy day?',
      answer:
        'Solar panels still generate some electricity in cloudy conditions, though output is lower than on clear days. Systems are typically sized with this variability in mind.',
      category: 'General',
      order: 2,
    },
    {
      question: 'Do I need battery storage with my solar system?',
      answer:
        'Battery storage is optional. Many grid-tied systems operate without batteries, exporting excess power to the grid. Battery storage adds backup power during outages, at additional cost.',
      category: 'General',
      order: 3,
    },
    {
      question: 'How is the right system size determined?',
      answer:
        'System size is typically based on your average electricity consumption, available roof area and roof orientation. Use the solar calculator for an initial estimate, then request a detailed site assessment.',
      category: 'General',
      order: 4,
    },
    {
      question: 'What warranty applies to solar panels and inverters?',
      answer:
        'Warranty terms vary by product and manufacturer. Product-specific warranty details are listed on each product page under Specifications.',
      category: 'Warranty',
      order: 5,
    },
  ];

  for (const faq of faqs) {
    await FaqModel.create(faq);
  }
  console.log(`Seeded ${faqs.length} FAQs.`);
}

async function seedSettings() {
  const count = await SettingsModel.countDocuments().exec();
  if (count > 0) {
    console.log('Settings document already exists — leaving as-is.');
    return;
  }

  await SettingsModel.create({
    companyName: 'Bhanvi Solar',
    tagline: 'Power Your Future With Solar Energy',
    phone: '+91-00000-00000',
    whatsapp: '910000000000',
    email: 'info@bhanvisolar.example',
    address: 'Configure your business address in Admin -> Settings',
    businessHours: 'Mon - Sat: 9:00 AM - 6:00 PM',
    heroTitle: 'Power Your Future With Solar Energy',
    heroSubtitle: 'Professional solar solutions for homes and businesses.',
    aboutText:
      'Bhanvi Solar designs, supplies and installs solar energy systems for homes and businesses. Update this description from Admin -> Settings.',
    footerText: `${new Date().getFullYear()} Bhanvi Solar. Configure this footer text in Admin -> Settings.`,
    defaultSEO: {
      title: 'Bhanvi Solar - Solar Panels, Installation & Solar Products',
      description:
        'Bhanvi Solar provides solar panels, batteries, inverters and professional solar installation services for homes and businesses.',
      keywords: [
        'solar',
        'solar panels',
        'solar installation',
        'solar batteries',
        'inverters',
      ],
    },
  });
  console.log(
    'Seeded default settings document (placeholder company info — please update in Admin -> Settings).',
  );
}

async function main() {
  const uri =
    process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/bhanvi-solar';
  console.log(
    `Connecting to MongoDB at ${uri.replace(/\/\/.*@/, '//***:***@')} ...`,
  );
  await mongoose.connect(uri);
  console.log('Connected. Seeding...');

  await seedAdmin();
  const categories = await seedCategories();
  await seedProducts(categories);
  await seedServices();
  await seedProjects();
  await seedTestimonials();
  await seedFaqs();
  await seedSettings();

  console.log('\nSeed complete.');
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
