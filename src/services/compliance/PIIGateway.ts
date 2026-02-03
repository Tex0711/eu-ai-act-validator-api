/**
 * Re-export PII Gateway from canonical location (src/lib/pii).
 * All national IDs use [ID]; order: Email → BSN → SSN → European IDs → Phone → Postcodes → Street → Names.
 */
export { stripPII, hasPII } from '../../lib/pii/PIIGateway';
