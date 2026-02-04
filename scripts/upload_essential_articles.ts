import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Gebruik de service role key voor schrijf-rechten
);

// Use OpenAI embeddings (1536 dims) – same as ComplianceEngine, so Supabase table dimensions match
const openaiKey = process.env.OPENAI_API_KEY?.trim();
if (!openaiKey) throw new Error('OPENAI_API_KEY is missing in .env');

const articles = [
  {
    ref: "Article 9",
    title: "Risk Management System",
    section: "Requirements for High-Risk AI",
    content: "Article 9 - Risk Management System\n\nREQUIREMENT: A risk management system shall be established, implemented, monitored and maintained in relation to high-risk AI systems. It must be a continuous iterative process throughout the entire lifecycle.\n\nSIMPLIFIED EXPLANATION: Organisaties die hoog-risico AI gebruiken moeten een systeem hebben dat continu risico's voor veiligheid en grondrechten identificeert en beperkt.\n\nREQUIREMENTS:\n- Systematische identificatie van risico's\n- Implementatie van beheersmaatregelen\n- Post-market monitoring van incidenten",
    simplified: "Continu proces om risico's van hoog-risico AI systemen te beheren en te minimaliseren."
  },
  {
    ref: "Article 10",
    title: "Data and Data Governance",
    section: "Requirements for High-Risk AI",
    content: "Article 10 - Data and Data Governance\n\nREQUIREMENT: High-risk AI systems shall be developed on the basis of training, validation and testing data sets that meet high quality criteria, including examination of possible biases.\n\nSIMPLIFIED EXPLANATION: De data die gebruikt wordt om hoog-risico AI te trainen moet van hoge kwaliteit zijn en gecontroleerd worden op discriminatie en vooroordelen.\n\nREQUIREMENTS:\n- Toepassing van passende data-architectuur\n- Analyse van mogelijke bias (vooroordelen)\n- Vaststellen van de geschiktheid van datasets",
    simplified: "Strikte eisen voor de kwaliteit en representativiteit van trainingsdata om bias te voorkomen."
  },
  {
    ref: "Article 14",
    title: "Human Oversight",
    section: "Requirements for High-Risk AI",
    content: "Article 14 - Human Oversight\n\nREQUIREMENT: High-risk AI systems shall be designed so they can be effectively overseen by natural persons. This includes the ability to disregard or override AI outputs.\n\nSIMPLIFIED EXPLANATION: Er moet altijd een mens zijn die de beslissing van een hoog-risico AI begrijpt en kan ingrijpen of de uitkomst kan negeren.\n\nREQUIREMENTS:\n- De mogelijkheid voor mensen om de AI uit te schakelen\n- Toezichthouders moeten de werking van het systeem volledig begrijpen",
    simplified: "Verplicht menselijk toezicht ('Human-in-the-loop') om AI-beslissingen te valideren of te blokkeren."
  },
  {
    ref: "Article 50",
    title: "Transparency Obligations",
    section: "Limited Risk Transparency",
    content: "Article 50 - Transparency Obligations\n\nREQUIREMENT: Providers shall ensure that AI systems intended to interact with natural persons are designed so that those persons are informed that they are interacting with an AI system.\n\nSIMPLIFIED EXPLANATION: Mensen hebben het recht om te weten wanneer ze met een AI communiceren, zoals bij een chatbot of AI-teksten.\n\nREQUIREMENTS:\n- Duidelijke melding bij interactie met AI\n- Transparantie over deepfakes en AI-gegenereerde content",
    simplified: "Verplichte melding aan gebruikers dat zij interactie hebben met een AI-systeem."
  },
  {
    ref: "Annex III",
    title: "High-Risk AI Categories",
    section: "Classification",
    content: "Annex III - List of High-Risk AI Systems\n\nHIGH-RISK DOMAINS: AI systems in the following areas are classified as high-risk:\n1. Biometrics\n2. Critical infrastructure\n3. Education (admissions, proctoring)\n4. Employment & HR (recruitment, CV screening)\n5. Access to essential services (credit scoring, healthcare)\n\nSIMPLIFIED EXPLANATION: AI in deze sectoren heeft een grote impact op mensenlevens en moet voldoen aan de strengste wetgeving.",
    simplified: "Overzicht van sectoren waar AI-gebruik altijd als hoog-risico wordt beschouwd."
  }
];

async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI API: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { data: { embedding: number[] }[] };
  return data.data[0].embedding;
}

async function upload() {
  for (const art of articles) {
    console.log(`⏳ Embedding genereren voor ${art.ref}...`);
    const embedding = await getEmbedding(art.content);

    const { error } = await supabase.from('compliance_knowledge').insert({
      content: art.content,
      embedding: embedding,
      metadata: {
        article_ref: art.ref,
        title: art.title,
        section: art.section,
        simplified_explanation: art.simplified
      }
    });

    if (error) {
      console.error(`❌ Fout bij ${art.ref}:`, error.message);
    } else {
      console.log(`✅ ${art.ref} succesvol toegevoegd aan Supabase!`);
    }
  }
}

upload();
