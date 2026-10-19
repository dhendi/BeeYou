/**
 * Caregiver & Community Resources Directory
 * Up-to-date (2025/2026) verified data for regional funding, advocacy networks,
 * peer communities (Reddit), neurodiversity-affirming blogs, and helplines.
 *
 * Strict regional filtering ensures that users in California NEVER see Ontario-specific
 * programs (like AccessOAP), and vice versa.
 */

export type ResourceCategory = 
  | 'funding'       // Government Grants, Subsidies & Tax Credits
  | 'organizations' // Non-Profits, Advocacy & Navigators
  | 'community'     // Subreddits, Forums & Peer Circles
  | 'blogs'         // Neurodiversity-Affirming Blogs & Articles
  | 'helplines';    // 24/7 Hotlines & Navigation Helplines

export type ResourceScope = 'regional' | 'national' | 'global';

export interface ResourceItem {
  id: string;
  title: string;
  organization: string;
  summary: string;
  detailedNotes: string;
  category: ResourceCategory;
  scope: ResourceScope;
  regionCode?: string; // e.g. 'CA-ON', 'US-CA', 'US-NY', 'US-TX', 'CA-BC'
  countryCode?: 'CA' | 'US' | 'GB' | 'AU' | 'GLOBAL';
  url: string;
  phone?: string;
  email?: string;
  badges: string[];
  isVerified: boolean;
  lastVerifiedYear: string;
}

export interface RegionOption {
  code: string;
  name: string;
  flag: string;
  country: 'CA' | 'US' | 'GB' | 'AU' | 'GLOBAL';
  description: string;
}

export const SUPPORTED_REGIONS: RegionOption[] = [
  {
    code: 'CA-ON',
    name: 'Ontario, Canada',
    flag: '🇨🇦',
    country: 'CA',
    description: 'AccessOAP, Autism Ontario, SSAH, ADP & Canada DTC',
  },
  {
    code: 'US-CA',
    name: 'California, United States',
    flag: '🇺🇸',
    country: 'US',
    description: 'Regional Centers (DDS), IHSS Protective Supervision & DRC',
  },
  {
    code: 'US-NY',
    name: 'New York, United States',
    flag: '🇺🇸',
    country: 'US',
    description: 'OPWDD Front Door, Care Design NY & INCLUDEnyc',
  },
  {
    code: 'US-TX',
    name: 'Texas, United States',
    flag: '🇺🇸',
    country: 'US',
    description: 'Texas HHS CLASS / HCS Waivers & TxP2P',
  },
  {
    code: 'CA-BC',
    name: 'British Columbia, Canada',
    flag: '🇨🇦',
    country: 'CA',
    description: 'Autism Funding Unit (AFU) & ACT Autism Community',
  },
  {
    code: 'GB-ALL',
    name: 'United Kingdom',
    flag: '🇬🇧',
    country: 'GB',
    description: 'National Autistic Society, NHS Pathways & DLA Child',
  },
  {
    code: 'AU-ALL',
    name: 'Australia',
    flag: '🇦🇺',
    country: 'AU',
    description: 'NDIS Early Childhood, Amaze & Aspect Australia',
  },
  {
    code: 'GLOBAL',
    name: 'All / Global Resources',
    flag: '🌐',
    country: 'GLOBAL',
    description: 'Global online communities, affirming blogs & international guides',
  },
];

export const CAREGIVER_RESOURCES: ResourceItem[] = [
  // =========================================================================
  // ONTARIO, CANADA (CA-ON)
  // =========================================================================
  {
    id: 'ontario_access_oap',
    title: 'AccessOAP (Ontario Autism Program)',
    organization: 'Ministry of Children, Community and Social Services / Accerta',
    summary: 'Central intake & coordination portal for all Ontario Autism Program (OAP) funding and clinical services.',
    detailedNotes: 'Administered by Accerta. Oversees OAP registration, Childhood Budgets, Core Clinical Services (speech-language pathology, occupational therapy, mental health, and evidence-based behavioral services), Urgent Response Services, and Foundational Family Services. Requires documentation of an autism diagnosis by a physician or psychologist.',
    category: 'funding',
    scope: 'regional',
    regionCode: 'CA-ON',
    countryCode: 'CA',
    url: 'https://accessoap.ca',
    phone: '1-833-425-2447',
    email: 'info@accessoap.ca',
    badges: ['Official OAP Intake', 'Core Clinical Services', 'Childhood Budgets', 'Ages 0-18'],
    isVerified: true,
    lastVerifiedYear: '2025/2026',
  },
  {
    id: 'ontario_autism_ontario',
    title: 'Autism Ontario & Regional Navigators',
    organization: 'Autism Ontario (Provincial Non-Profit)',
    summary: 'Free 1-on-1 Service Navigation to navigate AccessOAP forms, local parent support groups, and camp funding subsidies.',
    detailedNotes: 'Ontario’s leading autism charity. Connects families directly with regional Service Navigators who walk you through registration forms, school transition planning, and funding applications. Administers March Break, Summer Camp, and Building Potential community experience subsidies across local Ontario chapters.',
    category: 'organizations',
    scope: 'regional',
    regionCode: 'CA-ON',
    countryCode: 'CA',
    url: 'https://www.autismontario.com',
    phone: '1-800-472-7789',
    email: 'info@autismontario.com',
    badges: ['Free Service Navigators', 'Camp Subsidies', 'Support Chapters', 'Parent Webinars'],
    isVerified: true,
    lastVerifiedYear: '2025/2026',
  },
  {
    id: 'ontario_ssah_respite',
    title: 'Special Services at Home (SSAH)',
    organization: 'Ontario Ministry of Children, Community and Social Services',
    summary: 'Provincial funding reimbursing families for respite care workers and personal development activities.',
    detailedNotes: 'Helps families caring for a child with a developmental disability. Funds can be used to hire a support worker/respite caregiver to give parents a break, or for classes and recreational programs that help the child learn new daily living skills.',
    category: 'funding',
    scope: 'regional',
    regionCode: 'CA-ON',
    countryCode: 'CA',
    url: 'https://www.ontario.ca/page/special-services-home',
    badges: ['Respite Funding', 'Family Relief', 'Skill Building', 'Ontario MCCSS'],
    isVerified: true,
    lastVerifiedYear: '2025/2026',
  },
  {
    id: 'ontario_adp_assistive_devices',
    title: 'Assistive Devices Program (ADP) - Communication Aids',
    organization: 'Ontario Ministry of Health',
    summary: 'Covers up to 75% of the cost of approved augmentative communication devices (AAC tablets and software).',
    detailedNotes: 'Provides substantial financial grants for speech-generating tablets and AAC software. Assessments must be completed by an ADP-authorized Speech-Language Pathologist (SLP) clinic (e.g. Holland Bloorview, Grandview, ErinoakKids, or private clinics).',
    category: 'funding',
    scope: 'regional',
    regionCode: 'CA-ON',
    countryCode: 'CA',
    url: 'https://www.ontario.ca/page/assistive-devices-program',
    badges: ['AAC Device Grants', '75% Cost Covered', 'Ministry of Health', 'SLP Prescribed'],
    isVerified: true,
    lastVerifiedYear: '2025/2026',
  },
  {
    id: 'ontario_211_community_helpline',
    title: '211 Ontario (Community Navigation Helpline)',
    organization: 'Ontario 211 Services',
    summary: 'Free, confidential 24/7 service connecting families to over 56,000 local social, health, and family services.',
    detailedNotes: 'Dial 2-1-1 or text 21166 anywhere in Ontario. Live certified community resource specialists connect you to local respite care agencies, food accessibility, family crisis lines, accessible transit programs, and legal clinics.',
    category: 'helplines',
    scope: 'regional',
    regionCode: 'CA-ON',
    countryCode: 'CA',
    url: 'https://211ontario.ca',
    phone: '2-1-1',
    badges: ['24/7 Helpline', 'Dial 2-1-1', 'Free & Confidential', 'Local Respite'],
    isVerified: true,
    lastVerifiedYear: '2025/2026',
  },
  {
    id: 'canada_disability_tax_credit_cdb',
    title: 'Canada Disability Tax Credit (DTC) & Child Disability Benefit',
    organization: 'Canada Revenue Agency (CRA)',
    summary: 'Federal non-refundable tax credit unlocking monthly CDB payouts (~$3,300+/yr) and retroactive refunds up to 10 years.',
    detailedNotes: 'Requires CRA Form T2201 signed by a medical practitioner (pediatrician/psychologist). Approval reduces annual household income taxes, automatically adds the monthly Child Disability Benefit to your Canada Child Benefit, and opens eligibility for the Registered Disability Savings Plan (RDSP) with up to $70,000 in federal matching grants.',
    category: 'funding',
    scope: 'national',
    countryCode: 'CA',
    url: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/segments/tax-credits-deductions-persons-disabilities/disability-tax-credit.html',
    phone: '1-800-959-8281',
    badges: ['CRA Form T2201', 'Monthly Child Benefit', '10-Yr Retroactive Payout', 'RDSP Grants'],
    isVerified: true,
    lastVerifiedYear: '2025/2026',
  },

  // =========================================================================
  // CALIFORNIA, UNITED STATES (US-CA)
  // =========================================================================
  {
    id: 'california_regional_centers_dds',
    title: 'California Regional Centers (Department of Developmental Services)',
    organization: 'California DDS / Network of 21 Non-Profit Regional Centers',
    summary: 'Statewide entitlement under the Lanterman Act providing lifelong services, Early Start (0-3), respite, and therapy coordination.',
    detailedNotes: 'California is unique in having an entitlement statute (Lanterman Act) ensuring lifelong, state-funded services for individuals with qualifying developmental conditions including autism. Services are free and not based on family income. Covers Early Start (0-3), respite care hours, behavioral intervention, social recreation programs, and adult transition.',
    category: 'funding',
    scope: 'regional',
    regionCode: 'US-CA',
    countryCode: 'US',
    url: 'https://www.dds.ca.gov/rc/listings/',
    phone: '1-833-858-7443',
    badges: ['Lanterman Act', 'Lifelong Services', 'Early Start (0-3)', 'Respite Hours', 'No Income Test'],
    isVerified: true,
    lastVerifiedYear: '2025/2026',
  },
  {
    id: 'california_ihss_protective_supervision',
    title: 'In-Home Supportive Services (IHSS) & Protective Supervision',
    organization: 'California Department of Social Services (CDSS)',
    summary: 'Pays a parent caregiver an hourly county wage to provide care and 24/7 Protective Supervision at home.',
    detailedNotes: 'For autistic children who wander (elopement risk), lack safety awareness, or engage in dangerous behaviors. Qualifies families for up to 283 hours per month paid directly to the parent at county minimum wage. Under IRS Notice 2014-7, IHSS wages paid to a live-in parent are 100% exempt from federal and California income taxes.',
    category: 'funding',
    scope: 'regional',
    regionCode: 'US-CA',
    countryCode: 'US',
    url: 'https://www.cdss.ca.gov/in-home-supportive-services',
    badges: ['Paid Parent Caregiver', 'Protective Supervision', 'IRS Tax-Exempt Wages', 'Up to 283 hrs/mo'],
    isVerified: true,
    lastVerifiedYear: '2025/2026',
  },
  {
    id: 'california_disability_rights_ca',
    title: 'Disability Rights California (DRC)',
    organization: 'Designated Protection & Advocacy Agency for California',
    summary: 'Free legal toolkits, SERR special education rights manual, IEP & 504 advocacy, and Regional Center fair hearings.',
    detailedNotes: 'Leading non-profit disability rights organization in California. Protects children’s rights under IDEA and Section 504. Provides comprehensive free self-advocacy guides, sample IEP letter templates, and legal assistance disputing Regional Center service denials or school district placement issues.',
    category: 'organizations',
    scope: 'regional',
    regionCode: 'US-CA',
    countryCode: 'US',
    url: 'https://www.disabilityrightsca.org',
    phone: '1-800-776-5746',
    badges: ['Free Legal Toolkits', 'IEP & 504 Rights', 'Regional Center Appeals', 'SERR Manual'],
    isVerified: true,
    lastVerifiedYear: '2025/2026',
  },
  {
    id: 'california_autism_society_ca',
    title: 'Autism Society of California (Statewide Network)',
    organization: 'Autism Society of California',
    summary: 'Connects parents with local California chapters (LA, San Diego, Bay Area, Inland Empire) for support circles and outings.',
    detailedNotes: 'Unites regional chapters across California. Coordinates monthly parent coffee chats, sibling workshops, sensory-friendly community outings (museums, theme parks, movies), and community navigation.',
    category: 'organizations',
    scope: 'regional',
    regionCode: 'US-CA',
    countryCode: 'US',
    url: 'https://autismsocietyca.org',
    badges: ['Local CA Chapters', 'Parent Support Circles', 'Sensory Outings', 'Advocacy'],
    isVerified: true,
    lastVerifiedYear: '2025/2026',
  },
  {
    id: 'california_dd_medi_cal_waiver',
    title: 'California DD Medi-Cal HCBS Waiver & CCS',
    organization: 'California Department of Health Care Services (DHCS)',
    summary: 'Waives parental income deeming so Regional Center children receive full Medi-Cal for therapies and AAC devices.',
    detailedNotes: 'Under California’s Home & Community-Based Services (HCBS) DD Waiver, a child who receives Regional Center services qualifies for full Medi-Cal without factoring in parent income. This covers speech therapy, occupational therapy, specialized medical supplies, and dedicated communication tablets.',
    category: 'funding',
    scope: 'regional',
    regionCode: 'US-CA',
    countryCode: 'US',
    url: 'https://www.dhcs.ca.gov/services/ccs',
    badges: ['Zero Income Deeming', 'Full Medi-Cal Access', 'Therapy Coverage', 'AAC Device Coverage'],
    isVerified: true,
    lastVerifiedYear: '2025/2026',
  },
  {
    id: 'us_idea_iep_rights',
    title: 'Individuals with Disabilities Education Act (IDEA) & IEP Guide',
    organization: 'U.S. Department of Education / Wrightslaw',
    summary: 'Federal law guaranteeing Free Appropriate Public Education (FAPE) with IEP accommodations, speech therapy, and 1:1 aides.',
    detailedNotes: 'Guarantees that every child with an autism diagnosis is entitled to an Individualized Education Program (IEP) tailored to their unique communication and sensory needs. Covers school-based speech-language therapy, occupational therapy, AAC evaluation, sensory room accommodations, and 1:1 behavioral paraprofessionals.',
    category: 'organizations',
    scope: 'national',
    countryCode: 'US',
    url: 'https://sites.ed.gov/idea/',
    badges: ['Federal Special Ed Law', 'FAPE & IEP Rights', 'AAC in Schools', 'Wrightslaw Guides'],
    isVerified: true,
    lastVerifiedYear: '2025/2026',
  },
  {
    id: 'us_ssi_childhood_disability',
    title: 'Supplemental Security Income (SSI) for Children',
    organization: 'U.S. Social Security Administration (SSA)',
    summary: 'Federal monthly cash payments for eligible children with disabilities meeting medical and family income guidelines.',
    detailedNotes: 'Provides monthly financial assistance to help low- and moderate-income families meet daily care expenses for a disabled child. In almost all states, SSI approval also automatically confers state Medicaid coverage.',
    category: 'funding',
    scope: 'national',
    countryCode: 'US',
    url: 'https://www.ssa.gov/benefits/disability/apply-child.html',
    phone: '1-800-772-1213',
    badges: ['Federal Monthly Cash', 'Social Security Admin', 'Automatic Medicaid'],
    isVerified: true,
    lastVerifiedYear: '2025/2026',
  },

  // =========================================================================
  // NEW YORK, UNITED STATES (US-NY)
  // =========================================================================
  {
    id: 'newyork_opwdd_front_door',
    title: 'OPWDD Front Door & Care Coordination Organizations (CCO)',
    organization: 'New York State Office for People With Developmental Disabilities',
    summary: 'Entryway to NY state-funded respite, Self-Direction budgets, and HCBS Medicaid Waiver services.',
    detailedNotes: 'OPWDD guides families through the Front Door process to determine eligibility for Care Coordination, environmental modifications, assistive communication technology, respite hours, and Self-Direction (which lets families hire their own support staff and select tailored activities).',
    category: 'funding',
    scope: 'regional',
    regionCode: 'US-NY',
    countryCode: 'US',
    url: 'https://opwdd.ny.gov/get-started/front-door',
    phone: '1-866-946-9733',
    badges: ['Front Door Access', 'Self-Direction Budget', 'Respite Care', 'HCBS Waiver'],
    isVerified: true,
    lastVerifiedYear: '2025/2026',
  },
  {
    id: 'newyork_includenyc',
    title: 'INCLUDEnyc (Family & Special Ed Navigation)',
    organization: 'INCLUDEnyc Non-Profit',
    summary: 'Free bilingual help for NYC and NY State families navigating IEPs, 504 plans, and developmental services.',
    detailedNotes: 'Provides one-on-one telephone help, workshops, youth programs, and resources to help parents understand special education rights in New York, partner with school districts, and resolve IEP disputes.',
    category: 'organizations',
    scope: 'regional',
    regionCode: 'US-NY',
    countryCode: 'US',
    url: 'https://includenyc.org',
    phone: '1-212-677-4660',
    badges: ['Free Special Ed Helpline', 'Bilingual Support', 'IEP Guidance', 'NYC Resources'],
    isVerified: true,
    lastVerifiedYear: '2025/2026',
  },

  // =========================================================================
  // TEXAS, UNITED STATES (US-TX)
  // =========================================================================
  {
    id: 'texas_hhs_medicaid_waivers',
    title: 'Texas HHS CLASS & HCS Medicaid Waiver Programs',
    organization: 'Texas Health and Human Services (HHS)',
    summary: 'Long-term community waivers providing respite care, adaptive aids, therapy services, and family support.',
    detailedNotes: 'Covers the Community Living Assistance and Support Services (CLASS) and Home and Community-based Services (HCS) waivers. Note: Interest lists in Texas are long, so it is critical for families to register their child on interest lists immediately upon diagnosis.',
    category: 'funding',
    scope: 'regional',
    regionCode: 'US-TX',
    countryCode: 'US',
    url: 'https://www.hhs.texas.gov/services/disability/medicaid-waiver-programs',
    phone: '1-855-937-2372',
    badges: ['CLASS & HCS Waivers', 'Respite Services', 'Adaptive Aids', 'Texas HHS'],
    isVerified: true,
    lastVerifiedYear: '2025/2026',
  },
  {
    id: 'texas_parent_to_parent',
    title: 'Texas Parent to Parent (TxP2P)',
    organization: 'Texas Parent to Parent Non-Profit',
    summary: 'Peer-to-peer parent mentoring, healthcare transition planning, and regional support groups across Texas.',
    detailedNotes: 'Matches parents of newly diagnosed children with trained veteran parents in their local Texas region. Helps parents navigate the medical system, school ARD/IEP meetings, and waiver waitlists.',
    category: 'organizations',
    scope: 'regional',
    regionCode: 'US-TX',
    countryCode: 'US',
    url: 'https://www.txp2p.org',
    phone: '1-866-896-6001',
    badges: ['Parent Mentors', 'ARD / IEP Support', 'Local TX Circles', 'Advocacy'],
    isVerified: true,
    lastVerifiedYear: '2025/2026',
  },

  // =========================================================================
  // BRITISH COLUMBIA, CANADA (CA-BC)
  // =========================================================================
  {
    id: 'bc_autism_funding_unit',
    title: 'B.C. Autism Funding Unit (AFU)',
    organization: 'British Columbia Ministry of Children and Family Development',
    summary: 'Direct provincial funding for children with an autism diagnosis: up to $22,000/yr (under 6) and $6,000/yr (ages 6-18).',
    detailedNotes: 'Provides direct funding allowing parents to select eligible service providers (Behavior Consultants, Speech-Language Pathologists, Occupational Therapists, and Behavior Interventionists) listed on the RASP (Registry of Autism Service Providers).',
    category: 'funding',
    scope: 'regional',
    regionCode: 'CA-BC',
    countryCode: 'CA',
    url: 'https://www2.gov.bc.ca/gov/content/health/managing-your-health/child-behaviour-development/special-needs/autism-spectrum-disorder/autism-funding',
    phone: '1-877-777-3530',
    badges: ['AFU Direct Funding', 'Up to $22k/yr Under 6', 'RASP Providers', 'B.C. Ministry'],
    isVerified: true,
    lastVerifiedYear: '2025/2026',
  },

  // =========================================================================
  // UNITED KINGDOM (GB-ALL)
  // =========================================================================
  {
    id: 'uk_national_autistic_society',
    title: 'National Autistic Society (NAS)',
    organization: 'National Autistic Society (UK Registered Charity)',
    summary: 'The UK’s leading autism charity offering diagnosis advice, Education Health and Care Plan (EHCP) guidance, and helplines.',
    detailedNotes: 'Provides guidance on navigating NHS autism assessment pathways, local authority EHCP rights, Disability Living Allowance (DLA for children), and local branches throughout England, Scotland, Wales, and Northern Ireland.',
    category: 'organizations',
    scope: 'regional',
    regionCode: 'GB-ALL',
    countryCode: 'GB',
    url: 'https://www.autism.org.uk',
    badges: ['UK-Wide Charity', 'EHCP Advice', 'DLA Child Guidance', 'Local Branches'],
    isVerified: true,
    lastVerifiedYear: '2025/2026',
  },

  // =========================================================================
  // AUSTRALIA (AU-ALL)
  // =========================================================================
  {
    id: 'australia_ndis_autism',
    title: 'National Disability Insurance Scheme (NDIS) - Early Childhood',
    organization: 'National Disability Insurance Agency (NDIA)',
    summary: 'Funded early intervention, speech pathology, occupational therapy, and assistive technology for Australian families.',
    detailedNotes: 'Children under age 9 with developmental delay or autism can access the NDIS Early Childhood approach through local Early Childhood Partners without needing a full formal diagnosis to begin early intervention and therapy funding.',
    category: 'funding',
    scope: 'regional',
    regionCode: 'AU-ALL',
    countryCode: 'AU',
    url: 'https://www.ndis.gov.au/understanding/families-and-carers/early-childhood-approach',
    phone: '1-800-800-110',
    badges: ['NDIS Funded', 'Early Childhood (0-9)', 'Therapy Budgets', 'Assistive Tech'],
    isVerified: true,
    lastVerifiedYear: '2025/2026',
  },

  // =========================================================================
  // GLOBAL COMMUNITIES, REDDIT & PEER SUPPORT (Universal)
  // =========================================================================
  {
    id: 'reddit_autism_parenting',
    title: 'r/Autism_Parenting (Reddit)',
    organization: 'Online Peer Support Community (55,000+ Members)',
    summary: 'Active, judgment-free peer community for parents raising autistic children across all support levels.',
    detailedNotes: 'One of the most supportive, practical communities online. Caregivers share real daily routines, school battles, sensory accommodations, AAC modeling tips, potty training strategies, and celebrate developmental milestones. Excellent search archive for real-world caregiver experiences.',
    category: 'community',
    scope: 'global',
    countryCode: 'GLOBAL',
    url: 'https://www.reddit.com/r/Autism_Parenting/',
    badges: ['Reddit Community', '55k+ Members', 'Peer Support', 'Judgment-Free Space'],
    isVerified: true,
    lastVerifiedYear: '2025/2026',
  },
  {
    id: 'reddit_autistic_adults',
    title: 'r/AutisticAdults (Reddit)',
    organization: 'Online Autistic Adult Community',
    summary: 'Autistic adults sharing lived perspectives on sensory overwhelm, unmasking, and communication styles.',
    detailedNotes: 'Crucial reading for parents. Reading lived perspectives from autistic adults provides deep empathy into how autistic children experience sound, texture, social exhaustion, monotropism, and why meltdowns happen.',
    category: 'community',
    scope: 'global',
    countryCode: 'GLOBAL',
    url: 'https://www.reddit.com/r/AutisticAdults/',
    badges: ['Reddit Community', 'Lived Perspectives', 'Sensory Insights', 'Adult Voices'],
    isVerified: true,
    lastVerifiedYear: '2025/2026',
  },
  {
    id: 'reddit_spicy_autism',
    title: 'r/spicyautism (Reddit)',
    organization: 'Community for Moderate & High Support Needs',
    summary: 'Safe space focused on Level 2 & 3 autistic individuals, non-speaking communicators, and their direct caregivers.',
    detailedNotes: 'Centered around the lived experiences and needs of autistic individuals with higher support needs and the families who care for them. Offers profound solidarity for caregivers navigating non-speaking communication, severe sensory distress, and high daily assistance.',
    category: 'community',
    scope: 'global',
    countryCode: 'GLOBAL',
    url: 'https://www.reddit.com/r/spicyautism/',
    badges: ['Level 2 & 3 Support', 'Higher Needs Focus', 'Non-Speaking Voices', 'Caregiver Solidarity'],
    isVerified: true,
    lastVerifiedYear: '2025/2026',
  },

  // =========================================================================
  // AFFIRMING BLOGS, GUIDES & ADVOCACY (Universal)
  // =========================================================================
  {
    id: 'blog_thinking_persons_guide',
    title: 'Thinking Person’s Guide to Autism (TPGA)',
    organization: 'Evidence-Based Neurodiversity Publication',
    summary: 'Award-winning, evidence-based articles by autistic adults, parents, and developmental specialists.',
    detailedNotes: 'A trusted, clear-headed guide to autism. Known for debunking unproven, predatory therapies, providing science-backed advice on sensory health and mental well-being, and championing the communication rights of non-speaking individuals.',
    category: 'blogs',
    scope: 'global',
    countryCode: 'GLOBAL',
    url: 'https://thinkingautismguide.com',
    badges: ['Evidence-Based Blog', 'Autistic & Parent Curated', 'Science-Backed', 'Communication Rights'],
    isVerified: true,
    lastVerifiedYear: '2025/2026',
  },
  {
    id: 'blog_neuroclastic',
    title: 'Neuroclastic (Autistic-Led Resource Collective)',
    organization: 'Neuroclastic Non-Profit Collective',
    summary: 'Autistic-led articles on monotropism, gestalt language processing, sensory diets, and trauma-informed accommodations.',
    detailedNotes: 'A vibrant knowledge repository written by autistic professionals, educators, and speech therapists. Invaluable explanations of Gestalt Language Processing (Natural Language Acquisition), sensory dysregulation, and neuro-affirming school IEP supports.',
    category: 'blogs',
    scope: 'global',
    countryCode: 'GLOBAL',
    url: 'https://neuroclastic.com',
    badges: ['Autistic-Led', 'Monotropism & Sensory', 'Gestalt Language', 'Affirming Education'],
    isVerified: true,
    lastVerifiedYear: '2025/2026',
  },
  {
    id: 'org_asan_autistic_advocacy',
    title: 'Autistic Self Advocacy Network (ASAN)',
    organization: 'Autistic Self Advocacy Network',
    summary: '"Nothing About Us Without Us" — leading advocacy organization publishing plain-language toolkits on autonomy and AAC.',
    detailedNotes: 'Leading civil rights organization run by and for autistic individuals. Publishes comprehensive, accessible toolkits on communication autonomy, healthcare navigation, supported decision-making, and avoiding behavioral abuse.',
    category: 'organizations',
    scope: 'global',
    countryCode: 'GLOBAL',
    url: 'https://autisticadvocacy.org',
    badges: ['Self-Advocacy', 'Plain-Language Toolkits', 'AAC Rights', 'Civil Rights'],
    isVerified: true,
    lastVerifiedYear: '2025/2026',
  },
  {
    id: 'helpline_988_crisis_lifeline',
    title: '988 Suicide & Crisis Lifeline (North America)',
    organization: '988 Crisis Lifeline (US & Canada)',
    summary: 'Free, confidential 24/7 mental health and caregiver distress support via call or text to 9-8-8.',
    detailedNotes: 'Active across both the United States and Canada. Dial or text 9-8-8 anytime a caregiver or family member is experiencing overwhelming distress, caregiver burnout, or acute crisis. Specialized neurodivergent-informed and sensory support available.',
    category: 'helplines',
    scope: 'global',
    countryCode: 'GLOBAL',
    url: 'https://988lifeline.org',
    phone: '9-8-8',
    badges: ['24/7 Helpline', 'Call or Text 988', 'Free & Confidential', 'US & Canada Active'],
    isVerified: true,
    lastVerifiedYear: '2025/2026',
  },
];

/**
 * Coarse, non-invasive initial region detection.
 * Inspects device timezone / locale without triggering permission dialogs.
 */
export function detectInitialRegion(): string {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('beeyou_caregiver_region');
      if (saved && SUPPORTED_REGIONS.some((r) => r.code === saved)) {
        return saved;
      }
    } catch {}
  }

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    // Ontario / Eastern Canada
    if (tz.includes('Toronto') || tz.includes('Thunder_Bay') || tz.includes('Nipigon') || tz.includes('Atikokan')) {
      return 'CA-ON';
    }
    // British Columbia
    if (tz.includes('Vancouver')) {
      return 'CA-BC';
    }
    // California / Pacific US
    if (tz.includes('Los_Angeles')) {
      return 'US-CA';
    }
    // New York / Eastern US
    if (tz.includes('New_York')) {
      return 'US-NY';
    }
    // Texas / Central US
    if (tz.includes('Chicago') || tz.includes('Center') || tz.includes('Menominee')) {
      return 'US-TX';
    }
    // United Kingdom
    if (tz.includes('London')) {
      return 'GB-ALL';
    }
    // Australia
    if (tz.includes('Sydney') || tz.includes('Melbourne') || tz.includes('Brisbane') || tz.includes('Perth')) {
      return 'AU-ALL';
    }

    // Locale fallback
    const lang = (typeof navigator !== 'undefined' && navigator.language) || '';
    if (lang.endsWith('-CA')) return 'CA-ON';
    if (lang.endsWith('-GB')) return 'GB-ALL';
    if (lang.endsWith('-AU')) return 'AU-ALL';
  } catch {}

  // Safe default: California or Ontario
  return 'US-CA';
}

/**
 * Filter resources strictly based on active location.
 *
 * Rules:
 * - If selectedRegion is 'US-CA':
 *   - Only items with regionCode === 'US-CA', countryCode === 'US', or scope === 'global' are included.
 *   - Ontario items (CA-ON, CA) are 100% EXCLUDED.
 * - If selectedRegion is 'CA-ON':
 *   - Only items with regionCode === 'CA-ON', countryCode === 'CA', or scope === 'global' are included.
 *   - California items (US-CA, US) are 100% EXCLUDED.
 * - If selectedRegion is 'GLOBAL':
 *   - All global items are shown, plus all regions are available.
 */
export function filterResources(
  resources: ResourceItem[],
  selectedRegionCode: string,
  categoryFilter: ResourceCategory | 'all' | 'saved',
  searchQuery: string,
  bookmarkedIds: Set<string>
): ResourceItem[] {
  const selectedRegion = SUPPORTED_REGIONS.find((r) => r.code === selectedRegionCode);
  const selectedCountry = selectedRegion?.country || 'GLOBAL';
  const cleanQuery = searchQuery.trim().toLowerCase();

  return resources.filter((item) => {
    // 1. Regional Exclusion Rule
    if (selectedRegionCode !== 'GLOBAL') {
      if (item.scope === 'regional') {
        if (item.regionCode !== selectedRegionCode) {
          return false; // Mismatched region -> Strictly exclude!
        }
      } else if (item.scope === 'national') {
        if (item.countryCode !== selectedCountry) {
          return false; // Mismatched country -> Strictly exclude!
        }
      }
      // scope === 'global' items pass through to all regions
    }

    // 2. Category / Saved Filter
    if (categoryFilter === 'saved') {
      if (!bookmarkedIds.has(item.id)) return false;
    } else if (categoryFilter !== 'all') {
      if (item.category !== categoryFilter) return false;
    }

    // 3. Search Query Filter
    if (cleanQuery) {
      const matchTitle = item.title.toLowerCase().includes(cleanQuery);
      const matchOrg = item.organization.toLowerCase().includes(cleanQuery);
      const matchSummary = item.summary.toLowerCase().includes(cleanQuery);
      const matchNotes = item.detailedNotes.toLowerCase().includes(cleanQuery);
      const matchBadges = item.badges.some((b) => b.toLowerCase().includes(cleanQuery));

      if (!matchTitle && !matchOrg && !matchSummary && !matchNotes && !matchBadges) {
        return false;
      }
    }

    return true;
  });
}
