export function feetToMeters(feet: number): number {
  return feet * 0.3048;
}

export function metersToFeet(meters: number): number {
  return meters * 3.28084;
}

export function celsiusToKelvin(celsius: number): number {
  return celsius + 273.15;
}

export function kelvinToCelsius(kelvin: number): number {
  return kelvin - 273.15;
}

export function hpaToFlightLevel(hpa: number): number {
  // FL = altitude in feet / 100
  const altFt = 44330 * (1 - Math.pow(hpa / 1013.25, 0.1903)) * 3.28084;
  return Math.round(altFt / 100);
}

export function co2ToTrees(co2Kg: number): number {
  // Average tree absorbs ~21 kg CO2 per year
  return Math.round((co2Kg / 21) * 10) / 10;
}

export function co2ToCarMiles(co2Kg: number): number {
  // Average car emits ~0.404 kg CO2 per mile
  return Math.round(co2Kg / 0.404);
}
