import { IsNotEmpty } from 'class-validator';

export class CreateCommentDTO {
  @IsNotEmpty()
  readonly body: string;
}
