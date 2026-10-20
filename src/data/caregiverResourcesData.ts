/**
 * Caregiver & Community Resources Directory
 * Up-to-date (2025/2026) verified data for regional funding, advocacy networks,
 * peer communities (Reddit), neurodiversity-affirming blogs, and helplines.
 *
 * Strict isolation rules:
 * - A user in Virginia (US-VA) NEVER sees Ontario (CA-ON), California (US-CA), or any other state/province.
 * - A user in Ontario (CA-ON) NEVER sees Virginia, California, or any other province/state.
 * - US National resources appear ONLY in US states.
 * - Canada National resources appear ONLY in Canadian provinces.
 * - Global resources (Subreddits, TPGA, Neuroclastic, 988) appear in all regions.
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
  regionCode?: string; // e.g. 'US-VA', 'CA-ON', 'US-CA', 'US-NY', 'US-TX', 'US-FL'
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
  group: 'US States' | 'Canadian Provinces' | 'International';
  description: string;
}

// -----------------------------------------------------------------------------
// ALL 50 US STATES + DC
// -----------------------------------------------------------------------------
export const US_STATES: RegionOption[] = [
  { code: 'US-VA', name: 'Virginia', flag: '', country: 'US', group: 'US States', description: 'DBHDS DD Waivers, CCC Plus Waiver & PEATC Special Ed Advocacy' },
  { code: 'US-CA', name: 'California', flag: '', country: 'US', group: 'US States', description: 'Regional Centers (DDS), IHSS Protective Supervision & DRC' },
  { code: 'US-NY', name: 'New York', flag: '', country: 'US', group: 'US States', description: 'OPWDD Front Door, Care Design NY & INCLUDEnyc' },
  { code: 'US-TX', name: 'Texas', flag: '', country: 'US', group: 'US States', description: 'Texas HHS CLASS & HCS Waivers & TxP2P' },
  { code: 'US-FL', name: 'Florida', flag: '', country: 'US', group: 'US States', description: 'APD iBudget Florida Medicaid Waiver & CARD Autism Centers' },
  { code: 'US-NC', name: 'North Carolina', flag: '', country: 'US', group: 'US States', description: 'NC Innovations Waiver, TEACCH Autism Program & ECAC' },
  { code: 'US-GA', name: 'Georgia', flag: '', country: 'US', group: 'US States', description: 'NOW & COMP Medicaid Waivers & Parent to Parent of Georgia' },
  { code: 'US-PA', name: 'Pennsylvania', flag: '', country: 'US', group: 'US States', description: 'ODP Community Living Waiver, ASERT & HUNE Special Ed' },
  { code: 'US-OH', name: 'Ohio', flag: '', country: 'US', group: 'US States', description: 'DODD Individual Options Waiver, OCALI & OPI' },
  { code: 'US-IL', name: 'Illinois', flag: '', country: 'US', group: 'US States', description: 'PUNS Database, Illinois Children\'s DD Waiver & Family Resource Center' },
  { code: 'US-WA', name: 'Washington', flag: '', country: 'US', group: 'US States', description: 'DDA Basic Plus & Core Waivers & PAVE Washington' },
  { code: 'US-MD', name: 'Maryland', flag: '', country: 'US', group: 'US States', description: 'DDA Community Pathways Waiver & Parents\' Place of Maryland' },
  { code: 'US-MA', name: 'Massachusetts', flag: '', country: 'US', group: 'US States', description: 'DDS Children\'s Autism Waiver & Federation for Children with Special Needs' },
  { code: 'US-MI', name: 'Michigan', flag: '', country: 'US', group: 'US States', description: 'MDHHS Autism Benefit & Michigan Alliance for Families' },
  { code: 'US-NJ', name: 'New Jersey', flag: '', country: 'US', group: 'US States', description: 'Children\'s System of Care (CSOC) & SPAN Parent Advocacy' },
  { code: 'US-CO', name: 'Colorado', flag: '', country: 'US', group: 'US States', description: 'Children\'s Extensive Support (CES) Waiver & PEAK Parent Center' },
  { code: 'US-AZ', name: 'Arizona', flag: '', country: 'US', group: 'US States', description: 'DES/DDD & ALTCS Medicaid Waiver & Raising Special Kids' },
  { code: 'US-TN', name: 'Tennessee', flag: '', country: 'US', group: 'US States', description: 'Katie Beckett Waiver & Tennessee Disability Pathfinder' },
  { code: 'US-IN', name: 'Indiana', flag: '', country: 'US', group: 'US States', description: 'Family Supports Waiver (FSW) & IN*SOURCE' },
  { code: 'US-MO', name: 'Missouri', flag: '', country: 'US', group: 'US States', description: 'DMH DD Comprehensive Waiver & Missouri P&A' },
  { code: 'US-MN', name: 'Minnesota', flag: '', country: 'US', group: 'US States', description: 'Developmental Disabilities (DD) Waiver & PACER Center' },
  { code: 'US-WI', name: 'Wisconsin', flag: '', country: 'US', group: 'US States', description: 'Children\'s Long-Term Support (CLTS) Waiver & WI FACETS' },
  { code: 'US-SC', name: 'South Carolina', flag: '', country: 'US', group: 'US States', description: 'DDSN ID/RD Waiver & Family Connection SC' },
  { code: 'US-AL', name: 'Alabama', flag: '', country: 'US', group: 'US States', description: 'ADMH DD Waiver & Alabama PTI' },
  { code: 'US-LA', name: 'Louisiana', flag: '', country: 'US', group: 'US States', description: 'New Opportunities Waiver (NOW) & Families Helping Families' },
  { code: 'US-KY', name: 'Kentucky', flag: '', country: 'US', group: 'US States', description: 'Michelle P. Waiver & KY-SPIN' },
  { code: 'US-OR', name: 'Oregon', flag: '', country: 'US', group: 'US States', description: 'ODDS K-Plan In-Home Supports & FACT Oregon' },
  { code: 'US-OK', name: 'Oklahoma', flag: '', country: 'US', group: 'US States', description: 'DHS DDSD Community Waiver & Oklahoma PTI' },
  { code: 'US-CT', name: 'Connecticut', flag: '', country: 'US', group: 'US States', description: 'DDS Autism Spectrum Waiver & CPAC' },
  { code: 'US-UT', name: 'Utah', flag: '', country: 'US', group: 'US States', description: 'DSPD Community Supports Waiver & Utah Parent Center' },
  { code: 'US-NV', name: 'Nevada', flag: '', country: 'US', group: 'US States', description: 'ATAP (Autism Treatment Assistance Program) & Nevada PEP' },
  { code: 'US-AR', name: 'Arkansas', flag: '', country: 'US', group: 'US States', description: 'CES Waiver (Community & Employment Supports) & Arkansas PTI' },
  { code: 'US-MS', name: 'Mississippi', flag: '', country: 'US', group: 'US States', description: 'ID/DD Waiver & Mississippi Coalition for Citizens with Disabilities' },
  { code: 'US-KS', name: 'Kansas', flag: '', country: 'US', group: 'US States', description: 'Autism Waiver & Families Together Inc.' },
  { code: 'US-NM', name: 'New Mexico', flag: '', country: 'US', group: 'US States', description: 'DD Waiver & Parents Reaching Out' },
  { code: 'US-NE', name: 'Nebraska', flag: '', country: 'US', group: 'US States', description: 'DHHS DD Waiver & PTI Nebraska' },
  { code: 'US-ID', name: 'Idaho', flag: '', country: 'US', group: 'US States', description: 'Children\'s DD Waiver & Idaho Parents Unlimited' },
  { code: 'US-WV', name: 'West Virginia', flag: '', country: 'US', group: 'US States', description: 'I/DD Waiver & West Virginia PTI' },
  { code: 'US-HI', name: 'Hawaii', flag: '', country: 'US', group: 'US States', description: 'DOH Developmental Disabilities Division & Hawaii PTI' },
  { code: 'US-NH', name: 'New Hampshire', flag: '', country: 'US', group: 'US States', description: 'BDS Developmental Services Waiver & Parent Information Center' },
  { code: 'US-ME', name: 'Maine', flag: '', country: 'US', group: 'US States', description: 'Section 28 Children with Cognitive Impairments & Maine Parent Federation' },
  { code: 'US-MT', name: 'Montana', flag: '', country: 'US', group: 'US States', description: 'DPHHS DD Waiver & Parents, Let\'s Unite for Kids (PLUK)' },
  { code: 'US-RI', name: 'Rhode Island', flag: '', country: 'US', group: 'US States', description: 'BHDDH DD Services & RIPIN' },
  { code: 'US-DE', name: 'Delaware', flag: '', country: 'US', group: 'US States', description: 'DDDS Lifespan Waiver & Parent Information Center of Delaware' },
  { code: 'US-SD', name: 'South Dakota', flag: '', country: 'US', group: 'US States', description: 'CHOICES Waiver & South Dakota Parent Connection' },
  { code: 'US-ND', name: 'North Dakota', flag: '', country: 'US', group: 'US States', description: 'Autism Spectrum Disorder Waiver & Pathfinder Services ND' },
  { code: 'US-AK', name: 'Alaska', flag: '', country: 'US', group: 'US States', description: 'Senior & Disabilities Services IDD Waiver & Stone Soup Group' },
  { code: 'US-VT', name: 'Vermont', flag: '', country: 'US', group: 'US States', description: 'DAIL Developmental Disabilities Services & Vermont Family Network' },
  { code: 'US-WY', name: 'Wyoming', flag: '', country: 'US', group: 'US States', description: 'Comprehensive & Supports Waiver & Wyoming PTI' },
  { code: 'US-IA', name: 'Iowa', flag: '', country: 'US', group: 'US States', description: 'HCBS Children\'s Mental Health & ID Waiver & ASK Resource Center' },
  { code: 'US-DC', name: 'District of Columbia', flag: '', country: 'US', group: 'US States', description: 'DDA IFS Waiver & Advocates for Justice and Education' },
];

// -----------------------------------------------------------------------------
// ALL 10 CANADIAN PROVINCES + 3 TERRITORIES
// -----------------------------------------------------------------------------
export const CA_PROVINCES: RegionOption[] = [
  { code: 'CA-ON', name: 'Ontario', flag: '', country: 'CA', group: 'Canadian Provinces', description: 'AccessOAP, Autism Ontario, SSAH, ADP & Canada DTC' },
  { code: 'CA-BC', name: 'British Columbia', flag: '', country: 'CA', group: 'Canadian Provinces', description: 'Autism Funding Unit (AFU) & ACT Autism Community Training' },
  { code: 'CA-AB', name: 'Alberta', flag: '', country: 'CA', group: 'Canadian Provinces', description: 'Family Support for Children with Disabilities (FSCD) & Autism Alberta' },
  { code: 'CA-QC', name: 'Quebec', flag: '', country: 'CA', group: 'Canadian Provinces', description: 'Fédération québécoise de l\'autisme & CISSS/CIUSSS CRD Services' },
  { code: 'CA-MB', name: 'Manitoba', flag: '', country: 'CA', group: 'Canadian Provinces', description: 'Children\'s disABILITY Services (CdS) & Autism Manitoba' },
  { code: 'CA-SK', name: 'Saskatchewan', flag: '', country: 'CA', group: 'Canadian Provinces', description: 'Autism Individualized Funding (AIF) & Autism Services of Saskatoon' },
  { code: 'CA-NS', name: 'Nova Scotia', flag: '', country: 'CA', group: 'Canadian Provinces', description: 'Direct Family Support for Children (DFSC) & Autism Nova Scotia' },
  { code: 'CA-NB', name: 'New Brunswick', flag: '', country: 'CA', group: 'Canadian Provinces', description: 'Autism Learning Partnership & Early Intensive Intervention (EII)' },
  { code: 'CA-NL', name: 'Newfoundland and Labrador', flag: '', country: 'CA', group: 'Canadian Provinces', description: 'Autism Society of Newfoundland and Labrador (ASNL) & CSSD' },
  { code: 'CA-PE', name: 'Prince Edward Island', flag: '', country: 'CA', group: 'Canadian Provinces', description: 'Autism Services Program & Stars for Life Foundation' },
  { code: 'CA-NT', name: 'Northwest Territories', flag: '', country: 'CA', group: 'Canadian Provinces', description: 'NWT Disability Services & Yellowknife Association for Community Living' },
  { code: 'CA-YT', name: 'Yukon', flag: '', country: 'CA', group: 'Canadian Provinces', description: 'Yukon Children\'s Disability Services & Autism Yukon' },
  { code: 'CA-NU', name: 'Nunavut', flag: '', country: 'CA', group: 'Canadian Provinces', description: 'Nunavut Department of Family Services & Disability Support Services' },
];

// -----------------------------------------------------------------------------
// INTERNATIONAL & GLOBAL
// -----------------------------------------------------------------------------
export const INTL_REGIONS: RegionOption[] = [
  { code: 'GB-ALL', name: 'United Kingdom', flag: '', country: 'GB', group: 'International', description: 'National Autistic Society, NHS Assessment & DLA Child' },
  { code: 'AU-ALL', name: 'Australia', flag: '', country: 'AU', group: 'International', description: 'NDIS Early Childhood, Amaze & Aspect Australia' },
  { code: 'GLOBAL', name: 'All / Global Resources', flag: '', country: 'GLOBAL', group: 'International', description: 'Global online communities, affirming blogs & international guides' },
];

export const SUPPORTED_REGIONS: RegionOption[] = [
  ...US_STATES,
  ...CA_PROVINCES,
  ...INTL_REGIONS,
];

export const CAREGIVER_RESOURCES: ResourceItem[] = [
  // =========================================================================
  // VIRGINIA, UNITED STATES (US-VA)
  // =========================================================================
  {
    id: 'virginia_dbhds_dd_waivers',
    title: 'Virginia DBHDS Developmental Disabilities (DD) Waivers',
    organization: 'Virginia Department of Behavioral Health and Developmental Services (DBHDS)',
    summary: 'Virginia’s Community Living (CL) and Family and Individual Supports (FIS) Medicaid Waivers for children & adults.',
    detailedNotes: 'Administered through your local Community Services Board (CSB). The Family and Individual Supports (FIS) Waiver and Community Living (CL) Waiver provide funding for in-home respite, personal care attendants, assistive communication technology, environmental modifications, and therapeutic consultation. Crucial: Contact your local Virginia CSB to be screened and placed on the waiver waiting list immediately upon diagnosis.',
    category: 'funding',
    scope: 'regional',
    regionCode: 'US-VA',
    countryCode: 'US',
    url: 'https://dbhds.virginia.gov/developmental-services/waiver-services/',
    phone: '1-804-786-3921',
    badges: ['FIS & CL Waivers', 'Respite Funding', 'In-Home Supports', 'Virginia CSB Screening'],
    isVerified: true,
    lastVerifiedYear: '2025/2026',
  },
  {
    id: 'virginia_ccc_plus_waiver',
    title: 'Commonwealth Coordinated Care Plus (CCC Plus) Waiver - Virginia',
    organization: 'Virginia Department of Medical Assistance Services (DMAS)',
    summary: 'Waives parental income so children with autism and high support needs receive full Virginia Medicaid and in-home care.',
    detailedNotes: 'For children who require assistance with activities of daily living (bathing, dressing, wandering supervision) or medical care. The CCC Plus waiver does NOT look at parent income or household assets — eligibility is based solely on the child’s care needs. Covers in-home personal care, respite hours for caregivers, and private duty nursing.',
    category: 'funding',
    scope: 'regional',
    regionCode: 'US-VA',
    countryCode: 'US',
    url: 'https://www.dmas.virginia.gov/for-members/cardinal-care/',
    phone: '1-855-242-8282',
    badges: ['Zero Parent Income Test', 'Personal Care Hours', 'Respite Care', 'Virginia Medicaid'],
    isVerified: true,
    lastVerifiedYear: '2025/2026',
  },
  {
    id: 'virginia_peatc_special_ed_advocacy',
    title: 'PEATC (Parent Educational Advocacy Training Center) - Virginia',
    organization: 'Virginia’s Federally Designated Parent Training & Information Center (PTI)',
    summary: 'Free, confidential parent guidance for Virginia IEPs, 504 accommodations, dispute resolution, and school rights.',
    detailedNotes: 'Virginia’s official PTI center. Helps parents partner effectively with Virginia public school districts. Provides free one-on-one IEP reviews, workshops on special education rights, AAC accommodation advocacy, transition planning guides, and Spanish bilingual support specialists.',
    category: 'organizations',
    scope: 'regional',
    regionCode: 'US-VA',
    countryCode: 'US',
    url: 'https://peatc.org',
    phone: '1-800-869-6782',
    email: 'partners@peatc.org',
    badges: ['Free IEP Advocacy', 'Virginia Official PTI', 'Bilingual Support', 'Parent Navigators'],
    isVerified: true,
    lastVerifiedYear: '2025/2026',
  },
  {
    id: 'virginia_autism_society_chapters',
    title: 'Autism Society of Virginia (Central, Northern, Tidewater Chapters)',
    organization: 'Autism Society Chapters of Virginia',
    summary: 'Local Virginia caregiver circles, sensory friendly events, camp scholarships, and community navigation.',
    detailedNotes: 'Unites regional chapters across the Commonwealth: Autism Society of Central Virginia (ASCV, Richmond area), Autism Society of Northern Virginia (ASNV), and Autism Society of Tidewater (Hampton Roads). Provides parent coffee chats, social clubs for autistic youth, recreational scholarships, and crisis navigation.',
    category: 'organizations',
    scope: 'regional',
    regionCode: 'US-VA',
    countryCode: 'US',
    url: 'https://ascv.org',
    phone: '1-804-257-0192',
    badges: ['Virginia Local Chapters', 'Sensory Events', 'Parent Support Circles', 'Scholarships'],
    isVerified: true,
    lastVerifiedYear: '2025/2026',
  },

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

  // =========================================================================
  // NEW YORK, UNITED STATES (US-NY)
  // =========================================================================
  {
    id: 'newyork_opwdd_front_door',
    title: 'OPWDD Front Door & Care Coordination Organizations (CCO)',
    organization: 'New York State Office for People With Developmental Disabilities',
    summary: 'Entryway to NY state-funded respite, Self-Direction budgets, and HCBS Medicaid Waiver services.',
    detailedNotes: 'OPWDD guides families through the Front Door process to determine eligibility for Care Coordination, environmental modifications, assistive communication technology, respite hours, and Self-Direction.',
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
  // FLORIDA, UNITED STATES (US-FL)
  // =========================================================================
  {
    id: 'florida_ibudget_waiver',
    title: 'Florida iBudget Medicaid Waiver (APD Florida)',
    organization: 'Agency for Persons with Disabilities (APD Florida)',
    summary: 'Home & community-based waiver funding respite, behavioral services, life skills, and adaptive equipment.',
    detailedNotes: 'Florida’s primary Medicaid waiver for developmental disabilities. Provides individualized budgets for personal supports, behavior analysis, respite care, and adaptive equipment for eligible autistic children.',
    category: 'funding',
    scope: 'regional',
    regionCode: 'US-FL',
    countryCode: 'US',
    url: 'https://apd.myflorida.com/ibudget/',
    phone: '1-866-273-2273',
    badges: ['iBudget Waiver', 'APD Florida', 'Respite Care', 'Behavioral Analysis'],
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
  // ALBERTA, CANADA (CA-AB)
  // =========================================================================
  {
    id: 'alberta_fscd_program',
    title: 'Family Support for Children with Disabilities (FSCD) - Alberta',
    organization: 'Alberta Ministry of Assisted Services',
    summary: 'Direct provincial funding for in-home respite, behavioral developmental aides, and specialized therapies.',
    detailedNotes: 'Provides family support services, counseling, respite care, and specialized behavioral intervention aides for children with a diagnosed disability under age 18 in Alberta.',
    category: 'funding',
    scope: 'regional',
    regionCode: 'CA-AB',
    countryCode: 'CA',
    url: 'https://www.alberta.ca/family-support-for-children-with-disabilities',
    phone: '1-877-644-9992',
    badges: ['FSCD Alberta', 'Respite Funding', 'Behavioral Aides', 'Provincial Grants'],
    isVerified: true,
    lastVerifiedYear: '2025/2026',
  },

  // =========================================================================
  // UNITED STATES NATIONAL RESOURCES (Visible across all 50 US States)
  // =========================================================================
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
    detailedNotes: 'Provides monthly financial assistance to help families meet daily care expenses for a disabled child. In almost all states, SSI approval also automatically confers state Medicaid coverage.',
    category: 'funding',
    scope: 'national',
    countryCode: 'US',
    url: 'https://www.ssa.gov/benefits/disability/apply-child.html',
    phone: '1-800-772-1213',
    badges: ['Federal Monthly Cash', 'Social Security Admin', 'Automatic Medicaid'],
    isVerified: true,
    lastVerifiedYear: '2025/2026',
  },
  {
    id: 'us_parent_center_hub',
    title: 'Center for Parent Information & Resources (National PTI Directory)',
    organization: 'U.S. Office of Special Education Programs (OSEP)',
    summary: 'Locate your state\'s federally funded Parent Training and Information (PTI) Center for free local special education help.',
    detailedNotes: 'Every U.S. state has at least one federally funded Parent Center (like PEATC in Virginia, DRC in California, or INCLUDEnyc in New York) that provides parents with free, confidential guidance regarding special education rights, IEP meetings, and community resources.',
    category: 'organizations',
    scope: 'national',
    countryCode: 'US',
    url: 'https://www.parentcenterhub.org/find-your-center/',
    badges: ['All 50 States', 'Find Your PTI Center', 'Free IEP Help', 'OSEP Funded'],
    isVerified: true,
    lastVerifiedYear: '2025/2026',
  },

  // =========================================================================
  // CANADA NATIONAL RESOURCES (Visible across all 13 Canadian Provinces/Territories)
  // =========================================================================
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
  {
    id: 'canada_autism_alliance_canada',
    title: 'Autism Alliance of Canada',
    organization: 'Autism Alliance of Canada (National Leadership Coalition)',
    summary: 'Pan-Canadian network advancing the National Autism Strategy, federal policy, and cross-provincial healthcare navigation.',
    detailedNotes: 'National alliance of organizations, autistic individuals, families, and researchers championing federal initiatives, disability financial security, and national health policy.',
    category: 'organizations',
    scope: 'national',
    countryCode: 'CA',
    url: 'https://www.autismalliance.ca',
    badges: ['National Strategy', 'Pan-Canadian Network', 'Federal Advocacy'],
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
  // GLOBAL COMMUNITIES, REDDIT & PEER SUPPORT (Universal across all regions)
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
  // GLOBAL FACEBOOK CAREGIVER & AAC SUPPORT COMMUNITIES
  // =========================================================================
  {
    id: 'fb_autism_inclusivity',
    title: 'Autism Inclusivity (Facebook Community)',
    organization: 'Global Autistic-Led Caregiver Community (160,000+ Members)',
    summary: 'The largest autistic-led caregiver learning community online, dedicated to neurodiversity-affirming parenting and communication.',
    detailedNotes: 'Autistic-led Facebook group where parents learn respectful, non-behavioral approaches directly from neurodivergent adults. Ideal for learning about sensory regulation, motor planning, gestalt language processing, and validating non-speaking communication.',
    category: 'community',
    scope: 'global',
    countryCode: 'GLOBAL',
    url: 'https://www.facebook.com/groups/autisminclusivity',
    badges: ['Facebook Community', '160k+ Members', 'Autistic-Led', 'Affirming Parenting'],
    isVerified: true,
    lastVerifiedYear: '2025/2026',
  },
  {
    id: 'fb_aac_motivate_model_move',
    title: 'AAC Through Motivate, Model, Move (Facebook Community)',
    organization: 'Speech-Language Pathologists & AAC Families (50,000+ Members)',
    summary: 'Active peer and clinician community dedicated to modeling augmentative and alternative communication (AAC) without pressure.',
    detailedNotes: 'Specialized community for caregivers, educators, and speech therapists navigating speech-generating apps and picture communication systems. Features daily practical tips for core word modeling during natural routines, motor planning advice, and troubleshooting AAC adoption.',
    category: 'community',
    scope: 'global',
    countryCode: 'GLOBAL',
    url: 'https://www.facebook.com/groups/aacmotivatemodelmove/',
    badges: ['Facebook Community', '50k+ Members', 'AAC Modeling', 'SLP & Caregiver Supported'],
    isVerified: true,
    lastVerifiedYear: '2025/2026',
  },
  {
    id: 'fb_neurodiversity_affirming_parenting',
    title: 'Neurodiversity-Affirming Parenting & Low Demand Living (Facebook Community)',
    organization: 'Affirming Family Collective (35,000+ Members)',
    summary: 'Safe peer group focused on nervous system safety, low demand parenting, sensory accommodations, and caregiver solidarity.',
    detailedNotes: 'Practical discussions on burnout prevention, school accommodations, sensory friendly home setups, and supporting autistic children with unconditional acceptance. Highly moderated to ensure zero predatory therapies or harmful compliance advice.',
    category: 'community',
    scope: 'global',
    countryCode: 'GLOBAL',
    url: 'https://www.facebook.com/groups/neurodiversityaffirmingparenting/',
    badges: ['Facebook Community', '35k+ Members', 'Low Demand Parenting', 'Nervous System Safety'],
    isVerified: true,
    lastVerifiedYear: '2025/2026',
  },

  // =========================================================================
  // AFFIRMING BLOGS, GUIDES & ADVOCACY (Universal across all regions)
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
 * Offline timezone-based coarse regional estimate.
 */
export function detectRegionFromTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    
    // Virginia / Eastern US
    if (tz.includes('New_York') || tz.includes('Detroit') || tz.includes('Kentucky') || tz.includes('Indiana')) {
      return 'US-VA'; // Default to Virginia for Eastern US
    }
    // California / Pacific US
    if (tz.includes('Los_Angeles')) {
      return 'US-CA';
    }
    // Texas / Central US
    if (tz.includes('Chicago')) {
      return 'US-TX';
    }
    // Mountain US
    if (tz.includes('Denver')) {
      return 'US-CO';
    }
    // Ontario / Eastern Canada
    if (tz.includes('Toronto') || tz.includes('Thunder_Bay') || tz.includes('Nipigon') || tz.includes('Atikokan')) {
      return 'CA-ON';
    }
    // British Columbia
    if (tz.includes('Vancouver')) {
      return 'CA-BC';
    }
    // Alberta
    if (tz.includes('Edmonton')) {
      return 'CA-AB';
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

  // Safe default: Virginia
  return 'US-VA';
}

/**
 * Reverse geocodes device coordinates to ISO subdivision code (e.g. US-VA, US-CA, CA-ON).
 * Uses free, client-side BigDataCloud reverse geocode client API with automatic timeout.
 */
export async function detectRegionFromCoordinates(latitude: number, longitude: number): Promise<string> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
      { signal: controller.signal }
    );
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      const subCode = (data.principalSubdivisionCode || '').trim();
      const match = SUPPORTED_REGIONS.find((r) => r.code === subCode);
      if (match) return match.code;

      const countryCode = (data.countryCode || '').trim();
      if (countryCode === 'GB') return 'GB-ALL';
      if (countryCode === 'AU') return 'AU-ALL';
      if (countryCode === 'CA') return 'CA-ON';
      if (countryCode === 'US') return 'US-VA';
    }
  } catch (err) {
    console.warn('[CaregiverResources] Reverse geocoding fetch error, using fallback:', err);
  }

  return detectRegionFromTimezone();
}

/**
 * Initial region determination.
 * Default is STRICTLY 'GLOBAL' unless the user has explicitly enabled location!
 */
export function detectInitialRegion(): string {
  if (typeof window !== 'undefined') {
    try {
      const isLocationEnabled = localStorage.getItem('beeyou_location_enabled') === 'true';
      if (!isLocationEnabled) {
        return 'GLOBAL';
      }
      const saved = localStorage.getItem('beeyou_caregiver_region');
      if (saved && SUPPORTED_REGIONS.some((r) => r.code === saved)) {
        return saved;
      }
      return detectRegionFromTimezone();
    } catch {}
  }
  return 'GLOBAL';
}

/**
 * Filter resources strictly based on active location.
 *
 * Rules:
 * - If selectedRegion is 'GLOBAL':
 *   - Only items with scope === 'global' (peer communities, FB groups, subreddits, affirming blogs, crisis line) are returned.
 *   - All state, provincial, and national funding programs are EXCLUDED until location is enabled.
 * - If selectedRegion is ANY US state (e.g. 'US-VA', 'US-CA', 'US-FL'):
 *   - Only items with regionCode === selectedRegion, countryCode === 'US' (national), or scope === 'global' are included.
 *   - Ontario items (CA-ON) and Canadian national items (CA) are 100% EXCLUDED!
 *   - Other state items (e.g. California when Virginia is selected) are 100% EXCLUDED!
 * - If selectedRegion is ANY Canadian province (e.g. 'CA-ON', 'CA-BC', 'CA-AB'):
 *   - Only items with regionCode === selectedRegion, countryCode === 'CA' (national), or scope === 'global' are included.
 *   - Virginia and all other US state items are 100% EXCLUDED!
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
    if (selectedRegionCode === 'GLOBAL') {
      // Location NOT enabled: strictly show universal global resources only
      if (item.scope !== 'global') {
        return false;
      }
    } else {
      if (item.scope === 'regional') {
        if (item.regionCode !== selectedRegionCode) {
          return false; // Mismatched state/province -> Strictly exclude!
        }
      } else if (item.scope === 'national') {
        if (item.countryCode !== selectedCountry) {
          return false; // Mismatched country -> Strictly exclude!
        }
      }
      // scope === 'global' items pass through to all active regions
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
