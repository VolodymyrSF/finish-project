import { TypeOrmModule } from '@nestjs/typeorm';

TypeOrmModule.forRootAsync({
  useFactory: () => ({
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    entities: [__dirname + '/../**/*.entity.{js,ts}'],
    synchronize: true,
  }),
})
