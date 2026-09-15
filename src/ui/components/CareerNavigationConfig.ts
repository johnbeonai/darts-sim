import React from 'react';
import { CareerManager } from '../../core/career/CareerManager';
import {
  Home,
  User,
  Calendar as CalendarIcon,
  BarChart3,
  Trophy,
  ShoppingBag,
  DollarSign,
  Users,
  Stethoscope,
  Target,
  Award,
} from 'lucide-react';

export type CareerPageView =
  | 'career_dashboard'
  | 'player_profile'
  | 'career_calendar'
  | 'world_rankings'
  | 'premier_league'
  | 'equipment_shop'
  | 'finances'
  | 'support_staff'
  | 'medical_centre'
  | 'practice_minigames'
  | 'career_records'
  | 'training_minigame'
  | 'skill_tree';

export interface PageDef {
  id: CareerPageView;
  title: string;
  shortTitle: string;
  icon: React.ComponentType<{ className?: string }>;
  getBadge?: (career: CareerManager) => { text: string; color: string } | null;
  hasAlert?: (career: CareerManager) => boolean;
}

export const CAREER_PAGES: PageDef[] = [
  {
    id: 'career_dashboard',
    title: 'Dashboard & Weekly Hub',
    shortTitle: 'Dashboard',
    icon: Home,
  },
  {
    id: 'player_profile',
    title: 'Player Profile & Stats',
    shortTitle: 'Profile',
    icon: User,
  },
  {
    id: 'career_calendar',
    title: 'Full Season Calendar',
    shortTitle: 'Calendar',
    icon: CalendarIcon,
  },
  {
    id: 'world_rankings',
    title: 'PDC World Order of Merit',
    shortTitle: 'Rankings',
    icon: BarChart3,
    getBadge: (c) => {
      const activeP = c.players[c.activePlayerIndex] || c.player;
      const rank = c.ranking.getPlayerRank(activeP.id)?.currentRank || activeP.ranking || 128;
      return { text: `#${rank}`, color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' };
    },
  },
  {
    id: 'premier_league',
    title: 'BetMGM Premier League',
    shortTitle: 'Premier League',
    icon: Trophy,
  },
  {
    id: 'equipment_shop',
    title: 'Equipment Pro Shop',
    shortTitle: 'Pro Shop',
    icon: ShoppingBag,
  },
  {
    id: 'finances',
    title: 'Finances & Sponsorships',
    shortTitle: 'Finances',
    icon: DollarSign,
    getBadge: (c) => {
      const activeP = c.players[c.activePlayerIndex] || c.player;
      const balanceK = Math.round(activeP.bankBalance / 1000);
      return { text: `£${balanceK}k`, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' };
    },
  },
  {
    id: 'support_staff',
    title: 'Support Staff Team',
    shortTitle: 'Staff',
    icon: Users,
  },
  {
    id: 'medical_centre',
    title: 'Medical & Physio Clinic',
    shortTitle: 'Medical',
    icon: Stethoscope,
    hasAlert: (c) => {
      const activeP = c.players[c.activePlayerIndex] || c.player;
      return activeP.hasActiveInjury;
    },
  },
  {
    id: 'practice_minigames',
    title: 'Practice Oche & Mini-Games',
    shortTitle: 'Practice',
    icon: Target,
  },
  {
    id: 'career_records',
    title: 'Career Honours & Records',
    shortTitle: 'Records',
    icon: Award,
  },
];
