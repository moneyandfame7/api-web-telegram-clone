import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  // const config = app.get<ConfigService<AppEnvironmentConfig>>(ConfigService)

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true
      // exceptionFactory: (validationErrors: ValidationError[] = []) => {
      //   return new BadRequestException(
      //     validationErrors.map(error => ({
      //       field: error.property,
      //       error: Object.values(error.constraints ?? {}).join(', ')
      //     }))
      //   )
      // }
    })
  )

  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     exceptionFactory: errors => {
  //       const result = errors.map(error => ({
  //         // property: error.property,
  //         // message: error.constraints?.[Object.keys(error.constraints)[0]]

  //         [error.property]: error.constraints?.[Object.keys(error.constraints)[0]]
  //       }))
  //       return new BadRequestException(result)
  //     }
  //     // stopAtFirstError: true
  //   })
  // )

  console.log('HOST: 3000')
  app.enableCors({
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    origin: process.env.CLIENT_URL
  })

  await app.listen(3000)
}
bootstrap()
