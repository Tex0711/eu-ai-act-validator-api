import type { APIRoute } from 'astro';
import { complianceEngine } from '@/services/compliance/ComplianceEngine';
import { GatekeeperRequestSchema, GatekeeperResponseSchema } from '@/lib/validation/schemas';
import { supabase } from '@/lib/supabase/client';
import {
  checkRateLimit,
  getLogIdentifier,
  recordRequestMetric,
  rateLimitIdentifier,
} from '@/lib/rate-limit';
import { logRequestMetric } from '@/lib/metrics';

/**
 * POST /api/v1/gatekeeper
 * 
 * Legal Guardrail API endpoint for EU AI Act compliance checking.
 * 
 * Request Body:
 * {
 *   "prompt": "string",
 *   "context": { "user_id": "string", "department": "string" } (optional)
 * }
 * 
 * Response:
 * {
 *   "decision": "ALLOW" | "DENY" | "WARNING",
 *   "reason": "string",
 *   "article_ref": "string" (optional),
 *   "audit_id": "uuid"
 * }
 */
const GATEKEEPER_PATH = '/api/v1/gatekeeper';

export const POST: APIRoute = async ({ request }) => {
  const startTime = Date.now();
  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    null;

  try {
    // Step 1: Validate API key
    const apiKey = request.headers.get('x-api-key');
    const expectedApiKey = process.env.API_KEY ?? import.meta.env.API_KEY;
    const identifierRedacted = apiKey ? getLogIdentifier(apiKey, clientIp) : 'key:missing';

    if (!expectedApiKey) {
      console.error('API_KEY environment variable not set');
      logRequestMetric({
        statusCode: 500,
        responseTimeMs: Date.now() - startTime,
        identifier: 'key:missing',
        path: GATEKEEPER_PATH,
        error: 'API_KEY not set',
      });
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!apiKey || apiKey !== expectedApiKey) {
      logRequestMetric({
        statusCode: 401,
        responseTimeMs: Date.now() - startTime,
        identifier: identifierRedacted,
        path: GATEKEEPER_PATH,
        error: 'Invalid or missing API key',
      });
      return new Response(
        JSON.stringify({ error: 'Invalid or missing API key' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Step 1b: Rate limit (per API key + optional IP)
    const identifier = rateLimitIdentifier(apiKey, clientIp);
    const rateLimitResult = checkRateLimit(identifier);
    if (!rateLimitResult.allowed) {
      const retryAfterMs = rateLimitResult.retryAfterMs ?? 60_000;
      logRequestMetric({
        statusCode: 429,
        responseTimeMs: Date.now() - startTime,
        identifier: getLogIdentifier(apiKey, clientIp),
        path: GATEKEEPER_PATH,
        error: 'Rate limit exceeded',
      });
      return new Response(
        JSON.stringify({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Retry after a short while.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil(retryAfterMs / 1000)),
          },
        }
      );
    }

    // Step 2: Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch (error) {
      logRequestMetric({
        statusCode: 400,
        responseTimeMs: Date.now() - startTime,
        identifier: getLogIdentifier(apiKey, clientIp),
        path: GATEKEEPER_PATH,
        error: 'Invalid JSON',
      });
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const validationResult = GatekeeperRequestSchema.safeParse(body);
    if (!validationResult.success) {
      logRequestMetric({
        statusCode: 400,
        responseTimeMs: Date.now() - startTime,
        identifier: getLogIdentifier(apiKey, clientIp),
        path: GATEKEEPER_PATH,
        error: 'Validation failed',
      });
      return new Response(
        JSON.stringify({
          error: 'Validation failed',
          details: validationResult.error.errors,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const validatedRequest = validationResult.data;

    // Step 3: Run compliance evaluation (PII stripped inside engine; masked prompt used for search, LLM, audit)
    const complianceResult = await complianceEngine.evaluate(validatedRequest);

    // Step 4: Log to audit trail (data minimization: only masked prompt stored)
    const responseTime = Date.now() - startTime;
    const promptForAudit = complianceResult.masked_prompt ?? validatedRequest.prompt;
    try {
      await supabase.from('audit_logs').insert({
        id: complianceResult.audit_id,
        prompt: promptForAudit,
        context: validatedRequest.context || null,
        decision: complianceResult.decision,
        reason: complianceResult.reason,
        article_ref: complianceResult.article_ref || null,
        response_time_ms: responseTime,
      });
    } catch (auditError) {
      // Log error but don't fail the request
      console.error('Failed to write audit log:', auditError instanceof Error ? auditError.message : String(auditError));
    }

    // Step 5: Validate and return response (omit masked_prompt from client response)
    const { masked_prompt: _omit, ...resultForClient } = complianceResult;
    const responseValidation = GatekeeperResponseSchema.safeParse(resultForClient);
    if (!responseValidation.success) {
      console.error('Invalid compliance result format:', JSON.stringify(responseValidation.error.errors));
      console.error('Compliance result was:', JSON.stringify(complianceResult));
      logRequestMetric({
        statusCode: 500,
        responseTimeMs: responseTime,
        identifier: getLogIdentifier(apiKey, clientIp),
        path: GATEKEEPER_PATH,
        error: 'Invalid response format',
      });
      return new Response(
        JSON.stringify({
          error: 'Internal error: Invalid response format',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Step 5b: Metrics – one structured log per request (anomaly + full request)
    const logId = getLogIdentifier(apiKey, clientIp);
    recordRequestMetric({
      identifierForLog: logId,
      promptLength: validatedRequest.prompt.length,
      responseTimeMs: responseTime,
      decision: resultForClient.decision,
    });
    logRequestMetric({
      statusCode: 200,
      responseTimeMs: responseTime,
      identifier: logId,
      path: GATEKEEPER_PATH,
      decision: resultForClient.decision,
      promptLength: validatedRequest.prompt.length,
    });

    return new Response(
      JSON.stringify(resultForClient),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Response-Time-Ms': responseTime.toString(),
        },
      }
    );
  } catch (error) {
    // Use error.message to avoid Node.js inspection crash on Gemini error objects
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Gatekeeper API error:', errMsg);
    const responseTime = Date.now() - startTime;
    logRequestMetric({
      statusCode: 500,
      responseTimeMs: responseTime,
      identifier: 'key:unknown',
      path: GATEKEEPER_PATH,
      error: errMsg,
    });

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'X-Response-Time-Ms': responseTime.toString(),
        },
      }
    );
  }
};
