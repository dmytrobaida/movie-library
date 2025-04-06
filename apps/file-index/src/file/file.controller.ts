import {
  Controller,
  Get,
  Header,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { MediaService } from 'src/shared/services/media.service';
import { FilePrefix } from 'src/shared/types/prefixes';

@Controller(FilePrefix)
export class FileController {
  constructor(private readonly mediaService: MediaService) {}

  @Get(':id.strm')
  @Header('content-type', 'text/plain')
  async strmFile(@Param('id') id: string) {
    const mediaUrl = await this.mediaService.getMediaUrl(id);

    if (!mediaUrl) {
      throw new NotFoundException(`Media URL not found for id: ${id}`);
    }

    return mediaUrl.url;
  }
}
