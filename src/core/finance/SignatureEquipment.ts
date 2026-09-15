import { Player } from '../player/Player';

export interface SignatureEquipmentDeal {
  id: string;
  sponsorName: string;
  equipmentName: string;
  royaltyPerSale: number;
  totalSales: number;
  unclaimedRoyalties: number;
}

export class SignatureEquipmentManager {
  public static offerDeal(player: Player): SignatureEquipmentDeal | null {
    if ((player.ranking <= 16 && player.ranking > 0) || player.state.confidence > 90) {
      return {
        id: `sig-deal-${Date.now()}`,
        sponsorName: 'Target Pro',
        equipmentName: `${player.name.split(' ')[1] || player.name} Signature 90% Tungsten`,
        royaltyPerSale: 2.50, // £2.50 per set sold
        totalSales: 0,
        unclaimedRoyalties: 0
      };
    }
    return null;
  }

  public static processWeeklySales(deal: SignatureEquipmentDeal, playerRank: number, playerForm: number): number {
    // Better rank & form = more sales
    const baseSales = 100;
    const rankMultiplier = playerRank > 0 ? Math.max(0.5, (64 - playerRank) / 10) : 0.5;
    const formMultiplier = playerForm / 50;
    
    const weeklySales = Math.floor(baseSales * rankMultiplier * formMultiplier * (0.8 + Math.random() * 0.4));
    deal.totalSales += weeklySales;
    
    const royalties = weeklySales * deal.royaltyPerSale;
    deal.unclaimedRoyalties += royalties;
    
    return royalties;
  }
}
