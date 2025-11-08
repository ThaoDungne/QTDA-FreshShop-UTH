import { SeedService } from './seed.service';

export class SeedCommand {
  constructor(private readonly seedService: SeedService) {}

  async run(): Promise<void> {
    try {
      await this.seedService.seedDatabase();
      console.log('🎉 Database seeding completed successfully!');
      process.exit(0);
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      process.exit(1);
    }
  }
}
