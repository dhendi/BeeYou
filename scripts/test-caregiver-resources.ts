import { 
  CAREGIVER_RESOURCES, 
  SUPPORTED_REGIONS, 
  detectInitialRegion, 
  filterResources,
  ResourceItem
} from '../src/data/caregiverResourcesData';

console.log('========================================================================');
console.log('Caregiver Regional Resources Verification Suite');
console.log('========================================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  ✗ [FAIL] ${message}`);
    failCount++;
  }
}

// -----------------------------------------------------------------------------
// TEST 1: STRICT REGIONAL FILTERING (CALIFORNIA vs. ONTARIO)
// -----------------------------------------------------------------------------
console.log('Test 1: Strict Regional Filtering (California vs. Ontario Isolation)');

const californiaResults = filterResources(
  CAREGIVER_RESOURCES,
  'US-CA',
  'all',
  '',
  new Set()
);

// AccessOAP MUST NOT be visible anywhere in California
const calHasAccessOAP = californiaResults.some((r) => r.id === 'ontario_access_oap');
assert(!calHasAccessOAP, 'AccessOAP (Ontario Autism Program) is STRICTLY EXCLUDED from California results');

// Autism Ontario MUST NOT be visible anywhere in California
const calHasAutismOntario = californiaResults.some((r) => r.id === 'ontario_autism_ontario');
assert(!calHasAutismOntario, 'Autism Ontario is STRICTLY EXCLUDED from California results');

// Special Services at Home (SSAH) MUST NOT be visible in California
const calHasSSAH = californiaResults.some((r) => r.id === 'ontario_ssah_respite');
assert(!calHasSSAH, 'Special Services at Home (SSAH) is STRICTLY EXCLUDED from California results');

// California Regional Centers MUST be visible in California
const calHasRegionalCenters = californiaResults.some((r) => r.id === 'california_regional_centers_dds');
assert(calHasRegionalCenters, 'California Regional Centers (DDS) is included in California results');

// IHSS Protective Supervision MUST be visible in California
const calHasIHSS = californiaResults.some((r) => r.id === 'california_ihss_protective_supervision');
assert(calHasIHSS, 'IHSS & Protective Supervision is included in California results');

// Disability Rights California MUST be visible in California
const calHasDRC = californiaResults.some((r) => r.id === 'california_disability_rights_ca');
assert(calHasDRC, 'Disability Rights California (DRC) is included in California results');

// Global communities like r/Autism_Parenting MUST be visible in California
const calHasReddit = californiaResults.some((r) => r.id === 'reddit_autism_parenting');
assert(calHasReddit, 'r/Autism_Parenting Reddit community is included in California results');

// -----------------------------------------------------------------------------
// TEST 2: ONTARIO REGION ISOLATION
// -----------------------------------------------------------------------------
console.log('\nTest 2: Ontario Region Isolation (California Programs Excluded)');

const ontarioResults = filterResources(
  CAREGIVER_RESOURCES,
  'CA-ON',
  'all',
  '',
  new Set()
);

// California Regional Centers MUST NOT be visible in Ontario
const onHasRegionalCenters = ontarioResults.some((r) => r.id === 'california_regional_centers_dds');
assert(!onHasRegionalCenters, 'California Regional Centers is STRICTLY EXCLUDED from Ontario results');

// California IHSS MUST NOT be visible in Ontario
const onHasIHSS = ontarioResults.some((r) => r.id === 'california_ihss_protective_supervision');
assert(!onHasIHSS, 'California IHSS is STRICTLY EXCLUDED from Ontario results');

// AccessOAP MUST be visible in Ontario
const onHasAccessOAP = ontarioResults.some((r) => r.id === 'ontario_access_oap');
assert(onHasAccessOAP, 'AccessOAP (Ontario Autism Program) is included in Ontario results');

// Autism Ontario MUST be visible in Ontario
const onHasAutismOntario = ontarioResults.some((r) => r.id === 'ontario_autism_ontario');
assert(onHasAutismOntario, 'Autism Ontario & Navigators is included in Ontario results');

// Assistive Devices Program (ADP) MUST be visible in Ontario
const onHasADP = ontarioResults.some((r) => r.id === 'ontario_adp_assistive_devices');
assert(onHasADP, 'Assistive Devices Program (ADP - 75% AAC coverage) is included in Ontario results');

// Canada Disability Tax Credit (DTC) MUST be visible in Ontario
const onHasDTC = ontarioResults.some((r) => r.id === 'canada_disability_tax_credit_cdb');
assert(onHasDTC, 'Canada Disability Tax Credit & Child Disability Benefit is included in Ontario results');

// Global affirming blogs like TPGA MUST be visible in Ontario
const onHasTPGA = ontarioResults.some((r) => r.id === 'blog_thinking_persons_guide');
assert(onHasTPGA, 'Thinking Person’s Guide to Autism is included in Ontario results');

// -----------------------------------------------------------------------------
// TEST 3: LATEST 2025/2026 DATA INTEGRITY
// -----------------------------------------------------------------------------
console.log('\nTest 3: Latest 2025/2026 Data Completeness & Verification');

let allItemsVerified = true;
let allUrlsValid = true;
let allBadgesPopulated = true;

CAREGIVER_RESOURCES.forEach((item) => {
  if (!item.isVerified || item.lastVerifiedYear !== '2025/2026') {
    allItemsVerified = false;
  }
  if (!item.url.startsWith('https://')) {
    allUrlsValid = false;
  }
  if (!item.badges || item.badges.length === 0) {
    allBadgesPopulated = false;
  }
});

assert(allItemsVerified, `All ${CAREGIVER_RESOURCES.length} resources are verified for 2025/2026`);
assert(allUrlsValid, 'All resource links use secure HTTPS endpoints');
assert(allBadgesPopulated, 'All resources contain informative badge tags');

// -----------------------------------------------------------------------------
// TEST 4: CATEGORY FILTERING & SEARCH PRECISION
// -----------------------------------------------------------------------------
console.log('\nTest 4: Category Filtering & Search Precision');

// Funding category filter in California
const calFunding = filterResources(
  CAREGIVER_RESOURCES,
  'US-CA',
  'funding',
  '',
  new Set()
);
const allAreFunding = calFunding.every((r) => r.category === 'funding');
assert(allAreFunding && calFunding.length > 0, `Funding category filter strictly returns only funding items (count: ${calFunding.length})`);

// Community category filter in Ontario
const onCommunity = filterResources(
  CAREGIVER_RESOURCES,
  'CA-ON',
  'community',
  '',
  new Set()
);
const allAreCommunity = onCommunity.every((r) => r.category === 'community');
assert(allAreCommunity && onCommunity.length > 0, `Community filter strictly returns peer subreddits and circles (count: ${onCommunity.length})`);

// Search precision: searching 'OAP' in Ontario vs California
const onSearchOAP = filterResources(
  CAREGIVER_RESOURCES,
  'CA-ON',
  'all',
  'OAP',
  new Set()
);
const calSearchOAP = filterResources(
  CAREGIVER_RESOURCES,
  'US-CA',
  'all',
  'OAP',
  new Set()
);
assert(onSearchOAP.length >= 1, `Searching "OAP" in Ontario finds AccessOAP (found: ${onSearchOAP.length})`);
assert(calSearchOAP.length === 0, `Searching "OAP" in California returns 0 results as expected (found: 0)`);

// Search precision: searching 'IHSS' in California vs Ontario
const calSearchIHSS = filterResources(
  CAREGIVER_RESOURCES,
  'US-CA',
  'all',
  'IHSS',
  new Set()
);
const onSearchIHSS = filterResources(
  CAREGIVER_RESOURCES,
  'CA-ON',
  'all',
  'IHSS',
  new Set()
);
assert(calSearchIHSS.length >= 1, `Searching "IHSS" in California finds Protective Supervision (found: ${calSearchIHSS.length})`);
assert(onSearchIHSS.length === 0, `Searching "IHSS" in Ontario returns 0 results as expected (found: 0)`);

// Search precision: searching 'reddit' in both regions finds peer communities
const calSearchReddit = filterResources(
  CAREGIVER_RESOURCES,
  'US-CA',
  'all',
  'reddit',
  new Set()
);
const onSearchReddit = filterResources(
  CAREGIVER_RESOURCES,
  'CA-ON',
  'all',
  'reddit',
  new Set()
);
assert(calSearchReddit.length >= 3 && onSearchReddit.length >= 3, `Searching "reddit" finds r/Autism_Parenting, r/AutisticAdults, and r/spicyautism across both regions`);

// -----------------------------------------------------------------------------
// TEST 5: INITIAL REGION DETECTION & SUPPORTED REGIONS
// -----------------------------------------------------------------------------
console.log('\nTest 5: Initial Region Detection & Supported Regions');

const defaultRegion = detectInitialRegion();
const isValidSupportedRegion = SUPPORTED_REGIONS.some((r) => r.code === defaultRegion);
assert(isValidSupportedRegion, `detectInitialRegion() returns a valid supported region (${defaultRegion})`);
assert(SUPPORTED_REGIONS.length >= 8, `Supported regions directory contains ${SUPPORTED_REGIONS.length} options (Ontario, California, NY, Texas, BC, UK, Australia, Global)`);

console.log('\n------------------------------------------------------------------------');
console.log(`Results: ${passCount} / ${passCount + failCount} assertions passed (${Math.round((passCount / (passCount + failCount)) * 100)}%)`);

if (failCount === 0) {
  console.log('STATUS: ALL CAREGIVER RESOURCE REQUIREMENTS VERIFIED! ✓\n');
  process.exit(0);
} else {
  console.error(`STATUS: ${failCount} ASSERTION(S) FAILED! ✗\n`);
  process.exit(1);
}
