/**
 * Database Seeding Script
 * 
 * This script helps populate the compliance_knowledge table with EU AI Act content.
 * 
 * Usage:
 * 1. Prepare your EU AI Act text chunks (JSON format)
 * 2. Update the SAMPLE_ARTICLES array below
 * 3. Run: npx tsx scripts/seed-db.ts
 * 
 * Note: You'll need to generate embeddings for each article chunk.
 * This script provides a template - you'll need to implement embedding generation.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * High-Quality EU AI Act Law Chunks with Real-World Examples
 * Each chunk is optimized for semantic search and includes practical examples
 */
const SAMPLE_ARTICLES = [
  // Article 5(a) - Subliminal Manipulation
  {
    content: `Article 5(1)(a) - Prohibited: Subliminal and Manipulative AI Techniques

PROHIBITION: The placing on the market, putting into service or use of an AI system that deploys subliminal techniques beyond a person's consciousness or purposefully manipulative or deceptive techniques, with the objective or effect of materially distorting behaviour by appreciably impairing their ability to make an informed decision, thereby causing them to take a decision they would not have otherwise taken, in a manner that causes or is reasonably likely to cause significant harm.

SIMPLIFIED EXPLANATION: AI systems cannot use hidden psychological manipulation to trick people into making harmful decisions they wouldn't make otherwise.

REAL-WORLD VIOLATIONS:
- An AI-powered gambling app that uses subliminal audio cues to encourage excessive betting
- A social media algorithm that manipulates users' emotions through hidden content timing to drive harmful behavior
- An e-commerce AI that uses subconscious visual triggers to trick vulnerable users into expensive purchases`,
    metadata: {
      article_ref: 'Article 5(1)(a)',
      section: 'Prohibited AI practices',
      title: 'Subliminal and manipulative techniques',
      simplified_explanation: 'AI cannot use hidden psychological manipulation to trick people into harmful decisions',
    },
  },
  // Article 5(b) - Exploiting Vulnerabilities
  {
    content: `Article 5(1)(b) - Prohibited: Exploiting Vulnerabilities

PROHIBITION: The placing on the market, putting into service or use of an AI system that exploits any of the vulnerabilities of a natural person or a specific group of persons due to their age, disability or a specific social or economic situation, with the objective or effect of materially distorting the behaviour of that person or a person belonging to that group in a manner that causes or is reasonably likely to cause significant harm.

SIMPLIFIED EXPLANATION: AI systems cannot target and exploit vulnerable groups (children, elderly, disabled, economically disadvantaged) to manipulate them into harmful actions.

REAL-WORLD VIOLATIONS:
- An AI chatbot targeting elderly users with cognitive decline to sell fraudulent insurance
- A gaming AI that exploits children's impulsivity to encourage in-app purchases leading to financial harm
- A loan application AI that targets economically vulnerable individuals with predatory terms`,
    metadata: {
      article_ref: 'Article 5(1)(b)',
      section: 'Prohibited AI practices',
      title: 'Exploiting vulnerabilities',
      simplified_explanation: 'AI cannot exploit vulnerable groups (children, elderly, disabled, poor) to manipulate them into harmful actions',
    },
  },
  // Article 5(c) - Social Scoring
  {
    content: `Article 5(1)(c) - Prohibited: Social Scoring Systems

PROHIBITION: The placing on the market, putting into service or use of AI systems for the evaluation or classification of natural persons or groups of persons over a certain period of time based on their social behaviour or known, inferred or predicted personal or personality characteristics, with the social score leading to either or both: (i) detrimental treatment in social contexts unrelated to where data was collected; (ii) detrimental treatment that is unjustified or disproportionate to their social behaviour.

SIMPLIFIED EXPLANATION: AI systems cannot create social credit scores that rate people's trustworthiness based on their behavior and use those scores to unfairly treat them in unrelated contexts.

REAL-WORLD VIOLATIONS:
- A government AI system that scores citizens based on social media activity and denies them access to public services
- An employer using an AI that scores job candidates based on their online shopping habits
- A bank using an AI social score based on social media posts to deny loans`,
    metadata: {
      article_ref: 'Article 5(1)(c)',
      section: 'Prohibited AI practices',
      title: 'Social scoring',
      simplified_explanation: 'AI cannot create social credit scores that unfairly treat people based on behavior in unrelated contexts',
    },
  },
  // Article 5(d) - Predictive Policing
  {
    content: `Article 5(1)(d) - Prohibited: Predictive Crime Risk Assessment

PROHIBITION: The placing on the market, putting into service for this specific purpose, or the use of an AI system for making risk assessments of natural persons in order to assess or predict the risk of a natural person committing a criminal offence, based solely on the profiling of a natural person or on assessing their personality traits and characteristics. This prohibition does NOT apply to AI systems used to support human assessment of involvement in criminal activity based on objective and verifiable facts directly linked to a criminal activity.

SIMPLIFIED EXPLANATION: AI cannot predict whether someone will commit a crime based only on their personality or profiling. It can only help assess involvement in actual crimes using objective evidence.

REAL-WORLD VIOLATIONS:
- A police AI that predicts crime risk based on a person's neighborhood, age, and social media activity
- An AI system that flags individuals as "high risk" for future offenses based on personality assessments
- Predictive policing AI that targets people based on demographic profiling without evidence of actual crimes`,
    metadata: {
      article_ref: 'Article 5(1)(d)',
      section: 'Prohibited AI practices',
      title: 'Predictive crime risk assessment',
      simplified_explanation: 'AI cannot predict future crimes based on personality profiling, only assess involvement in actual crimes with evidence',
    },
  },
  // Article 5(e) - Facial Recognition Databases
  {
    content: `Article 5(1)(e) - Prohibited: Untargeted Facial Recognition Scraping

PROHIBITION: The placing on the market, putting into service for this specific purpose, or the use of AI systems that create or expand facial recognition databases through the untargeted scraping of facial images from the internet or CCTV footage.

SIMPLIFIED EXPLANATION: AI systems cannot build facial recognition databases by indiscriminately collecting faces from the internet or security cameras without consent.

REAL-WORLD VIOLATIONS:
- An AI company scraping social media photos to build a facial recognition database
- A security firm collecting faces from public CCTV cameras to create identification databases
- A marketing AI that scrapes profile pictures from websites to build customer recognition systems`,
    metadata: {
      article_ref: 'Article 5(1)(e)',
      section: 'Prohibited AI practices',
      title: 'Untargeted facial recognition scraping',
      simplified_explanation: 'AI cannot build facial recognition databases by scraping faces from internet or CCTV without consent',
    },
  },
  // Article 5(f) - Emotion Recognition in Workplace/Education
  {
    content: `Article 5(1)(f) - Prohibited: Emotion Recognition in Workplace and Education

PROHIBITION: The placing on the market, putting into service for this specific purpose, or the use of AI systems to infer emotions of a natural person in the areas of workplace and education institutions, except where the use of the AI system is intended to be put in place or into the market for medical or safety reasons.

SIMPLIFIED EXPLANATION: AI cannot detect or infer emotions of employees or students in workplaces and schools, unless it's for medical or safety purposes.

REAL-WORLD VIOLATIONS:
- An AI system monitoring employee facial expressions to detect stress or dissatisfaction
- A classroom AI that analyzes student emotions to assess engagement
- A workplace surveillance AI that tracks emotional states of workers for performance evaluation
- An HR AI that uses emotion recognition during job interviews`,
    metadata: {
      article_ref: 'Article 5(1)(f)',
      section: 'Prohibited AI practices',
      title: 'Emotion recognition in workplace and education',
      simplified_explanation: 'AI cannot detect emotions of employees or students unless for medical or safety reasons',
    },
  },
  // Article 5(g) - Biometric Categorization
  {
    content: `Article 5(1)(g) - Prohibited: Biometric Categorization by Sensitive Attributes

PROHIBITION: The placing on the market, putting into service for this specific purpose, or the use of biometric categorisation systems that categorise individually natural persons based on their biometric data to deduce or infer their race, political opinions, trade union membership, religious or philosophical beliefs, sex life or sexual orientation. This prohibition does not cover lawful labeling or filtering of biometric datasets or categorizing biometric data in law enforcement.

SIMPLIFIED EXPLANATION: AI cannot use biometric data (faces, fingerprints, etc.) to categorize people by race, political views, religion, sexual orientation, or other sensitive characteristics.

REAL-WORLD VIOLATIONS:
- An AI system that categorizes people by race using facial recognition
- A security AI that infers political affiliations from biometric data
- A hiring AI that uses facial analysis to deduce sexual orientation
- A marketing AI that categorizes customers by religion based on biometric features`,
    metadata: {
      article_ref: 'Article 5(1)(g)',
      section: 'Prohibited AI practices',
      title: 'Biometric categorization by sensitive attributes',
      simplified_explanation: 'AI cannot use biometrics to categorize people by race, politics, religion, or sexual orientation',
    },
  },
  // Article 5(h) - Real-time Biometric Identification
  {
    content: `Article 5(1)(h) - Prohibited: Real-Time Remote Biometric Identification

PROHIBITION: The use of 'real-time' remote biometric identification systems in publicly accessible spaces for the purposes of law enforcement, UNLESS strictly necessary for: (i) targeted search for specific victims of abduction, trafficking, sexual exploitation, or missing persons; (ii) prevention of specific, substantial and imminent threat to life or physical safety or genuine terrorist attack; (iii) localization or identification of person suspected of criminal offence punishable by at least 4 years imprisonment.

SIMPLIFIED EXPLANATION: Police cannot use real-time facial recognition in public spaces except for specific emergencies like finding missing children, preventing terrorist attacks, or catching serious criminals.

REAL-WORLD VIOLATIONS:
- Real-time facial recognition for general surveillance of public spaces
- Using live biometric identification to track protesters or political gatherings
- Continuous monitoring of public transportation with facial recognition
- Real-time identification for minor offenses or general law enforcement`,
    metadata: {
      article_ref: 'Article 5(1)(h)',
      section: 'Prohibited AI practices',
      title: 'Real-time remote biometric identification',
      simplified_explanation: 'Police cannot use real-time facial recognition in public except for emergencies, missing persons, or serious crimes',
    },
  },
  // Article 6 & Annex III - High-Risk AI Systems
  {
    content: `Article 6 & Annex III - High-Risk AI Systems: Employment and Recruitment

HIGH-RISK CLASSIFICATION: AI systems intended to be used for the recruitment or selection of natural persons, in particular to place targeted job advertisements, to analyse and filter job applications, and to evaluate candidates. AI systems intended to make decisions affecting terms of work-related relationships, promotion or termination, to allocate tasks based on individual behaviour or personal traits, or to monitor and evaluate performance and behaviour.

SIMPLIFIED EXPLANATION: AI systems used for hiring, firing, promotion, task allocation, and performance monitoring are high-risk and must meet strict requirements including transparency, human oversight, and accuracy.

REAL-WORLD EXAMPLES:
- AI resume screening systems that filter job applications
- Automated video interview analysis tools
- AI systems that monitor employee productivity and behavior
- Automated systems for promotion decisions
- AI tools that allocate work based on personality assessments`,
    metadata: {
      article_ref: 'Article 6 & Annex III(4)',
      section: 'High-risk AI systems',
      title: 'Employment and recruitment AI',
      simplified_explanation: 'AI for hiring, firing, promotion, and performance monitoring is high-risk and requires strict compliance',
    },
  },
  // Article 6 & Annex III - Education
  {
    content: `Article 6 & Annex III - High-Risk AI Systems: Education and Vocational Training

HIGH-RISK CLASSIFICATION: AI systems intended to: (a) determine access or admission or assign persons to educational institutions; (b) evaluate learning outcomes and steer learning processes; (c) assess appropriate level of education; (d) monitor and detect prohibited behaviour during tests.

SIMPLIFIED EXPLANATION: AI systems that decide who gets into schools, evaluate students, determine educational levels, or monitor test-taking are high-risk and require compliance with EU AI Act requirements.

REAL-WORLD EXAMPLES:
- AI systems that screen college applications
- Automated grading systems that influence student progression
- AI that monitors students during online exams for cheating
- Systems that assign students to different educational tracks
- AI tools that evaluate student performance and recommend interventions`,
    metadata: {
      article_ref: 'Article 6 & Annex III(3)',
      section: 'High-risk AI systems',
      title: 'Education and vocational training AI',
      simplified_explanation: 'AI for admissions, grading, and educational assessment is high-risk and requires compliance',
    },
  },
  // Article 4 - AI Literacy
  {
    content: `Article 4 - AI Literacy Requirements

REQUIREMENT: Providers and deployers of AI systems shall take measures to ensure, to their best extent, a sufficient level of AI literacy of their staff and other persons dealing with the operation and use of AI systems on their behalf, taking into account their technical knowledge, experience, education and training and the context the AI systems are to be used in, and considering the persons or groups of persons on whom the AI systems are to be used.

SIMPLIFIED EXPLANATION: Companies using AI must train their employees to understand how the AI works, its limitations, and its impacts. Training should match each person's role and the context of use.

REAL-WORLD EXAMPLES:
- HR staff using AI hiring tools must understand bias risks and how to interpret results
- Teachers using AI grading systems need training on accuracy limitations
- Healthcare workers using diagnostic AI must understand when to override AI recommendations
- Law enforcement using AI systems must be trained on proper use and limitations`,
    metadata: {
      article_ref: 'Article 4',
      section: 'General provisions',
      title: 'AI literacy requirements',
      simplified_explanation: 'Companies must train employees to understand AI systems, their limitations, and impacts',
    },
  },
  // Article 50 - Transparency for Certain AI Systems
  {
    content: `Article 50 - Transparency Obligations for AI System Providers and Deployers

REQUIREMENTS:
1. DEEPFAKES & SYNTHETIC CONTENT: Providers must ensure AI-generated or manipulated images, audio or video content (deepfakes) are marked in a machine-readable format and detectable as artificially generated. Deployers must disclose that the content has been artificially generated or manipulated.

2. CHATBOTS & AI INTERACTION: Deployers must ensure that natural persons are informed they are interacting with an AI system, unless obvious from circumstances. This includes AI chatbots, virtual assistants, and automated customer service.

3. EMOTION RECOGNITION & BIOMETRIC CATEGORIZATION: Deployers of emotion recognition or biometric categorization systems must inform natural persons exposed to them about the operation of the system and process personal data in compliance with GDPR.

4. TEXT GENERATION: Providers of AI systems that generate synthetic text for public information purposes must ensure outputs are marked as artificially generated unless reviewed by a natural person responsible for the content.

SIMPLIFIED EXPLANATION: AI-generated content must be labeled, users must be told when they're talking to AI, and deepfakes must be detectable.

REAL-WORLD EXAMPLES:
- A chatbot on a website must disclose it's an AI, not a human
- AI-generated images must contain metadata marking them as synthetic
- Video deepfakes must be labeled as artificially created
- AI-written news articles must be marked as AI-generated`,
    metadata: {
      article_ref: 'Article 50',
      section: 'Transparency obligations',
      title: 'Transparency for AI systems and content',
      simplified_explanation: 'AI content must be labeled, users informed when interacting with AI, deepfakes must be detectable',
    },
  },
  // Article 51-52 - General Purpose AI Models
  {
    content: `Article 51-52 - General-Purpose AI Models (GPAI) Classification and Obligations

DEFINITION: A general-purpose AI model is an AI model that is trained with a large amount of data using self-supervision at scale, displays significant generality, and is capable of competently performing a wide range of distinct tasks. This includes foundation models like GPT, Claude, Gemini, LLaMA, etc.

PROVIDER OBLIGATIONS (Article 53):
1. Maintain up-to-date technical documentation
2. Provide information and documentation to downstream providers
3. Establish a policy to respect EU copyright law
4. Make publicly available a sufficiently detailed summary about training data content

SYSTEMIC RISK MODELS (Article 51):
GPAI models with systemic risk are those trained with more than 10^25 FLOPs of compute, or designated by the Commission due to high-impact capabilities. These require additional obligations.

ADDITIONAL SYSTEMIC RISK OBLIGATIONS (Article 55):
1. Perform model evaluations and adversarial testing
2. Assess and mitigate systemic risks
3. Track, document and report serious incidents
4. Ensure adequate cybersecurity protections

SIMPLIFIED EXPLANATION: Companies providing foundation models like GPT must document their training data, respect copyright, and if their model is very large (>10^25 FLOPs), perform additional safety testing.

REAL-WORLD EXAMPLES:
- OpenAI, Anthropic, Google, Meta must comply with GPAI obligations for their foundation models
- Very large models require adversarial testing and incident reporting
- All GPAI providers must document training data sources
- Downstream companies using GPAI must receive adequate documentation`,
    metadata: {
      article_ref: 'Article 51-55',
      section: 'General-purpose AI models',
      title: 'GPAI model classification and obligations',
      simplified_explanation: 'Foundation models like GPT require documentation, copyright compliance, and large models need additional safety testing',
    },
  },
  // Article 6 & Annex III - Biometric Systems
  {
    content: `Article 6 & Annex III(1) - High-Risk AI Systems: Biometric Identification and Categorization

HIGH-RISK CLASSIFICATION: AI systems intended to be used for the biometric identification of natural persons (excluding verification/authentication). AI systems for biometric categorization based on sensitive or protected attributes or characteristics.

SIMPLIFIED EXPLANATION: AI systems that identify who someone is from their biometrics (face, fingerprint, etc.) or categorize people using biometric data are high-risk unless used only for verification.

KEY DISTINCTION:
- VERIFICATION (allowed without high-risk status): Confirming a person is who they claim to be (1:1 matching)
- IDENTIFICATION (high-risk): Determining who a person is from a database (1:N matching)

REAL-WORLD EXAMPLES (HIGH-RISK):
- Facial recognition systems that search a database to identify unknown individuals
- AI systems that use biometrics to categorize people by age, gender, or ethnicity
- Airport facial recognition for identifying travelers against watchlists
- Stadium entry systems that identify ticketholders from facial scans`,
    metadata: {
      article_ref: 'Article 6 & Annex III(1)',
      section: 'High-risk AI systems',
      title: 'Biometric identification and categorization',
      simplified_explanation: 'AI for biometric identification (not just verification) is high-risk',
    },
  },
  // Article 6 & Annex III - Critical Infrastructure
  {
    content: `Article 6 & Annex III(2) - High-Risk AI Systems: Critical Infrastructure

HIGH-RISK CLASSIFICATION: AI systems intended to be used as safety components in the management and operation of critical digital infrastructure, road traffic, or the supply of water, gas, heating or electricity.

SIMPLIFIED EXPLANATION: AI systems that control critical infrastructure (power grids, water systems, traffic management) are high-risk and must meet strict safety requirements.

REAL-WORLD EXAMPLES:
- AI systems controlling power grid distribution and load balancing
- Traffic light AI that manages city-wide traffic flow
- AI systems managing water treatment and distribution
- Smart grid AI that balances electricity supply and demand
- AI controlling gas pipeline pressure and flow

REQUIREMENTS FOR DEPLOYERS:
- Ensure human oversight capability
- Monitor for risks during operation
- Inform authorities of serious incidents
- Use only for intended purpose with proper documentation`,
    metadata: {
      article_ref: 'Article 6 & Annex III(2)',
      section: 'High-risk AI systems',
      title: 'Critical infrastructure management AI',
      simplified_explanation: 'AI controlling power grids, water, traffic, and other critical infrastructure is high-risk',
    },
  },
  // Article 6 & Annex III - Law Enforcement
  {
    content: `Article 6 & Annex III(6) - High-Risk AI Systems: Law Enforcement

HIGH-RISK CLASSIFICATION: AI systems intended to be used by law enforcement authorities for:
(a) Individual risk assessment of natural persons (recidivism, flight risk, etc.)
(b) Polygraphs and similar tools to detect deception
(c) Evaluation of reliability of evidence in criminal investigations
(d) Predicting occurrence or reoccurrence of criminal offenses based on profiling
(e) Profiling during detection, investigation or prosecution
(f) Crime analytics regarding natural persons

SIMPLIFIED EXPLANATION: AI used by police and law enforcement for risk assessment, lie detection, evidence evaluation, crime prediction, or profiling is high-risk.

REAL-WORLD EXAMPLES:
- AI systems that assess whether a detained person is a flight risk
- Polygraph AI or deception detection systems
- AI that evaluates the reliability of witness testimony
- Crime hotspot prediction systems that involve personal data
- AI profiling tools used in criminal investigations

IMPORTANT: This is separate from the PROHIBITION in Article 5(1)(d) which bans predictive crime assessment based solely on profiling.`,
    metadata: {
      article_ref: 'Article 6 & Annex III(6)',
      section: 'High-risk AI systems',
      title: 'Law enforcement AI systems',
      simplified_explanation: 'AI for police risk assessment, lie detection, evidence evaluation, and profiling is high-risk',
    },
  },
  // Article 6 & Annex III - Immigration and Border Control
  {
    content: `Article 6 & Annex III(7) - High-Risk AI Systems: Migration, Asylum and Border Control

HIGH-RISK CLASSIFICATION: AI systems intended to be used by competent public authorities for:
(a) Polygraphs or similar tools to detect deception
(b) Assessing risk (security, irregular migration, health) posed by natural persons
(c) Assisting examination of applications for asylum, visa and residence permits
(d) Detection, recognition or identification of natural persons (excluding document verification)

SIMPLIFIED EXPLANATION: AI used in immigration and border control for lie detection, risk assessment, visa/asylum processing, or identifying people is high-risk.

REAL-WORLD EXAMPLES:
- AI systems that assess asylum applications for fraud indicators
- Border control AI that evaluates migration risk
- AI that assists in visa application processing
- Facial recognition at border crossings (beyond document verification)
- AI polygraph systems for immigration interviews

REQUIREMENTS:
- Human oversight mandatory
- Transparent to affected individuals
- Must not discriminate based on nationality, origin, religion, etc.`,
    metadata: {
      article_ref: 'Article 6 & Annex III(7)',
      section: 'High-risk AI systems',
      title: 'Migration and border control AI',
      simplified_explanation: 'AI for visa/asylum processing, border risk assessment, and migrant identification is high-risk',
    },
  },
  // Article 6 & Annex III - Justice and Democracy
  {
    content: `Article 6 & Annex III(8) - High-Risk AI Systems: Administration of Justice and Democratic Processes

HIGH-RISK CLASSIFICATION: AI systems intended to be used by judicial authorities for:
(a) Researching and interpreting facts and the law and applying the law to facts
(b) Alternative dispute resolution

AI systems intended to influence the outcome of elections or referendums, or voting behavior of natural persons.

SIMPLIFIED EXPLANATION: AI used by judges to interpret law or for dispute resolution is high-risk. AI that could influence elections or voting is also high-risk.

REAL-WORLD EXAMPLES:
- AI systems that assist judges in legal research and case analysis
- Automated dispute resolution platforms
- AI that helps interpret complex legislation
- Political advertising AI that micro-targets voters
- AI systems that could influence electoral outcomes

IMPORTANT DISTINCTION:
- AI tools for voters to find polling places or understand ballot measures are generally NOT high-risk
- AI used to influence voting decisions or electoral outcomes IS high-risk`,
    metadata: {
      article_ref: 'Article 6 & Annex III(8)',
      section: 'High-risk AI systems',
      title: 'Justice and democratic processes AI',
      simplified_explanation: 'AI for judicial decision-making or influencing elections is high-risk',
    },
  },
  // Article 6 & Annex III - Essential Services
  {
    content: `Article 6 & Annex III(5) - High-Risk AI Systems: Access to Essential Services

HIGH-RISK CLASSIFICATION: AI systems intended to be used to evaluate:
(a) Eligibility for essential public assistance benefits and services
(b) Creditworthiness of natural persons (with exceptions for fraud detection)
(c) Risk assessment and pricing for life and health insurance

SIMPLIFIED EXPLANATION: AI systems that decide who gets public benefits, credit, or insurance pricing are high-risk and require transparency and human oversight.

REAL-WORLD EXAMPLES:
- AI that determines eligibility for unemployment benefits
- Credit scoring AI used for loan decisions
- AI that prices life or health insurance based on individual risk
- Systems that decide eligibility for social housing
- AI that evaluates applications for disability benefits

EXCEPTIONS:
- AI used for fraud detection in small loans is exempt from high-risk classification
- Systems that only detect fraud patterns without making eligibility decisions may be exempt`,
    metadata: {
      article_ref: 'Article 6 & Annex III(5)',
      section: 'High-risk AI systems',
      title: 'Essential services and credit AI',
      simplified_explanation: 'AI for public benefits eligibility, credit scoring, and insurance pricing is high-risk',
    },
  },
  // Article 99-101 - Penalties and Enforcement
  {
    content: `Articles 99-101 - Penalties and Enforcement

FINES FOR VIOLATIONS:
1. PROHIBITED AI PRACTICES (Article 5 violations):
   - Up to €35 million OR 7% of worldwide annual turnover (whichever is higher)
   
2. HIGH-RISK AI NON-COMPLIANCE (Article 6 violations):
   - Up to €15 million OR 3% of worldwide annual turnover (whichever is higher)
   
3. INCORRECT INFORMATION TO AUTHORITIES:
   - Up to €7.5 million OR 1% of worldwide annual turnover (whichever is higher)

4. SME AND STARTUP CONSIDERATIONS:
   - Penalties may be reduced for SMEs and startups based on economic viability
   - Administrative fines must be effective, proportionate and dissuasive

ENFORCEMENT AUTHORITIES:
- Each Member State designates national competent authorities
- Market surveillance authorities monitor AI systems on the market
- Notified bodies assess conformity of high-risk AI systems

SIMPLIFIED EXPLANATION: Violations of prohibited AI practices can result in massive fines up to 7% of global revenue. High-risk AI violations face fines up to 3% of revenue.

REAL-WORLD IMPLICATIONS:
- A company with €10 billion revenue could face €700 million fine for Article 5 violations
- Even smaller companies face significant penalties relative to their size
- Regulators have broad authority to investigate and sanction violations`,
    metadata: {
      article_ref: 'Articles 99-101',
      section: 'Penalties and enforcement',
      title: 'Fines and enforcement mechanisms',
      simplified_explanation: 'Fines up to 7% of global revenue for prohibited AI, 3% for high-risk violations',
    },
  },
  // Article 13 - Transparency and Information
  {
    content: `Article 13 - Transparency and Provision of Information to Deployers

REQUIREMENT: High-risk AI systems shall be designed and developed in such a way as to ensure that their operation is sufficiently transparent to enable deployers to interpret the system's output and use it appropriately.

KEY PROVISIONS:
1. Instructions for use must accompany the system
2. Instructions must include:
   - Identity and contact details of the provider
   - Characteristics, capabilities and limitations of the AI system
   - Changes to the system over its lifecycle
   - Human oversight measures
   - Expected lifetime and maintenance requirements
   - Technical specifications including input data requirements
   - Accuracy, robustness and cybersecurity metrics
   
3. EXPLAINABILITY: Output must be interpretable by deployers
4. LOGGING: Automatic logging of events must be enabled

SIMPLIFIED EXPLANATION: High-risk AI must come with clear instructions, be explainable, and log its activities so users understand how it works.

REAL-WORLD EXAMPLES:
- An HR AI must explain why it rejected a candidate
- A credit AI must provide reasons for its decisions
- Medical AI must indicate confidence levels in diagnoses
- All high-risk AI must maintain audit logs`,
    metadata: {
      article_ref: 'Article 13',
      section: 'Requirements for high-risk AI',
      title: 'Transparency and information requirements',
      simplified_explanation: 'High-risk AI must be explainable, include instructions, and maintain audit logs',
    },
  },
  // Article 14 - Human Oversight
  {
    content: `Article 14 - Human Oversight

REQUIREMENT: High-risk AI systems shall be designed and developed in such a way as to ensure that they can be effectively overseen by natural persons during the period in which the AI system is in use.

KEY PROVISIONS:
1. UNDERSTANDING: Human overseers must be able to properly understand the system's capabilities and limitations
2. MONITORING: Humans must be able to observe the system's operation
3. INTERPRETATION: Humans must be able to correctly interpret the AI system's output
4. INTERVENTION: Humans must be able to decide not to use the AI system, override its output, or stop the system
5. AWARENESS: Humans must remain aware of automation bias risks

IMPLEMENTATION:
- Provider must build oversight capabilities into the system
- Deployer must assign competent persons to oversight roles
- Oversight measures must be proportionate to the risks

SIMPLIFIED EXPLANATION: Humans must be able to understand, monitor, and override high-risk AI systems. The system must not operate autonomously without human control.

REAL-WORLD EXAMPLES:
- A judge using AI legal research must make the final decision independently
- HR using AI screening must review and can override recommendations
- Border control AI must allow officers to override identification results
- Medical AI must support, not replace, physician judgment`,
    metadata: {
      article_ref: 'Article 14',
      section: 'Requirements for high-risk AI',
      title: 'Human oversight requirements',
      simplified_explanation: 'Humans must be able to understand, monitor, and override high-risk AI systems',
    },
  },
  // Article 26 - Obligations of Deployers
  {
    content: `Article 26 - Obligations of Deployers of High-Risk AI Systems

DEPLOYER RESPONSIBILITIES:
1. APPROPRIATE USE: Use high-risk AI systems in accordance with instructions of use
2. HUMAN OVERSIGHT: Assign natural persons with competence, training and authority to exercise oversight
3. INPUT DATA: Ensure input data is relevant and sufficiently representative for intended purpose
4. MONITORING: Monitor the operation of the AI system based on instructions for use
5. INFORM PROVIDER: Inform provider of any serious incident or malfunctioning
6. RECORD KEEPING: Keep logs generated by the AI system for at least 6 months
7. FUNDAMENTAL RIGHTS IMPACT ASSESSMENT: Conduct assessment before putting high-risk AI systems into use (for public entities and certain private entities)

TRANSPARENCY TO AFFECTED PERSONS:
- When decisions affecting natural persons are made using high-risk AI, inform them of that fact
- For emotion recognition or biometric categorization, inform exposed persons

SIMPLIFIED EXPLANATION: Companies using high-risk AI must follow instructions, assign competent human oversight, monitor the system, report incidents, and inform affected people.

REAL-WORLD EXAMPLES:
- An employer using AI hiring must train HR staff on oversight
- Banks using credit AI must keep decision logs for 6 months
- Public agencies must conduct fundamental rights assessments
- Rejected job candidates must be informed AI was used in the decision`,
    metadata: {
      article_ref: 'Article 26',
      section: 'Obligations of deployers',
      title: 'Deployer obligations for high-risk AI',
      simplified_explanation: 'Companies using high-risk AI must have trained oversight, keep logs, and inform affected people',
    },
  },
  // Article 27 - Fundamental Rights Impact Assessment
  {
    content: `Article 27 - Fundamental Rights Impact Assessment for High-Risk AI Systems

REQUIREMENT: Before putting a high-risk AI system into use, deployers that are public bodies or private entities providing public services, shall perform an assessment of the impact on fundamental rights.

ASSESSMENT MUST INCLUDE:
1. Description of the deployer's processes where AI will be used
2. Period and frequency of intended use
3. Categories of natural persons and groups likely to be affected
4. Specific risks of harm to identified categories of persons
5. Description of human oversight measures
6. Measures to be taken if risks materialize
7. Governance and mechanisms for complaints

WHO MUST COMPLY:
- Public bodies (government agencies, municipalities, etc.)
- Private entities providing public services (healthcare, education, utilities)
- Banks, insurers and essential service providers using certain high-risk AI

NOTIFICATION: Results must be notified to relevant market surveillance authority.

SIMPLIFIED EXPLANATION: Government agencies and essential service providers must assess how high-risk AI affects people's fundamental rights before deploying it.

REAL-WORLD EXAMPLES:
- A city deploying AI for welfare eligibility must assess discrimination risks
- A hospital using AI diagnosis must evaluate impact on patient rights
- A school using AI admissions must assess fairness impacts
- An employment agency must evaluate AI hiring system's effects on different groups`,
    metadata: {
      article_ref: 'Article 27',
      section: 'Obligations of deployers',
      title: 'Fundamental rights impact assessment',
      simplified_explanation: 'Government and public service providers must assess fundamental rights impacts before using high-risk AI',
    },
  },
];

/**
 * Generate embedding for text using OpenAI API
 * Includes retry logic and rate limiting
 */
async function generateEmbedding(text: string, retries: number = 3): Promise<number[]> {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    throw new Error('OPENAI_API_KEY not set');
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text,
        }),
      });

      if (response.status === 429) {
        // Rate limit - wait and retry
        const retryAfter = response.headers.get('retry-after');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt) * 1000;
        console.log(`Rate limited. Waiting ${waitTime / 1000}s before retry ${attempt}/${retries}...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      // Wait before retry
      const waitTime = Math.pow(2, attempt) * 1000;
      console.log(`Error on attempt ${attempt}, retrying in ${waitTime / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw new Error('Failed to generate embedding after retries');
}

/**
 * Seed the database with EU AI Act articles
 * Includes rate limiting to respect API limits
 */
async function seedDatabase() {
  console.log('Starting database seeding...');
  console.log(`Processing ${SAMPLE_ARTICLES.length} articles...\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < SAMPLE_ARTICLES.length; i++) {
    const article = SAMPLE_ARTICLES[i];
    try {
      console.log(`[${i + 1}/${SAMPLE_ARTICLES.length}] Processing ${article.metadata.article_ref}...`);

      // Generate embedding with retry logic
      const embedding = await generateEmbedding(article.content);
      console.log(`  ✓ Generated embedding (${embedding.length} dimensions)`);

      // Insert into database
      // Supabase accepts embeddings as JavaScript arrays - pgvector handles conversion
      const { data, error } = await supabase
        .from('compliance_knowledge')
        .insert({
          content: article.content,
          embedding: embedding, // Pass as array - Supabase/pgvector handles conversion
          metadata: article.metadata,
        })
        .select();

      if (error) {
        console.error(`  ✗ Error inserting:`, error.message);
        failCount++;
      } else {
        console.log(`  ✓ Successfully inserted ${article.metadata.article_ref}\n`);
        successCount++;
      }

      // Rate limiting: wait 1 second between requests to avoid hitting limits
      if (i < SAMPLE_ARTICLES.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`  ✗ Failed to process ${article.metadata.article_ref}:`, error instanceof Error ? error.message : error);
      failCount++;
      
      // If rate limited, wait longer before next article
      if (error instanceof Error && error.message.includes('Too Many Requests')) {
        console.log('  ⏳ Rate limited. Waiting 10 seconds before continuing...\n');
        await new Promise(resolve => setTimeout(resolve, 10000));
      } else {
        // Wait 2 seconds before next attempt
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  console.log('\n========================================');
  console.log('Database seeding completed!');
  console.log(`✓ Successfully inserted: ${successCount}`);
  console.log(`✗ Failed: ${failCount}`);
  console.log('========================================');
}

// Run the seeding script
seedDatabase().catch(console.error);
