/** Нормалізація адреси для групування домоволодінь */
export function normalizeStreet(street: string) {
  return street.trim();
}

export function normalizeHouseNumber(houseNumber: string) {
  return houseNumber.trim();
}

export function householdAddressKey(street: string, houseNumber: string) {
  return `${normalizeStreet(street).toLowerCase()}|${normalizeHouseNumber(houseNumber).toLowerCase()}`;
}

export function formatAddressLine(street: string, houseNumber: string) {
  return `${normalizeStreet(street)} ${normalizeHouseNumber(houseNumber)}`;
}
