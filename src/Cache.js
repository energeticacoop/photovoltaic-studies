function getNamedRangeWithCache(rangeName) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var cache = CacheService.getScriptCache();
  
  // Generate a cache key based on the named range name
  var cacheKey = 'namedRange_' + rangeName;
  
  // Check if data is cached
  var cachedData = cache.get(cacheKey);
  if (cachedData != null) {
    // Data is cached, so use it
    Logger.log(`Using cached data for "${rangeName}"`);
    return JSON.parse(cachedData);
  }

  // Get the named range from the sheet
  var namedRange = sheet.getRangeByName(rangeName);
  
  // If the named range doesn't exist, return null or handle the error accordingly
  if (!namedRange) {
    Logger.log('Named range not found: ' + rangeName);
    return null;
  }

  // Get the values of the named range
  var rangeValues = namedRange.getValues();

  // Convert the rangeValues array to a JSON string to prepare for caching
  var rangeValuesString = JSON.stringify(rangeValues);

  // Check if the data size exceeds cache limit (100 KB)
  if (rangeValuesString.length > 100000) {
    Logger.log(`Data of range "${rangeName}" too large for cache (${rangeValuesString.length} bytes), skipping cache.`);
    return rangeValues;  // Return without caching
  }

  // Cache the data for later use (with a timeout of 1 hour)
  cache.put(cacheKey, rangeValuesString, 3600);

  // Now you have the selected range in memory
  Logger.log(`Using fresh data for "${rangeName}"`);
  return rangeValues;
}


function getValueWithCache(rangeName) {
  return getNamedRangeWithCache(rangeName) 
}

function getValuesWithCache(rangeName) {
  return getNamedRangeWithCache(rangeName) 
}

function getColumnWithCache(rangeName) {
  values = getNamedRangeWithCache(rangeName) 
  return values.map(value => value[0])
}

function testCache (){
  
  const values = (getColumnWithCache("seasons"))

}
