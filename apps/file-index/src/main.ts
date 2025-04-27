import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { AppModule } from 'src/app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    httpsOptions: {
      key: await readFile('./cert/key.pem'),
      cert: await readFile('./cert/cert.pem'),
    },
  });

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
