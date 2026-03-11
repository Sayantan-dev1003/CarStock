import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
    Max,
    Min,
} from 'class-validator';

export class CreateVehicleDto {
    @ApiProperty({ example: 'Maruti', description: 'Vehicle make (manufacturer)' })
    @IsString()
    @IsNotEmpty()
    make: string;

    @ApiProperty({ example: 'Swift', description: 'Vehicle model name' })
    @IsString()
    @IsNotEmpty()
    model: string;

    @ApiProperty({ example: 2020, description: 'Year of manufacture', minimum: 1980 })
    @IsInt()
    @Min(1980)
    @Max(new Date().getFullYear() + 1)
    year: number;

    @ApiPropertyOptional({
        example: 'PETROL',
        description: 'Fuel type — PETROL, DIESEL, CNG, ELECTRIC, HYBRID',
    })
    @IsOptional()
    @IsString()
    fuelType?: string;

    @ApiPropertyOptional({
        example: 'MH12AB1234',
        description:
            'Indian registration number plate (e.g. MH12AB1234 or KA01AB1234). ' +
            'Supports up to 3 vehicles per customer.',
    })
    @IsOptional()
    @IsString()
    @Matches(/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/, {
        message:
            'Enter a valid Indian registration number (e.g. MH12AB1234)',
    })
    regNumber?: string;
}
