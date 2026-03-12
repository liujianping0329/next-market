export const GARDEN_BASE_SELECT = `
  *,
  f_user(*,planet(*))
`;

export const GARDEN_PLANET_ID_SELECT = `
  *,
  f_user(*,planet(*)),
  f_user_filter:f_user!inner(planetId)
`;

export const GARDEN_PLANET_NULL_SELECT = `
  *,
  f_user(*,planet(*)),
  user_filter:f_user(),
  planet_filter:f_user(planet())
`;

export const HARVEST_BASE_SELECT = `
  *,garden(pics),
  f_user(*,planet(*))
`;

export const HARVEST_PLANET_ID_SELECT = `
  *,garden(pics),
  f_user(*,planet(*)),
  f_user_filter:f_user!inner(planetId)
`;

export const HARVEST_PLANET_NULL_SELECT = `
  *,garden(pics),
  f_user(*,planet(*)),
  user_filter:f_user(),
  planet_filter:f_user(planet())
`;

export const PLANET_ID_SELECT = `
  f_user(*,planet(*)),
  f_user_filter:f_user!inner(planetId)
`;

export const PLANET_NULL_SELECT = `
  f_user(*,planet(*)),
  user_filter:f_user(),
  planet_filter:f_user(planet())
`;

export function applyPlanetFilter(query, { planetId, isPlanetNull }, baseSel = "*,") {
  if (planetId != null && planetId !== "") {
    return query
      .select(baseSel + PLANET_ID_SELECT)
      .eq("f_user_filter.planetId", planetId);
  }

  if (isPlanetNull) {
    return query
      .select(baseSel + PLANET_NULL_SELECT)
      .or("user_filter.is.null,planet_filter.is.null");
  }

  return query.select(baseSel);
}