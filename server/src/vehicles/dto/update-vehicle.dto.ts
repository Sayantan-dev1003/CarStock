import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateVehicleDto } from './create-vehicle.dto';

/**
 * customerId is omitted — a vehicle cannot be transferred to a different
 * customer once created. All other fields are optional (PartialType).
 */
export class UpdateVehicleDto extends PartialType(
    OmitType(CreateVehicleDto, ['customerId'] as const),
) { }
