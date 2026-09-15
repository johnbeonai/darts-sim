/**
 * Support Staff & Career Personnel
 * Implements Section 59 & Phase 10 of the Master Technical Blueprint.
 */

import { Player, CareerTier } from '../player/Player';

export type StaffRole = 'coach' | 'physio' | 'psychologist' | 'manager';

export interface StaffMember {
  id: string;
  role: StaffRole;
  name: string;
  title: string;
  weeklySalary: number; // £/week
  tierRequired: CareerTier;
  description: string;
  perkSummary: string;
  hired: boolean;

  // Realism & Immersion details
  bio: string;
  experienceYears: number;
  nationality: string;
  specialties: string[];
  education: string;
  avatarKey: string;
}

export const STAFF_CATALOG: StaffMember[] = [
  // ==================== COACHES ====================
  {
    id: 'coach-dave',
    role: 'coach',
    name: 'Dave "The Drill" Hughes',
    title: 'County Practice & Technique Coach',
    weeklySalary: 35,
    tierRequired: 'pub',
    description: 'Veteran West Midlands county thrower who stresses rhythmic arm follow-through and grouping discipline.',
    perkSummary: '+25% Weekly Training XP & Skill Growth',
    hired: false,
    bio: 'A 16-year veteran of the West Midlands county circuit, Dave Hughes built his reputation at the grass-roots oche. Renowned for fixing frantic arm releases, Dave teaches pupils a pendulum-smooth stroke, upright elbow stance, and laser treble grouping.',
    experienceYears: 16,
    nationality: 'England',
    education: 'UK Coaching Guild Fellow',
    specialties: ['Pendulum Arm Arc', 'Grouping Mechanics', 'Rhythm Stabilization'],
    avatarKey: 'coach_dave'
  },
  {
    id: 'coach-keith',
    role: 'coach',
    name: "Keith 'The Professor' O'Connor",
    title: 'Ex-PDC Pro Tour Head Coach',
    weeklySalary: 95,
    tierRequired: 'semi_pro',
    description: 'Elite professional technical coach who analyses release angles and converts trebles into clinical finishes.',
    perkSummary: '+45% Weekly Training XP & Attribute Insight',
    hired: false,
    bio: 'Keith guided multiple PDC major quarter-finalists through the gruelling European Tour. His signature methodology uses high-speed release telemetry to eliminate wrist wobble and turn loose 80s into relentless 140s and 180s.',
    experienceYears: 24,
    nationality: 'Ireland',
    education: 'MSc Sports Science, Dublin',
    specialties: ['Release Telemetry', 'Check-out Board Navigation', 'Advanced Treble Precision'],
    avatarKey: 'coach_keith'
  },

  // ==================== PHYSIOTHERAPISTS ====================
  {
    id: 'physio-sarah',
    role: 'physio',
    name: 'Sarah Jenkins, M.Sc. MCSP',
    title: 'Sports Ergonomics Physio',
    weeklySalary: 45,
    tierRequired: 'pub',
    description: 'Specialises in shoulder posture, elbow tendonitis prevention, and deep tissue recovery.',
    perkSummary: '+15% Fatigue Recovery on Rest Weeks, -20% Match Fatigue',
    hired: false,
    bio: 'Sarah previously managed physical conditioning for British County Athletic squads. She specializes in preventing thrower tendonitis, rotator cuff impingement, and lower back soreness from long tournament days.',
    experienceYears: 11,
    nationality: 'Wales',
    education: 'Cardiff University Sports Physio',
    specialties: ['Elbow Tendonitis Care', 'Rotator Cuff Conditioning', 'Deep Tissue Mobility'],
    avatarKey: 'physio_sarah'
  },
  {
    id: 'physio-marcus',
    role: 'physio',
    name: 'Dr. Marcus Vance, MD PhD',
    title: 'High-Performance Sports Physio',
    weeklySalary: 110,
    tierRequired: 'semi_pro',
    description: 'Premier physiotherapist working with world champions on endurance conditioning and rapid joint recuperation.',
    perkSummary: '+30% Fatigue Recovery on Rest Weeks, -35% Match Fatigue',
    hired: false,
    bio: 'Chief medical consultant for elite tour competitors, Dr. Vance treats match-day endurance as a science. His rapid cryogenic protocols and joint decompression ensure your arm stays fresh into deciding 11-leg shootouts.',
    experienceYears: 19,
    nationality: 'England',
    education: 'Oxford Sports Orthopedics',
    specialties: ['Cryogenic Recovery', 'Endurance Conditioning', 'Rapid Joint Decompression'],
    avatarKey: 'physio_marcus'
  },

  // ==================== SPORTS PSYCHOLOGISTS ====================
  {
    id: 'psych-clara',
    role: 'psychologist',
    name: 'Clara Bennett, CPsychol',
    title: 'Oche Mind & Focus Specialist',
    weeklySalary: 55,
    tierRequired: 'amateur',
    description: 'Helps players compartmentalise missed darts, maintain oche tunnel vision, and reset between visits.',
    perkSummary: '+6 Mental Clutch, Prevents Confidence Plummeting on Defeat',
    hired: false,
    bio: 'A certified cognitive sports psychologist, Clara coaches throwers in the art of the mental reset. She teaches breathing anchors to neutralize noisy crowd heckling and stop missed doubles from snowballing into match collapses.',
    experienceYears: 9,
    nationality: 'Scotland',
    education: 'University of Edinburgh Psychology',
    specialties: ['Breath Anchoring', 'Tunnel Vision Focus', 'Defeat Resilience'],
    avatarKey: 'psych_clara'
  },
  {
    id: 'psych-mercer',
    role: 'psychologist',
    name: 'Dr. Julian Mercer, PhD AFBPsS',
    title: 'World Championship Mental Performance Coach',
    weeklySalary: 135,
    tierRequired: 'pro',
    description: 'Elite sports psychologist who conditions players to thrive in deciding-leg pressure cookers.',
    perkSummary: '+12 Mental Clutch, Maximum Confidence Protection',
    hired: false,
    bio: 'The mastermind behind several world final turnarounds, Dr. Mercer conditions dart players to crave high-stakes sudden-death pressure. He trains nerves of absolute steel when staring down a match-winning double.',
    experienceYears: 22,
    nationality: 'England',
    education: 'Cambridge Institute of Performance',
    specialties: ['Deciding Leg Composure', 'Heart-Rate Modulation', 'Championship Aura'],
    avatarKey: 'psych_mercer'
  },

  // ==================== CAREER & COMMERCIAL MANAGERS ====================
  {
    id: 'manager-gary',
    role: 'manager',
    name: 'Gary "The Hawk" Evans',
    title: 'Commercial Agent & Business Manager',
    weeklySalary: 60,
    tierRequired: 'amateur',
    description: 'Sharp commercial broker connected with major darts brands, sponsors, and exhibition tour bookers.',
    perkSummary: '+15% Sponsor Contract Payouts & Faster Commercial Unlocks',
    hired: false,
    bio: 'A veteran sports agent with over 15 years in sports representation, Gary handles corporate partnerships, exhibition appearances, and travel logistics so you can focus 100% of your energy on the board.',
    experienceYears: 15,
    nationality: 'England',
    education: 'London Business School',
    specialties: ['Sponsorship Brokering', 'Contract Negotiation', 'Tour Logistics'],
    avatarKey: 'manager_gary'
  }
];

export class StaffManager {
  /**
   * Hires a support staff member
   */
  public static hireStaff(
    player: Player,
    staffId: string,
    hiredStaffIds: string[]
  ): { success: boolean; message: string } {
    const member = STAFF_CATALOG.find(s => s.id === staffId);
    if (!member) {
      return { success: false, message: 'Staff member not found.' };
    }

    if (hiredStaffIds.includes(staffId)) {
      return { success: false, message: `${member.name} is already hired.` };
    }

    // Can only hire one staff member per role
    const existingInRole = STAFF_CATALOG.find(s => hiredStaffIds.includes(s.id) && s.role === member.role);
    if (existingInRole) {
      // Replace existing staff in this role
      const idx = hiredStaffIds.indexOf(existingInRole.id);
      hiredStaffIds.splice(idx, 1);
    }

    if (player.bankBalance < member.weeklySalary) {
      return {
        success: false,
        message: `Insufficient funds to hire ${member.name}. You need at least £${member.weeklySalary} for the initial weekly retainer.`
      };
    }

    hiredStaffIds.push(member.id);

    return {
      success: true,
      message: `Hired ${member.name} (${member.title})! Weekly salary: £${member.weeklySalary}. ${member.perkSummary}.`
    };
  }

  /**
   * Dismisses a support staff member
   */
  public static dismissStaff(
    staffId: string,
    hiredStaffIds: string[]
  ): { success: boolean; message: string } {
    const idx = hiredStaffIds.indexOf(staffId);
    if (idx === -1) {
      return { success: false, message: 'This staff member is not currently hired.' };
    }

    const member = STAFF_CATALOG.find(s => s.id === staffId);
    hiredStaffIds.splice(idx, 1);

    return {
      success: true,
      message: `Released ${member?.name ?? 'Staff member'} from your support team.`
    };
  }

  /**
   * Processes weekly payroll deduction for all active staff
   */
  public static processWeeklyPayroll(
    player: Player,
    hiredStaffIds: string[]
  ): { totalPayroll: number; dismissedDueToInsolvency: string[]; messages: string[] } {
    let totalPayroll = 0;
    const dismissedDueToInsolvency: string[] = [];
    const messages: string[] = [];

    for (let i = hiredStaffIds.length - 1; i >= 0; i--) {
      const staffId = hiredStaffIds[i];
      const member = STAFF_CATALOG.find(s => s.id === staffId);
      if (!member) continue;

      if (player.bankBalance >= member.weeklySalary) {
        player.bankBalance -= member.weeklySalary;
        totalPayroll += member.weeklySalary;
        messages.push(`Paid £${member.weeklySalary} weekly salary to ${member.name} (${member.title}).`);
      } else {
        // Insolvent: cannot pay salary, staff departs
        hiredStaffIds.splice(i, 1);
        dismissedDueToInsolvency.push(member.name);
        messages.push(`⚠️ Insolvent: Could not pay £${member.weeklySalary} to ${member.name}. They have departed your support team.`);
      }
    }

    return { totalPayroll, dismissedDueToInsolvency, messages };
  }

  /**
   * Computes cumulative training growth multiplier from hired coaches
   */
  public static getTrainingMultiplier(hiredStaffIds: string[]): number {
    if (hiredStaffIds.includes('coach-keith')) return 1.45;
    if (hiredStaffIds.includes('coach-dave')) return 1.25;
    return 1.0;
  }

  /**
   * Computes rest recovery bonus from hired physiotherapists
   */
  public static getRestFatigueBonus(hiredStaffIds: string[]): number {
    if (hiredStaffIds.includes('physio-marcus')) return 25; // +25% extra recovery
    if (hiredStaffIds.includes('physio-sarah')) return 15;  // +15% extra recovery
    return 0;
  }

  /**
   * Computes match fatigue reduction from hired physiotherapists
   */
  public static getMatchFatigueMultiplier(hiredStaffIds: string[]): number {
    if (hiredStaffIds.includes('physio-marcus')) return 0.65; // -35% fatigue
    if (hiredStaffIds.includes('physio-sarah')) return 0.80;  // -20% fatigue
    return 1.0;
  }

  /**
   * Computes mental clutch boost from hired sports psychologists
   */
  public static getClutchBonus(hiredStaffIds: string[]): number {
    if (hiredStaffIds.includes('psych-mercer')) return 12;
    if (hiredStaffIds.includes('psych-clara')) return 6;
    return 0;
  }
}
