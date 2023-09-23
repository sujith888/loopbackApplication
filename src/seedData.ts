import {MysqlDbDataSource} from './datasources';
import {Product} from './models';
import {ProductRepository} from './repositories';
export async function seedDatabase(productRepo: ProductRepository) {
  const sampleProducts: Partial<Product>[] = [
    {name: 'Samsung', price: 10000, quantity: 50},
    {name: 'I phone', price: 16000, quantity: 30},
    {name: 'Nokia', price: 70000, quantity: 75},
    {name: 'poco', price: 120000, quantity: 40},
    {name: 'realme', price: 900000, quantity: 60},
  ];
  await productRepo.createAll(sampleProducts);
}
export async function runSeeding() {
  const dataSource = new MysqlDbDataSource();
  const productDataSource = new ProductRepository(dataSource); // You might need to pass any necessary arguments her
  try {
    await seedDatabase(productDataSource);
    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding the database:', error);
  }
}
runSeeding();
