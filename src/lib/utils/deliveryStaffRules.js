import { calculateDistance } from "./distance";
function recommendDeliveryStaff(pickupCity, pickupArea, pickupLat, pickupLng, staffList) {
  const recommendations = [];
  for (const staff of staffList) {
    let score = 0;
    const reasons = [];
    let availabilityScore = 0;
    if (staff.availability && staff.status !== "INACTIVE") {
      availabilityScore = 40;
      reasons.push("\u2713 Available for new tasks");
    } else {
      reasons.push("\u2717 Currently unavailable");
    }
    score += availabilityScore;
    let serviceAreaScore = 0;
    const areas = staff.serviceArea.toLowerCase().split(",").map((a) => a.trim());
    const isAreaCovered = areas.some((a) => a.includes(pickupArea.toLowerCase()) || pickupArea.toLowerCase().includes(a));
    const isCityMatch = staff.city.toLowerCase() === pickupCity.toLowerCase();
    if (isCityMatch && isAreaCovered) {
      serviceAreaScore = 30;
      reasons.push(`\u2713 Covers pickup area (${pickupArea})`);
    } else if (isCityMatch) {
      serviceAreaScore = 15;
      reasons.push(`\u26A0 Covers city (${pickupCity}) but area not listed in service area`);
    } else {
      reasons.push("\u2717 Out of service city");
    }
    score += serviceAreaScore;
    let workloadScore = 0;
    const active = staff.activeDeliveries;
    if (active === 0) {
      workloadScore = 20;
      reasons.push("\u2713 Excellent workload (0 active tasks)");
    } else if (active === 1) {
      workloadScore = 15;
      reasons.push("\u2713 Moderate workload (1 active task)");
    } else if (active === 2) {
      workloadScore = 10;
      reasons.push("\u26A0 Busy workload (2 active tasks)");
    } else {
      workloadScore = 5;
      reasons.push(`\u26A0 High workload (${active} active tasks)`);
    }
    score += workloadScore;
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
        reasons.push(`\u2713 Very close (distance ${distanceKm} km)`);
      } else if (distanceKm <= 5) {
        distanceScore = 8;
        reasons.push(`\u2713 Nearby (distance ${distanceKm} km)`);
      } else if (distanceKm <= 10) {
        distanceScore = 5;
        reasons.push(`\u26A0 Moderate distance (${distanceKm} km)`);
      } else {
        distanceScore = 2;
        reasons.push(`\u26A0 Far distance (${distanceKm} km)`);
      }
    } else {
      reasons.push("\u26A0 Unknown staff location");
    }
    score += distanceScore;
    recommendations.push({
      staffId: staff.id,
      name: staff.name,
      phone: staff.phone,
      score,
      distanceKm,
      reasons
    });
  }
  return recommendations.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.distanceKm - b.distanceKm;
  });
}
export {
  recommendDeliveryStaff
};
