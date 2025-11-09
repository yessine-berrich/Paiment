import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors(); // permet les requêtes de clients externes
  app.use((req, res, next) => {
    res.header('Content-Type', 'application/json');
    next();
  });

  await app.listen(Number(process.env.PORT));
}
bootstrap();
