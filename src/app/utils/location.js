export function getDistanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000; // 地球半径，单位：米

  const toRad = (value) => (value * Math.PI) / 180;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lng2 - lng1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) *
    Math.cos(φ2) *
    Math.sin(Δλ / 2) *
    Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function isNearPoint(currentLat, currentLng, targetLat, targetLng, radiusMeters = 100) {
  const distance = getDistanceMeters(
    currentLat,
    currentLng,
    targetLat,
    targetLng
  );

  return {
    isNear: distance <= radiusMeters,
    distance,
  };
}