/**
 * Direct Vector Search Test
 * Tests the RPC function directly to see what's happening
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseKey || !openaiApiKey) {
  throw new Error('Missing environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testVectorSearch() {
  console.log('🔍 Testing Vector Search Directly\n');

  // 1. Get a test embedding
  console.log('1. Generating test embedding...');
  const testPrompt = 'emotion recognition for HR employees';
  
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: testPrompt,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const embedding = data.data[0].embedding;
  console.log(`   ✓ Generated embedding (${embedding.length} dimensions)`);
  console.log(`   ✓ First 5 values: [${embedding.slice(0, 5).join(', ')}...]`);

  // 2. Test RPC function with different thresholds
  console.log('\n2. Testing RPC function...');
  
  const thresholds = [0.7, 0.5, 0.3, 0.1];
  
  for (const threshold of thresholds) {
    console.log(`\n   Testing with threshold ${threshold}:`);
    
    try {
      const { data: results, error } = await supabase.rpc('match_compliance_knowledge', {
        query_embedding: embedding,
        match_threshold: threshold,
        match_count: 3,
      });

      if (error) {
        console.error(`     ❌ Error:`, error);
        console.error(`     Details:`, JSON.stringify(error, null, 2));
      } else {
        console.log(`     ✓ Returned ${results?.length || 0} results`);
        if (results && results.length > 0) {
          results.forEach((result: any, idx: number) => {
            const ref = result.metadata?.article_ref || 'Unknown';
            const similarity = result.similarity ? (result.similarity * 100).toFixed(1) : 'N/A';
            console.log(`       [${idx + 1}] ${ref}: ${similarity}% similarity`);
            console.log(`           Content preview: ${result.content?.substring(0, 80)}...`);
          });
        } else {
          console.log(`     ⚠️  No results found`);
        }
      }
    } catch (error) {
      console.error(`     ❌ Exception:`, error);
    }
  }

  // 3. Check if embeddings are stored correctly
  console.log('\n3. Checking stored embeddings...');
  const { data: articles, error: articlesError } = await supabase
    .from('compliance_knowledge')
    .select('id, metadata')
    .limit(3);

  if (articlesError) {
    console.error('   ❌ Error:', articlesError);
  } else {
    console.log(`   ✓ Found ${articles?.length || 0} articles`);
    articles?.forEach((article, idx) => {
      const ref = article.metadata?.article_ref || 'Unknown';
      console.log(`     [${idx + 1}] ${ref}`);
    });
  }
}

testVectorSearch().catch(console.error);
