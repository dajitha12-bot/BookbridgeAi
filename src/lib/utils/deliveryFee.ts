import { db } from '../db/sqliteDb';

export interface DeliverySettings {
  tier0to5: number;
  tier5to10: number;
  tier10to20: number;
  tier20to30: number;
  tier30plus: number;
}

export function getDeliverySettings(): DeliverySettings {
  try {
    const row = db.prepare('SELECT * FROM delivery_settings WHERE id = 1').get() as any;
    if (row) {
      return {
        tier0to5: row.tier_0_5 || 30.0,
        tier5to10: row.tier_5_10 || 40.0,
        tier10to20: row.tier_10_20 || 60.0,
        tier20to30: row.tier_20_30 || 80.0,
        tier30plus: row.tier_30_plus || 100.0,
      };
    }
  } catch (e) {
    // Fallback default tier pricing
  }

  return {
    tier0to5: 30.0,
    tier5to10: 40.0,
    tier10to20: 60.0,
    tier20to30: 80.0,
    tier30plus: 100.0,
  };
}

export function updateDeliverySettings(settings: Partial<DeliverySettings>): boolean {
  try {
    const result = db.prepare(`
      UPDATE delivery_settings
      SET tier_0_5 = COALESCE(?, tier_0_5),
          tier_5_10 = COALESCE(?, tier_5_10),
          tier_10_20 = COALESCE(?, tier_10_20),
          tier_20_30 = COALESCE(?, tier_20_30),
          tier_30_plus = COALESCE(?, tier_30_plus),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `).run(
      settings.tier0to5 ?? null,
      settings.tier5to10 ?? null,
      settings.tier10to20 ?? null,
      settings.tier20to30 ?? null,
      settings.tier30plus ?? null
    );
    return result.changes > 0;
  } catch (e) {
    return false;
  }
}

export function calculateDeliveryChargeByDistance(distanceKm: number): number {
  const cfg = getDeliverySettings();

  if (distanceKm <= 5) return cfg.tier0to5;
  if (distanceKm <= 10) return cfg.tier5to10;
  if (distanceKm <= 20) return cfg.tier10to20;
  if (distanceKm <= 30) return cfg.tier20to30;
  return cfg.tier30plus;
}
