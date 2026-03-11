import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsIn,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    Matches,
    Max,
    MaxLength,
    Min,
    MinLength,
} from 'class-validator';

const CURRENT_YEAR = new Date().getFullYear();

export class CreateVehicleDto {
    @ApiProperty({
        example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        description: 'UUID of the customer who owns this vehicle',
    })
    @IsUUID()
    customerId: string;

    @ApiProperty({
        example: 'Maruti Suzuki',
        description: 'Vehicle make / manufacturer',
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    make: string;

    @ApiProperty({
        example: 'Swift',
        description: 'Vehicle model name',
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    model: string;

    @ApiProperty({
        example: 2021,
        description: `Year of manufacture (1990 – ${CURRENT_YEAR})`,
        minimum: 1990,
    })
    @IsInt()
    @Min(1990, { message: `Year must be between 1990 and ${CURRENT_YEAR}` })
    @Max(CURRENT_YEAR, { message: `Year must be between 1990 and ${CURRENT_YEAR}` })
    year: number;

    @ApiPropertyOptional({
        example: 'PETROL',
        description: 'Fuel type',
        enum: ['PETROL', 'DIESEL', 'CNG', 'ELECTRIC', 'HYBRID'],
    })
    @IsOptional()
    @IsString()
    @IsIn(['PETROL', 'DIESEL', 'CNG', 'ELECTRIC', 'HYBRID'])
    fuelType?: string;

    @ApiPropertyOptional({
        example: 'MH12AB1234',
        description:
            'Indian vehicle registration / number plate. ' +
            'Supports multiple vehicles per customer — no per-customer cap.',
        maxLength: 15,
    })
    @IsOptional()
    @IsString()
    @MaxLength(15)
    @Matches(/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/, {
        message: 'Enter a valid Indian registration number (e.g. MH12AB1234)',
    })
    regNumber?: string;
}
