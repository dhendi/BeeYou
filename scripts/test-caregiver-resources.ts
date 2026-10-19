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
// TEST 1: STRICT REGIONAL FILTERING FOR VIRGINIA (US-VA)
// -----------------------------------------------------------------------------
console.log('Test 1: Virginia (US-VA) Strict Isolation (Ontario and other states strictly excluded)');

const virginiaResults = filterResources(
  CAREGIVER_RESOURCES,
  'US-VA',
  'all',
  '',
  new Set()
);

// AccessOAP MUST NOT be visible in Virginia
const vaHasAccessOAP = virginiaResults.some((r) => r.id === 'ontario_access_oap');
assert(!vaHasAccessOAP, 'AccessOAP (Ontario Autism Program) is STRICTLY EXCLUDED from Virginia');

// Autism Ontario MUST NOT be visible in Virginia
const vaHasAutismOntario = virginiaResults.some((r) => r.id === 'ontario_autism_ontario');
assert(!vaHasAutismOntario, 'Autism Ontario is STRICTLY EXCLUDED from Virginia');

// Special Services at Home (SSAH) MUST NOT be visible in Virginia
const vaHasSSAH = virginiaResults.some((r) => r.id === 'ontario_ssah_respite');
assert(!vaHasSSAH, 'Ontario SSAH is STRICTLY EXCLUDED from Virginia');

// Assistive Devices Program (ADP) MUST NOT be visible in Virginia
const vaHasADP = virginiaResults.some((r) => r.id === 'ontario_adp_assistive_devices');
assert(!vaHasADP, 'Ontario ADP is STRICTLY EXCLUDED from Virginia');

// California Regional Centers MUST NOT be visible in Virginia
const vaHasCalifornia = virginiaResults.some((r) => r.id === 'california_regional_centers_dds');
assert(!vaHasCalifornia, 'California Regional Centers is STRICTLY EXCLUDED from Virginia');

// Virginia DBHDS DD Waivers MUST be present in Virginia
const vaHasDBHDS = virginiaResults.some((r) => r.id === 'virginia_dbhds_dd_waivers');
assert(vaHasDBHDS, 'Virginia DBHDS DD Waivers (CL & FIS Waivers) is included in Virginia');

// Virginia CCC Plus Waiver MUST be present in Virginia
const vaHasCCCPlus = virginiaResults.some((r) => r.id === 'virginia_ccc_plus_waiver');
assert(vaHasCCCPlus, 'Virginia CCC Plus Medicaid Waiver is included in Virginia');

// PEATC (Virginia PTI) MUST be present in Virginia
const vaHasPEATC = virginiaResults.some((r) => r.id === 'virginia_peatc_special_ed_advocacy');
assert(vaHasPEATC, 'PEATC (Parent Educational Advocacy Training Center - Virginia) is included in Virginia');

// Autism Society of Virginia MUST be present in Virginia
const vaHasASCV = virginiaResults.some((r) => r.id === 'virginia_autism_society_chapters');
assert(vaHasASCV, 'Autism Society of Virginia is included in Virginia');

// US National resources (IDEA, SSI) MUST be present in Virginia
const vaHasIDEA = virginiaResults.some((r) => r.id === 'us_idea_iep_rights');
assert(vaHasIDEA, 'U.S. National IDEA & IEP Guide is included in Virginia');

// Global communities like r/Autism_Parenting MUST be present in Virginia
const vaHasReddit = virginiaResults.some((r) => r.id === 'reddit_autism_parenting');
assert(vaHasReddit, 'r/Autism_Parenting Reddit community is included in Virginia');

// -----------------------------------------------------------------------------
// TEST 2: ONTARIO REGION ISOLATION (Virginia and California Excluded)
// -----------------------------------------------------------------------------
console.log('\nTest 2: Ontario (CA-ON) Strict Isolation (Virginia & California Excluded)');

const ontarioResults = filterResources(
  CAREGIVER_RESOURCES,
  'CA-ON',
  'all',
  '',
  new Set()
);

// Virginia DBHDS MUST NOT be visible in Ontario
const onHasDBHDS = ontarioResults.some((r) => r.id === 'virginia_dbhds_dd_waivers');
assert(!onHasDBHDS, 'Virginia DBHDS is STRICTLY EXCLUDED from Ontario results');

// Virginia PEATC MUST NOT be visible in Ontario
const onHasPEATC = ontarioResults.some((r) => r.id === 'virginia_peatc_special_ed_advocacy');
assert(!onHasPEATC, 'Virginia PEATC is STRICTLY EXCLUDED from Ontario results');

// California Regional Centers MUST NOT be visible in Ontario
const onHasRegionalCenters = ontarioResults.some((r) => r.id === 'california_regional_centers_dds');
assert(!onHasRegionalCenters, 'California Regional Centers is STRICTLY EXCLUDED from Ontario results');

// AccessOAP MUST be visible in Ontario
const onHasAccessOAP = ontarioResults.some((r) => r.id === 'ontario_access_oap');
assert(onHasAccessOAP, 'AccessOAP (Ontario Autism Program) is included in Ontario results');

// Autism Ontario MUST be visible in Ontario
const onHasAutismOntario = ontarioResults.some((r) => r.id === 'ontario_autism_ontario');
assert(onHasAutismOntario, 'Autism Ontario & Navigators is included in Ontario results');

// Canada Disability Tax Credit (DTC) MUST be visible in Ontario
const onHasDTC = ontarioResults.some((r) => r.id === 'canada_disability_tax_credit_cdb');
assert(onHasDTC, 'Canada Disability Tax Credit & Child Disability Benefit is included in Ontario results');

// -----------------------------------------------------------------------------
// TEST 3: ALL 50 US STATES & 13 CANADIAN PROVINCES SUPPORT
// -----------------------------------------------------------------------------
console.log('\nTest 3: Comprehensive Regional Coverage (All 50 US States + 13 Canadian Provinces/Territories)');

assert(SUPPORTED_REGIONS.length === 67, `Supported regions directory contains all 67 regions (found: ${SUPPORTED_REGIONS.length})`);

const usStatesCount = SUPPORTED_REGIONS.filter((r) => r.group === 'US States').length;
assert(usStatesCount === 51, `All 50 US States + DC are registered (found: ${usStatesCount})`);

const caProvCount = SUPPORTED_REGIONS.filter((r) => r.group === 'Canadian Provinces').length;
assert(caProvCount === 13, `All 10 Canadian Provinces + 3 Territories are registered (found: ${caProvCount})`);

// -----------------------------------------------------------------------------
// TEST 4: LATEST 2025/2026 DATA INTEGRITY
// -----------------------------------------------------------------------------
console.log('\nTest 4: Latest 2025/2026 Data Completeness & Verification');

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
// TEST 5: CATEGORY FILTERING & SEARCH PRECISION
// -----------------------------------------------------------------------------
console.log('\nTest 5: Category Filtering & Search Precision');

// Search precision: searching 'OAP' in Ontario vs Virginia
const onSearchOAP = filterResources(
  CAREGIVER_RESOURCES,
  'CA-ON',
  'all',
  'OAP',
  new Set()
);
const vaSearchOAP = filterResources(
  CAREGIVER_RESOURCES,
  'US-VA',
  'all',
  'OAP',
  new Set()
);
assert(onSearchOAP.length >= 1, `Searching "OAP" in Ontario finds AccessOAP (found: ${onSearchOAP.length})`);
assert(vaSearchOAP.length === 0, `Searching "OAP" in Virginia returns 0 results as expected (found: 0)`);

// Search precision: searching 'PEATC' in Virginia vs Ontario
const vaSearchPEATC = filterResources(
  CAREGIVER_RESOURCES,
  'US-VA',
  'all',
  'PEATC',
  new Set()
);
const onSearchPEATC = filterResources(
  CAREGIVER_RESOURCES,
  'CA-ON',
  'all',
  'PEATC',
  new Set()
);
assert(vaSearchPEATC.length >= 1, `Searching "PEATC" in Virginia finds Special Ed advocacy (found: ${vaSearchPEATC.length})`);
assert(onSearchPEATC.length === 0, `Searching "PEATC" in Ontario returns 0 results as expected (found: 0)`);

// Search precision: searching 'reddit' in both regions finds peer communities
const vaSearchReddit = filterResources(
  CAREGIVER_RESOURCES,
  'US-VA',
  'all',
  'reddit',
  new Set()
);
assert(vaSearchReddit.length >= 3, `Searching "reddit" in Virginia finds r/Autism_Parenting, r/AutisticAdults, and r/spicyautism`);

console.log('\n------------------------------------------------------------------------');
console.log(`Results: ${passCount} / ${passCount + failCount} assertions passed (${Math.round((passCount / (passCount + failCount)) * 100)}%)`);

if (failCount === 0) {
  console.log('STATUS: ALL CAREGIVER RESOURCE REQUIREMENTS VERIFIED! ✓\n');
  process.exit(0);
} else {
  console.error(`STATUS: ${failCount} ASSERTION(S) FAILED! ✗\n`);
  process.exit(1);
}
