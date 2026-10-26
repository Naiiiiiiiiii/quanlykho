import { IsOptional, IsBoolean } from 'class-validator';

export class RunBackupDto {
  @IsOptional()
  @IsBoolean()
  simulateDiskError?: boolean;

  @IsOptional()
  @IsBoolean()
  simulateLogError?: boolean;
}
