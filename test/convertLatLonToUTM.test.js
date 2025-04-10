const assert = require('assert');
const { convertLatLonToUTM } = require('../src/Production/Production'); // Adjust the path as needed

describe('convertLatLonToUTM', function () {
  // Test valid inputs
  it('should return UTM coordinates for valid lat/lon input', function () {
    const result = convertLatLonToUTM(41.6479697605368, -4.722921115765859); // Example: 47004 postal code coordinates

    assert.strictEqual(typeof result.easting, 'number');
    assert.strictEqual(typeof result.northing, 'number');
    assert.strictEqual(typeof result.zoneNum, 'number');
    assert.strictEqual(typeof result.zoneLetter, 'string');
    assert.strictEqual(result.zoneNum, 30); // Zone for these coordinates
    assert.strictEqual(result.zoneLetter, 'T'); // Adjusted based on the correct zone letter for these coordinates
  });

  // Test valid input for lat, lon on the boundaries
  it('should return valid UTM for the maximum latitude 84', function () {
    const result = convertLatLonToUTM(84, 0); // Maximum latitude
    assert.strictEqual(typeof result.zoneNum, 'number');
    assert.strictEqual(typeof result.zoneLetter, 'string');
  });

  it('should return valid UTM for the minimum latitude -80', function () {
    const result = convertLatLonToUTM(-80, 0); // Minimum latitude
    assert.strictEqual(typeof result.zoneNum, 'number');
    assert.strictEqual(typeof result.zoneLetter, 'string');
  });

  it('should return valid UTM for the maximum longitude 180', function () {
    const result = convertLatLonToUTM(0, 180); // Maximum longitude
    assert.strictEqual(typeof result.zoneNum, 'number');
    assert.strictEqual(typeof result.zoneLetter, 'string');
  });

  it('should return valid UTM for the minimum longitude -180', function () {
    const result = convertLatLonToUTM(0, -180); // Minimum longitude
    assert.strictEqual(typeof result.zoneNum, 'number');
    assert.strictEqual(typeof result.zoneLetter, 'string');
  });

  // Test for invalid input
  it('should throw RangeError for latitudes > 84', function () {
    assert.throws(() => convertLatLonToUTM(85, 0), {
      name: 'RangeError',
      message: 'Latitude out of range (must be between -80 and 84)',
    });
  });

  it('should throw RangeError for latitudes < -80', function () {
    assert.throws(() => convertLatLonToUTM(-81, 0), {
      name: 'RangeError',
      message: 'Latitude out of range (must be between -80 and 84)',
    });
  });

  it('should throw RangeError for longitudes > 180', function () {
    assert.throws(() => convertLatLonToUTM(0, 181), {
      name: 'RangeError',
      message: 'Longitude out of range (must be between -180 and 180)',
    });
  });

  it('should throw RangeError for longitudes < -180', function () {
    assert.throws(() => convertLatLonToUTM(0, -181), {
      name: 'RangeError',
      message: 'Longitude out of range (must be between -180 and 180)',
    });
  });
});
