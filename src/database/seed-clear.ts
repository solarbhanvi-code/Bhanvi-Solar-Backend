/**
 * Deletes ALL products, categories, projects, services, testimonials and
 * FAQs. Intended for wiping demo/seed content before going to production,
 * or resetting a local dev database. Does NOT touch users, leads or settings.
 *
 * Run with: CONFIRM=yes npm run seed:clear
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { CategorySchema } from '../categories/schemas/category.schema';
import { ProductSchema } from '../products/schemas/product.schema';
import { ProjectSchema } from '../projects/schemas/project.schema';
import { ServiceSchema } from '../services/schemas/service.schema';
import { TestimonialSchema } from '../testimonials/schemas/testimonial.schema';
import { FaqSchema } from '../faqs/schemas/faq.schema';

const CategoryModel = mongoose.model('Category', CategorySchema);
const ProductModel = mongoose.model('Product', ProductSchema);
const ProjectModel = mongoose.model('Project', ProjectSchema);
const ServiceModel = mongoose.model('Service', ServiceSchema);
const TestimonialModel = mongoose.model('Testimonial', TestimonialSchema);
const FaqModel = mongoose.model('Faq', FaqSchema);

async function main() {
  if (process.env.CONFIRM !== 'yes') {
    console.error(
      'Refusing to run: this permanently deletes all products, categories, projects, services, testimonials and FAQs.\nRe-run with CONFIRM=yes npm run seed:clear to proceed.',
    );
    process.exit(1);
  }

  const uri =
    process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/bhanvi-solar';
  await mongoose.connect(uri);

  const results = await Promise.all([
    ProductModel.deleteMany({}),
    CategoryModel.deleteMany({}),
    ProjectModel.deleteMany({}),
    ServiceModel.deleteMany({}),
    TestimonialModel.deleteMany({}),
    FaqModel.deleteMany({}),
  ]);

  console.log(
    `Cleared: ${results[0].deletedCount} products, ${results[1].deletedCount} categories, ${results[2].deletedCount} projects, ${results[3].deletedCount} services, ${results[4].deletedCount} testimonials, ${results[5].deletedCount} faqs.`,
  );

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error('seed:clear failed:', error);
  process.exit(1);
});
