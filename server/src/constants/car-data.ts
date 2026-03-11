/**
 * CAR_DATA — static reference of popular Indian car makes and their models.
 *
 * Used by:
 *  - Backend: GET /vehicles/car-data endpoint (returned as JSON)
 *  - Frontend: React Native app caches this locally to populate make/model pickers
 */
export const CAR_DATA: Record<string, string[]> = {
    'Maruti Suzuki': [
        'Alto',
        'Swift',
        'Dzire',
        'Baleno',
        'Brezza',
        'Ertiga',
        'Wagon R',
        'Celerio',
        'Ignis',
        'XL6',
        'Grand Vitara',
        'Jimny',
        'Fronx',
    ],
    Hyundai: [
        'i10',
        'i20',
        'Aura',
        'Verna',
        'Creta',
        'Venue',
        'Tucson',
        'Alcazar',
        'Ioniq 5',
    ],
    Tata: [
        'Tiago',
        'Tigor',
        'Altroz',
        'Punch',
        'Nexon',
        'Harrier',
        'Safari',
        'Curvv',
        'Nexon EV',
    ],
    Honda: ['Amaze', 'City', 'Elevate', 'WR-V'],
    Toyota: [
        'Glanza',
        'Urban Cruiser Hyryder',
        'Innova Crysta',
        'Innova HyCross',
        'Fortuner',
        'Camry',
    ],
    Kia: ['Sonet', 'Seltos', 'Carnival', 'EV6'],
    Mahindra: [
        'Thar',
        'Scorpio-N',
        'Scorpio Classic',
        'XUV700',
        'XUV400',
        'XUV300',
        'Bolero',
        'BE 6',
    ],
    MG: ['Hector', 'Astor', 'Gloster', 'Comet EV', 'Windsor EV'],
    Renault: ['Kwid', 'Triber', 'Kiger'],
    Nissan: ['Magnite'],
    Volkswagen: ['Polo', 'Vento', 'Taigun', 'Virtus'],
    Skoda: ['Rapid', 'Slavia', 'Kushaq', 'Kodiaq'],
    Jeep: ['Compass', 'Meridian', 'Wrangler'],
    Ford: ['EcoSport', 'Endeavour', 'Figo'],
};

/**
 * Returns model list for a given make, or [] if make not found.
 * Case-sensitive — makes must match CAR_DATA keys exactly.
 */
export function getModelsForMake(make: string): string[] {
    return CAR_DATA[make] ?? [];
}
