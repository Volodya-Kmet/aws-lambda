import { Controller, Get, Redirect } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('app')
@Controller()
export class AppController {
  @Get('')
  @Redirect(`/${process.env.STAGE}/api-docs`, 302)
  public async redirectToDocs(): Promise<void> {}

  @Get('/')
  @Redirect(`/${process.env.STAGE}/api-docs`, 302)
  public async redirectToDocsWithSlash(): Promise<void> {}
}
