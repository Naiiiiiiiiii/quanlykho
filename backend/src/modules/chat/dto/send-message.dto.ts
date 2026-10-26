import { IsNotEmpty, IsString } from 'class-validator';

export class SendMessageDto {
  @IsNotEmpty({ message: 'Nội dung không hợp lệ, yêu cầu chỉnh sửa' })
  @IsString({ message: 'Nội dung không hợp lệ, yêu cầu chỉnh sửa' })
  content!: string;
}
