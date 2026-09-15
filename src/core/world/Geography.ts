export interface CityLocation {
  id: string;
  name: string;
  country: string;
  region: 'UK_IRE' | 'EUROPE' | 'NORTH_AMERICA' | 'OCEANIA' | 'ASIA';
  coordinates: {
    lat: number;
    lon: number;
  };
}

export const CITIES: Record<string, CityLocation> = {
  // UK & Ireland
  london: { id: 'london', name: 'London', country: 'England', region: 'UK_IRE', coordinates: { lat: 51.5074, lon: -0.1278 } },
  minehead: { id: 'minehead', name: 'Minehead', country: 'England', region: 'UK_IRE', coordinates: { lat: 51.205, lon: -3.475 } },
  blackpool: { id: 'blackpool', name: 'Blackpool', country: 'England', region: 'UK_IRE', coordinates: { lat: 53.8175, lon: -3.0357 } },
  dublin: { id: 'dublin', name: 'Dublin', country: 'Ireland', region: 'UK_IRE', coordinates: { lat: 53.3498, lon: -6.2603 } },
  glasgow: { id: 'glasgow', name: 'Glasgow', country: 'Scotland', region: 'UK_IRE', coordinates: { lat: 55.8642, lon: -4.2518 } },
  cardiff: { id: 'cardiff', name: 'Cardiff', country: 'Wales', region: 'UK_IRE', coordinates: { lat: 51.4816, lon: -3.1791 } },

  // Europe
  berlin: { id: 'berlin', name: 'Berlin', country: 'Germany', region: 'EUROPE', coordinates: { lat: 52.5200, lon: 13.4050 } },
  hildesheim: { id: 'hildesheim', name: 'Hildesheim', country: 'Germany', region: 'EUROPE', coordinates: { lat: 52.1508, lon: 9.9511 } },
  amsterdam: { id: 'amsterdam', name: 'Amsterdam', country: 'Netherlands', region: 'EUROPE', coordinates: { lat: 52.3676, lon: 4.9041 } },
  wieze: { id: 'wieze', name: 'Wieze', country: 'Belgium', region: 'EUROPE', coordinates: { lat: 50.9753, lon: 4.0792 } },
  prague: { id: 'prague', name: 'Prague', country: 'Czech Republic', region: 'EUROPE', coordinates: { lat: 50.0755, lon: 14.4378 } },
  graz: { id: 'graz', name: 'Graz', country: 'Austria', region: 'EUROPE', coordinates: { lat: 47.0707, lon: 15.4395 } },
  
  // Rest of World
  new_york: { id: 'new_york', name: 'New York', country: 'USA', region: 'NORTH_AMERICA', coordinates: { lat: 40.7128, lon: -74.0060 } },
  sydney: { id: 'sydney', name: 'Sydney', country: 'Australia', region: 'OCEANIA', coordinates: { lat: -33.8688, lon: 151.2093 } },
  auckland: { id: 'auckland', name: 'Auckland', country: 'New Zealand', region: 'OCEANIA', coordinates: { lat: -36.8485, lon: 174.7633 } },
  tokyo: { id: 'tokyo', name: 'Tokyo', country: 'Japan', region: 'ASIA', coordinates: { lat: 35.6762, lon: 139.6503 } }
};

export class GeographyManager {
  /**
   * Returns distance between two coordinates in miles using the Haversine formula
   */
  public static calculateDistanceMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3958.8; // Radius of the Earth in miles
    const rLat1 = lat1 * (Math.PI / 180);
    const rLat2 = lat2 * (Math.PI / 180);
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(rLat1) * Math.cos(rLat2) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  public static getDistanceBetweenCities(city1Id: string, city2Id: string): number {
    const c1 = CITIES[city1Id];
    const c2 = CITIES[city2Id];
    if (!c1 || !c2) return 0;
    return this.calculateDistanceMiles(
      c1.coordinates.lat, c1.coordinates.lon,
      c2.coordinates.lat, c2.coordinates.lon
    );
  }

  public static getCityIdFromLocationString(location: string): string {
    const loc = location.toLowerCase();
    if (loc.includes('london') || loc.includes('o2') || loc.includes('alexandra')) return 'london';
    if (loc.includes('minehead')) return 'minehead';
    if (loc.includes('blackpool')) return 'blackpool';
    if (loc.includes('dublin')) return 'dublin';
    if (loc.includes('glasgow')) return 'glasgow';
    if (loc.includes('cardiff')) return 'cardiff';
    if (loc.includes('berlin')) return 'berlin';
    if (loc.includes('hildesheim')) return 'hildesheim';
    if (loc.includes('amsterdam')) return 'amsterdam';
    if (loc.includes('wieze')) return 'wieze';
    if (loc.includes('prague')) return 'prague';
    if (loc.includes('graz')) return 'graz';
    if (loc.includes('new york') || loc.includes('madison')) return 'new_york';
    if (loc.includes('sydney') || loc.includes('brisbane') || loc.includes('wollongong')) return 'sydney';
    if (loc.includes('auckland') || loc.includes('hamilton')) return 'auckland';
    if (loc.includes('wolverhampton') || loc.includes('leicester') || loc.includes('wigan') || loc.includes('barnsley')) return 'london'; // Close enough for travel logic
    if (loc.includes('tokyo')) return 'tokyo';
    
    // Default fallback to London
    return 'london';
  }
}
