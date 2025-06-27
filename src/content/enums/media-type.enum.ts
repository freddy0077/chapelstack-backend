import { registerEnumType } from '@nestjs/graphql';

export enum MediaType {
  AUDIO = 'AUDIO',
  AUDIO_FILE = 'AUDIO_FILE',
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
  DOCUMENT = 'DOCUMENT',
  DOCUMENT_PDF = 'DOCUMENT_PDF',
  DOCUMENT_WORD = 'DOCUMENT_WORD',
  SLIDESHOW = 'SLIDESHOW',
  OTHER = 'OTHER',
}

registerEnumType(MediaType, {
  name: 'MediaType',
  description: 'Type of media item',
});
