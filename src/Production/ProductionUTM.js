/**
 * Reads coordinates from the named range "coordinates", validates and parses them,
 * computes UTM values using `convertLatLonToUTM`, and writes the results
 * to named ranges: "huso", "banda", "easting", and "northing".
 *
 * @throws {Error} If coordinates are empty, not numeric, or improperly formatted.
 */
function getUTMcoordinates() {
  const coordinates = get("coordinates");

  if (!coordinates || typeof coordinates !== "string") {
    throw new Error("Coordenadas vacías o no válidas.");
  }

  const parts = coordinates.trim().split(/(?:,| )+/).map(Number);

  if (parts.length !== 2 || parts.some((val) => isNaN(val))) {
    throw new Error("Formato de coordenadas incorrecto. Use 'lat, lon'.");
  }

  const [latitude, longitude] = parts;
  const result = convertLatLonToUTM(latitude, longitude);

  set("huso", result.zoneNum);
  set("banda", result.zoneLetter);
  set("easting", result.easting);
  set("northing", result.northing);
}



/**
 * Converts geographic coordinates (latitude, longitude) to UTM (Universal Transverse Mercator).
 *
 * Adapted from: https://github.com/proj4js/proj4js/blob/master/lib/projections/utm.js
 *
 * @param {number} latitude - Latitude in decimal degrees. Must be between -80 and 84.
 * @param {number} longitude - Longitude in decimal degrees. Must be between -180 and 180.
 * @param {number} [forceZoneNum] - Optional UTM zone override.
 * @returns {{
 *   easting: number,
 *   northing: number,
 *   zoneNum: number,
 *   zoneLetter: string
 * }} UTM coordinate object.
 *
 * @throws {RangeError} If input values are outside valid bounds.
 */
function convertLatLonToUTM(latitude, longitude, forceZoneNum) {
  if (latitude > 84 || latitude < -80) {
    throw new RangeError("Latitude out of range (must be between -80 and 84)");
  }
  if (longitude > 180 || longitude < -180) {
    throw new RangeError("Longitude out of range (must be between -180 and 180)");
  }

  const R = 6378137; // Earth radius in meters
  const E = 0.00669438; // Eccentricity squared
  const E_P2 = E / (1 - E);
  const K0 = 0.9996;

  const M1 = 1 - E / 4 - (3 * E * E) / 64 - (5 * E * E * E) / 256;
  const M2 = (3 * E) / 8 + (3 * E * E) / 32 + (45 * E * E * E) / 1024;
  const M3 = (15 * E * E) / 256 + (45 * E * E * E) / 1024;
  const M4 = (35 * E * E * E) / 3072;

  const ZONE_LETTERS = "CDEFGHJKLMNPQRSTUVWXX".split("");

  function toRadians(deg) {
    return (deg * Math.PI) / 180;
  }

  function latitudeToZoneLetter(lat) {
    if (-80 <= lat && lat <= 84) {
      return ZONE_LETTERS[Math.floor((lat + 80) / 8)];
    }
    return null;
  }

  function latLonToZoneNumber(lat, lon) {
    if (56 <= lat && lat < 64 && 3 <= lon && lon < 12) return 32;
    if (72 <= lat && lat <= 84 && lon >= 0) {
      if (lon < 9) return 31;
      if (lon < 21) return 33;
      if (lon < 33) return 35;
      if (lon < 42) return 37;
    }
    return Math.floor((lon + 180) / 6) + 1;
  }

  function zoneNumberToCentralLongitude(zoneNum) {
    return (zoneNum - 1) * 6 - 180 + 3;
  }

  const latRad = toRadians(latitude);
  const latSin = Math.sin(latRad);
  const latCos = Math.cos(latRad);
  const latTan = Math.tan(latRad);
  const latTan2 = latTan * latTan;
  const latTan4 = latTan2 * latTan2;

  const zoneNum = forceZoneNum ?? latLonToZoneNumber(latitude, longitude);
  const zoneLetter = latitudeToZoneLetter(latitude);

  const lonRad = toRadians(longitude);
  const centralLon = zoneNumberToCentralLongitude(zoneNum);
  const centralLonRad = toRadians(centralLon);

  const n = R / Math.sqrt(1 - E * latSin * latSin);
  const c = E_P2 * latCos * latCos;
  const a = latCos * (lonRad - centralLonRad);
  const a2 = a * a;
  const a3 = a2 * a;
  const a4 = a3 * a;
  const a5 = a4 * a;
  const a6 = a5 * a;

  const m =
    R *
    (M1 * latRad -
      M2 * Math.sin(2 * latRad) +
      M3 * Math.sin(4 * latRad) -
      M4 * Math.sin(6 * latRad));

  const easting =
    K0 *
      n *
      (a +
        (a3 / 6) * (1 - latTan2 + c) +
        (a5 / 120) * (5 - 18 * latTan2 + latTan4 + 72 * c - 58 * E_P2)) +
    500000;

  let northing =
    K0 *
    (m +
      n *
        latTan *
        (a2 / 2 +
          (a4 / 24) * (5 - latTan2 + 9 * c + 4 * c * c) +
          (a6 / 720) * (61 - 58 * latTan2 + latTan4 + 600 * c - 330 * E_P2)));

  if (latitude < 0) northing += 10000000;

  return {
    easting,
    northing,
    zoneNum,
    zoneLetter,
  };
}