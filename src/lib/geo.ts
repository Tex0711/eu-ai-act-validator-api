/**
 * IP → country code for logging only (AVG/GDPR: no full IP in logs).
 * Uses geoip-lite (offline, no API key). Private/local IPs → "??".
 */

// @ts-expect-error no types; lookup(ip) returns { country: string, ... } or null
import geoip from 'geoip-lite';

/**
 * Resolve IP to ISO 3166-1 alpha-2 country code for log identifiers.
 * Returns "??" for private/local IPs, invalid IPs, or when lookup fails.
 * No full IP is ever returned; safe for stdout / log aggregators.
 */
export function ipToCountryCode(ip: string | null | undefined): string {
  if (!ip || typeof ip !== 'string' || ip.trim() === '') return '??';
  const lookup = geoip.lookup(ip.trim());
  if (!lookup || !lookup.country) return '??';
  return lookup.country;
}
