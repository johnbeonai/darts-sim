import { Player } from '../player/Player';
import { GeographyManager, CITIES } from '../world/Geography';
import { TournamentConfig } from '../tournament/Tournament';

export type TravelClass = 'budget' | 'standard' | 'luxury';

export interface TravelOption {
  travelClass: TravelClass;
  cost: number;
  fatigueCost: number;
  formCost: number;
  description: string;
}

export class TravelManager {
  /**
   * Calculates the distance and available travel options for a player to reach a tournament
   */
  public static getTravelOptions(player: Player, tournament: TournamentConfig): TravelOption[] {
    const homeBaseId = player.homeBaseId || 'london';
    // Fallback parsing if locationId is missing
    const tourneyLocationId = tournament.locationId || GeographyManager.getCityIdFromLocationString(tournament.location);
    
    if (homeBaseId === tourneyLocationId) {
      // Local tournament, no travel cost
      return [
        { travelClass: 'standard', cost: 0, fatigueCost: 0, formCost: 0, description: 'Local commute' }
      ];
    }

    const distance = GeographyManager.getDistanceBetweenCities(homeBaseId, tourneyLocationId);
    
    // Short-haul (e.g. London to Berlin)
    if (distance < 1500) {
      return [
        {
          travelClass: 'budget',
          cost: 150,
          fatigueCost: 5,
          formCost: -1,
          description: 'Economy flight (Budget Hotel)'
        },
        {
          travelClass: 'standard',
          cost: 400,
          fatigueCost: 1,
          formCost: 0,
          description: 'Standard flight (4-Star Hotel)'
        },
        {
          travelClass: 'luxury',
          cost: 1200,
          fatigueCost: -2,
          formCost: 1,
          description: 'Private transfer (5-Star Resort)'
        }
      ];
    }

    // Long-haul (e.g. London to Sydney)
    return [
      {
        travelClass: 'budget',
        cost: 650,
        fatigueCost: 18,
        formCost: -4,
        description: 'Multi-stop economy flight (Jet Lag Warning)'
      },
      {
        travelClass: 'standard',
        cost: 1500,
        fatigueCost: 8,
        formCost: -1,
        description: 'Direct flight (Standard Accommodation)'
      },
      {
        travelClass: 'luxury',
        cost: 5500,
        fatigueCost: 0,
        formCost: 3,
        description: 'First Class flights (Luxury Recovery Suite)'
      }
    ];
  }

  public static bookTravel(player: Player, option: TravelOption): { success: boolean; message: string } {
    if (player.bankBalance < option.cost) {
      return { success: false, message: 'Insufficient funds to book this travel option.' };
    }

    player.bankBalance -= option.cost;
    
    if (player.state) {
      player.state.fatigue = Math.min(100, Math.max(0, player.state.fatigue + option.fatigueCost));
      player.state.form = Math.min(100, Math.max(0, player.state.form + option.formCost));
    }

    return { success: true, message: `Travel booked: ${option.description}` };
  }
}
