import { calculateDistance } from './distance';

export interface DeliveryStaffRecommendation {
  staffId: string;
  name: string;
  phone: string;
  score: number; // 0 to 100
  distanceKm: number;
  reasons: string[];
}

/**
 * Calculates matching scores for delivery staff and returns them ranked by score.
 */
export function recommendDeliveryStaff(
  pickupCity: string,
  pickupArea: string,
  pickupLat: number,
  pickupLng: number,
  staffList: {
    id: string;
    name: string;
    phone: string;
    city: string;
    area: string;
    serviceArea: string;
    availability: boolean;
    activeDeliveries: number;
    status: string;
    user: {
      profile?: {
        latitude: number;
        longitude: number;
      } | null;
    };
  }[]
): DeliveryStaffRecommendation[] {
  const recommendations: DeliveryStaffRecommendation[] = [];

  for (const staff of staffList) {
    let score = 0;
    const reasons: string[] = [];

    // 1. Availability (Weight: 40%)
    let availabilityScore = 0;
    if (staff.availability && staff.status !== 'INACTIVE') {
      availabilityScore = 40;
      reasons.push('✓ Available for new tasks');
    } else {
      reasons.push('✗ Currently unavailable');
    }
    score += availabilityScore;

    // 2. Service Area Match (Weight: 30%)
    let serviceAreaScore = 0;
    const areas = staff.serviceArea.toLowerCase().split(',').map(a => a.trim());
    const isAreaCovered = areas.some(a => a.includes(pickupArea.toLowerCase()) || pickupArea.toLowerCase().includes(a));
    const isCityMatch = staff.city.toLowerCase() === pickupCity.toLowerCase();

    if (isCityMatch && isAreaCovered) {
      serviceAreaScore = 30;
      reasons.push(`✓ Covers pickup area (${pickupArea})`);
    } else if (isCityMatch) {
      serviceAreaScore = 15;
      reasons.push(`⚠ Covers city (${pickupCity}) but area not listed in service area`);
    } else {
      reasons.push('✗ Out of service city');
    }
    score += serviceAreaScore;

    // 3. Workload (Weight: 20%)
    let workloadScore = 0;
    const active = staff.activeDeliveries;
    if (active === 0) {
      workloadScore = 20;
      reasons.push('✓ Excellent workload (0 active tasks)');
    } else if (active === 1) {
      workloadScore = 15;
      reasons.push('✓ Moderate workload (1 active task)');
    } else if (active === 2) {
      workloadScore = 10;
      reasons.push('⚠ Busy workload (2 active tasks)');
    } else {
      workloadScore = 5;
      reasons.push(`⚠ High workload (${active} active tasks)`);
    }
    score += workloadScore;

    // 4. Distance to Pickup (Weight: 10%)
    let distanceScore = 0;
    let distanceKm = 999;
    if (staff.user.profile) {
      distanceKm = calculateDistance(
        staff.user.profile.latitude,
        staff.user.profile.longitude,
        pickupLat,
        pickupLng
      );

      if (distanceKm <= 2) {
        distanceScore = 10;
        reasons.push(`✓ Very close (distance ${distanceKm} km)`);
      } else if (distanceKm <= 5) {
        distanceScore = 8;
        reasons.push(`✓ Nearby (distance ${distanceKm} km)`);
      } else if (distanceKm <= 10) {
        distanceScore = 5;
        reasons.push(`⚠ Moderate distance (${distanceKm} km)`);
      } else {
        distanceScore = 2;
        reasons.push(`⚠ Far distance (${distanceKm} km)`);
      }
    } else {
      reasons.push('⚠ Unknown staff location');
    }
    score += distanceScore;

    recommendations.push({
      staffId: staff.id,
      name: staff.name,
      phone: staff.phone,
      score,
      distanceKm,
      reasons,
    });
  }

  // Sort by score high-to-low, then by distance low-to-high
  return recommendations.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.distanceKm - b.distanceKm;
  });
}
