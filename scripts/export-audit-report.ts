/**
 * Export Audit Report as CSV for i-DEPOT Annex
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { writeFileSync } from 'fs';

dotenv.config({ path: '.env' });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function exportAuditReport() {
  console.log('Exporting audit report...');
  
  const { data: logs, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  
  if (error) {
    console.error('Error fetching logs:', error);
    return;
  }
  
  if (!logs || logs.length === 0) {
    console.log('No audit logs found');
    return;
  }
  
  // Build CSV
  let csv = 'Timestamp,Decision,Article Reference,Reason,Response Time (ms),Prompt\n';
  
  logs.forEach(log => {
    const timestamp = new Date(log.created_at).toISOString();
    const decision = log.decision;
    const articleRef = log.article_ref || 'N/A';
    const reason = (log.reason || '').replace(/"/g, '""').replace(/\n/g, ' ');
    const responseTime = log.response_time_ms || 0;
    const prompt = (log.prompt || '').replace(/"/g, '""').replace(/\n/g, ' ');
    
    csv += `"${timestamp}","${decision}","${articleRef}","${reason}","${responseTime}","${prompt}"\n`;
  });
  
  // Write to file
  const filename = `audit-report-${new Date().toISOString().split('T')[0]}.csv`;
  writeFileSync(filename, csv);
  
  console.log(`✅ Exported ${logs.length} audit logs to ${filename}`);
}

exportAuditReport();
