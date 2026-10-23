/**
 * Comprehensive Automated Verification Suite for Firebase Security Rules
 * Evaluates Firebase Realtime Database and Cloud Storage rules against the
 * official Firebase Emulator Suite runtime.
 *
 * Verifies:
 * 1. Unauthenticated read/write denials across all nodes
 * 2. Pairing records protection and unauthorized read denial
 * 3. Family ownership, permissions, and privilege escalation prevention
 * 4. Child member authorized actions and restriction enforcement
 * 5. Revocation enforcement and immediate access severance
 * 6. Cross-family read/write isolation
 * 7. BEE-DEMO sandbox isolation from real families
 * 8. Schema validation and oversized payload rejection
 * 9. Firebase Cloud Storage rules validation
 */

import { initializeTestEnvironment, assertFails, assertSucceeds, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${testName}${detail ? ` (${detail})` : ''}`);
    failed++;
  }
}

async function runRulesVerification() {
  console.log('\n======================================================');
  console.log('BeeYou Firebase Security Rules Verification Suite');
  console.log('======================================================\n');

  const databaseRules = fs.readFileSync(path.join(process.cwd(), 'database.rules.json'), 'utf8');
  const storageRules = fs.readFileSync(path.join(process.cwd(), 'storage.rules'), 'utf8');

  const testEnv: RulesTestEnvironment = await initializeTestEnvironment({
    projectId: 'beeyou-rules-test',
    database: {
      rules: databaseRules,
      host: '127.0.0.1',
      port: 9000,
    },
    storage: {
      rules: storageRules,
      host: '127.0.0.1',
      port: 9199,
    },
  });

  try {
    // -------------------------------------------------------------------------
    // Suite 1: Unauthenticated Access Denials
    // -------------------------------------------------------------------------
    console.log('--- Suite 1: Unauthenticated Access Denials ---');
    const unauthed = testEnv.unauthenticatedContext();
    const unauthedDb = unauthed.database();

    try {
      await assertFails(unauthedDb.ref('beeyou/users/user1').get());
      assert(true, 'Unauthenticated read to users/$uid is denied');
    } catch (e: any) {
      assert(false, 'Unauthenticated read to users/$uid is denied', e?.message);
    }

    try {
      await assertFails(unauthedDb.ref('beeyou/users/user1').set({ familyCode: 'BEE-SEC1' }));
      assert(true, 'Unauthenticated write to users/$uid is denied');
    } catch (e: any) {
      assert(false, 'Unauthenticated write to users/$uid is denied', e?.message);
    }

    try {
      await assertFails(unauthedDb.ref('beeyou/families/BEE-SEC1').get());
      assert(true, 'Unauthenticated read to families/$familyCode is denied');
    } catch (e: any) {
      assert(false, 'Unauthenticated read to families/$familyCode is denied', e?.message);
    }

    try {
      await assertFails(unauthedDb.ref('beeyou/families/BEE-SEC1').set({ familyCode: 'BEE-SEC1' }));
      assert(true, 'Unauthenticated write to families/$familyCode is denied');
    } catch (e: any) {
      assert(false, 'Unauthenticated write to families/$familyCode is denied', e?.message);
    }

    try {
      await assertFails(unauthedDb.ref('beeyou/sessions/BEE-SEC1').get());
      assert(true, 'Unauthenticated read to sessions/$familyCode is denied');
    } catch (e: any) {
      assert(false, 'Unauthenticated read to sessions/$familyCode is denied', e?.message);
    }

    try {
      await assertFails(unauthedDb.ref('beeyou/sessions/BEE-SEC1/pings/child').set({ timestamp: Date.now() }));
      assert(true, 'Unauthenticated write to sessions/$familyCode is denied');
    } catch (e: any) {
      assert(false, 'Unauthenticated write to sessions/$familyCode is denied', e?.message);
    }

    try {
      await assertFails(unauthedDb.ref('beeyou/events/BEE-SEC1').get());
      assert(true, 'Unauthenticated read to events/$familyCode is denied');
    } catch (e: any) {
      assert(false, 'Unauthenticated read to events/$familyCode is denied', e?.message);
    }

    try {
      await assertFails(unauthedDb.ref('beeyou/pairings/PAIR-777').get());
      assert(true, 'Unauthenticated read to pairings/$pairingCode is denied');
    } catch (e: any) {
      assert(false, 'Unauthenticated read to pairings/$pairingCode is denied', e?.message);
    }

    try {
      await assertFails(unauthedDb.ref('beeyou/pairings/PAIR-777').set({ pairingCode: 'PAIR-777', status: 'pending', expiresAt: Date.now() + 60000 }));
      assert(true, 'Unauthenticated write to pairings/$pairingCode is denied');
    } catch (e: any) {
      assert(false, 'Unauthenticated write to pairings/$pairingCode is denied', e?.message);
    }

    // -------------------------------------------------------------------------
    // Suite 2: Pairing Protection & Information Disclosure Prevention
    // -------------------------------------------------------------------------
    console.log('\n--- Suite 2: Pairing Protection & Information Disclosure Prevention ---');

    const ownerUid = 'caregiver-owner-101';
    const ownerContext = testEnv.authenticatedContext(ownerUid, { email: 'owner@family.com' });
    const ownerDb = ownerContext.database();

    const pairingCode = 'PAIR-884920';
    const targetFamilyCode = 'BEE-SEC101';

    // Seed target family structure with SecurityRulesDisabled
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.database();
      await db.ref(`beeyou/families/${targetFamilyCode}`).set({
        familyCode: targetFamilyCode,
        ownerUid: ownerUid,
        caregiverName: 'Sarah Jenkins',
        email: 'owner@family.com',
        members: {
          [ownerUid]: true,
        },
      });
    });

    // 2.1 Owner can create a pairing record
    try {
      await assertSucceeds(
        ownerDb.ref(`beeyou/pairings/${pairingCode}`).set({
          pairingCode,
          status: 'pending',
          expiresAt: Date.now() + 900000,
          ownerUid,
          targetFamilyCode,
          caregiverName: 'Sarah Jenkins',
          caregiverEmail: 'owner@family.com',
        })
      );
      assert(true, 'Owner can create pairing record');
    } catch (e: any) {
      assert(false, 'Owner can create pairing record', e?.message);
    }

    // 2.2 Owner can read their pairing record
    try {
      await assertSucceeds(ownerDb.ref(`beeyou/pairings/${pairingCode}`).get());
      assert(true, 'Owner can read their pairing record');
    } catch (e: any) {
      assert(false, 'Owner can read their pairing record', e?.message);
    }

    // 2.3 Arbitrary third-party authenticated user CANNOT read pairing record (Finding 2 verified)
    const attackerUid = 'unrelated-attacker-999';
    const attackerContext = testEnv.authenticatedContext(attackerUid, { email: 'attacker@evil.com' });
    const attackerDb = attackerContext.database();

    try {
      await assertFails(attackerDb.ref(`beeyou/pairings/${pairingCode}`).get());
      assert(true, 'Arbitrary authenticated user CANNOT read pairing record');
    } catch (e: any) {
      assert(false, 'Arbitrary authenticated user CANNOT read pairing record', e?.message);
    }

    // 2.4 Companion device can claim an unclaimed pairing record
    const childUid = 'companion-child-202';
    const childContext = testEnv.authenticatedContext(childUid, { email: 'child@family.com' });
    const childDb = childContext.database();

    try {
      await assertSucceeds(
        childDb.ref(`beeyou/pairings/${pairingCode}`).update({
          requestingUid: childUid,
          status: 'claimed',
          childName: 'Tommy',
        })
      );
      assert(true, 'Companion device can claim an unclaimed pairing record');
    } catch (e: any) {
      assert(false, 'Companion device can claim an unclaimed pairing record', e?.message);
    }

    // 2.5 Claimed companion can read the pairing record
    try {
      await assertSucceeds(childDb.ref(`beeyou/pairings/${pairingCode}`).get());
      assert(true, 'Claimed companion can read the pairing record');
    } catch (e: any) {
      assert(false, 'Claimed companion can read the pairing record', e?.message);
    }

    // 2.6 Second uninvited attacker CANNOT overwrite or claim an already-claimed pairing
    try {
      await assertFails(
        attackerDb.ref(`beeyou/pairings/${pairingCode}`).update({
          requestingUid: attackerUid,
          childName: 'Malicious Hijacker',
        })
      );
      assert(true, 'Second uninvited attacker CANNOT overwrite or claim an already-claimed pairing');
    } catch (e: any) {
      assert(false, 'Second uninvited attacker CANNOT overwrite or claim an already-claimed pairing', e?.message);
    }

    // 2.7 Target family member can read the pairing record
    const caregiverMemberUid = 'caregiver-helper-303';
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.database();
      await db.ref(`beeyou/families/${targetFamilyCode}/members/${caregiverMemberUid}`).set(true);
    });

    const memberContext = testEnv.authenticatedContext(caregiverMemberUid, { email: 'helper@family.com' });
    const memberDb = memberContext.database();

    try {
      await assertSucceeds(memberDb.ref(`beeyou/pairings/${pairingCode}`).get());
      assert(true, 'Target family member can read pairing record');
    } catch (e: any) {
      assert(false, 'Target family member can read pairing record', e?.message);
    }

    // 2.8 Revoked family member CANNOT read the pairing record
    const revokedUid = 'revoked-user-404';
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.database();
      await db.ref(`beeyou/families/${targetFamilyCode}/revokedMembers/${revokedUid}`).set({
        revokedAt: Date.now(),
        reason: 'Revoked by owner',
      });
    });

    const revokedContext = testEnv.authenticatedContext(revokedUid, { email: 'revoked@family.com' });
    const revokedDb = revokedContext.database();

    try {
      await assertFails(revokedDb.ref(`beeyou/pairings/${pairingCode}`).get());
      assert(true, 'Revoked family member CANNOT read the pairing record');
    } catch (e: any) {
      assert(false, 'Revoked family member CANNOT read the pairing record', e?.message);
    }

    // -------------------------------------------------------------------------
    // Suite 3: Family Creation, Ownership & Management
    // -------------------------------------------------------------------------
    console.log('\n--- Suite 3: Family Creation, Ownership & Management ---');

    const freshFamilyCode = 'BEE-SEC202';
    const freshOwnerUid = 'fresh-owner-505';
    const freshOwnerContext = testEnv.authenticatedContext(freshOwnerUid, { email: 'freshowner@family.com' });
    const freshOwnerDb = freshOwnerContext.database();

    // 3.1 Owner can initialize new family node with valid format
    try {
      await assertSucceeds(
        freshOwnerDb.ref(`beeyou/families/${freshFamilyCode}`).set({
          familyCode: freshFamilyCode,
          ownerUid: freshOwnerUid,
          caregiverName: 'David Miller',
          email: 'freshowner@family.com',
          members: {
            [freshOwnerUid]: true,
          },
        })
      );
      assert(true, 'Owner can initialize new family node with valid format');
    } catch (e: any) {
      assert(false, 'Owner can initialize new family node with valid format', e?.message);
    }

    // 3.2 Owner can read and write to family state
    try {
      await assertSucceeds(freshOwnerDb.ref(`beeyou/families/${freshFamilyCode}`).get());
      assert(true, 'Owner can read family state');
    } catch (e: any) {
      assert(false, 'Owner can read family state', e?.message);
    }

    // 3.3 Owner can add and remove members
    const newMemberUid = 'new-member-606';
    try {
      await assertSucceeds(freshOwnerDb.ref(`beeyou/families/${freshFamilyCode}/members/${newMemberUid}`).set(true));
      assert(true, 'Owner can add members');
    } catch (e: any) {
      assert(false, 'Owner can add members', e?.message);
    }

    // 3.4 Owner can update caregiver metadata
    try {
      await assertSucceeds(
        freshOwnerDb.ref(`beeyou/families/${freshFamilyCode}`).update({
          caregiverName: 'David Miller Jr.',
          caregiverRole: 'Father',
        })
      );
      assert(true, 'Owner can update caregiver metadata');
    } catch (e: any) {
      assert(false, 'Owner can update caregiver metadata', e?.message);
    }

    // 3.5 Owner can update routines, custom icons, and child profile
    try {
      await assertSucceeds(
        freshOwnerDb.ref(`beeyou/families/${freshFamilyCode}/childProfile`).set({
          name: 'Leo',
          pronouns: 'he/him',
        })
      );
      assert(true, 'Owner can update child profile');
    } catch (e: any) {
      assert(false, 'Owner can update child profile', e?.message);
    }

    // 3.6 Non-owner member CANNOT change family ownerUid (privilege escalation blocked)
    const ordinaryMemberContext = testEnv.authenticatedContext(newMemberUid, { email: 'ordinary@family.com' });
    const ordinaryMemberDb = ordinaryMemberContext.database();

    try {
      await assertFails(ordinaryMemberDb.ref(`beeyou/families/${freshFamilyCode}/ownerUid`).set(newMemberUid));
      assert(true, 'Non-owner member CANNOT change family ownerUid (privilege escalation blocked)');
    } catch (e: any) {
      assert(false, 'Non-owner member CANNOT change family ownerUid (privilege escalation blocked)', e?.message);
    }

    // 3.7 Non-owner member CANNOT add or remove members (privilege escalation blocked)
    try {
      await assertFails(ordinaryMemberDb.ref(`beeyou/families/${freshFamilyCode}/members/attacker-999`).set(true));
      assert(true, 'Non-owner member CANNOT add members (privilege escalation blocked)');
    } catch (e: any) {
      assert(false, 'Non-owner member CANNOT add members (privilege escalation blocked)', e?.message);
    }

    // 3.8 Non-owner member CANNOT update caregiver metadata
    try {
      await assertFails(ordinaryMemberDb.ref(`beeyou/families/${freshFamilyCode}/caregiverName`).set('Hacked Name'));
      assert(true, 'Non-owner member CANNOT update caregiver metadata');
    } catch (e: any) {
      assert(false, 'Non-owner member CANNOT update caregiver metadata', e?.message);
    }

    // -------------------------------------------------------------------------
    // Suite 4: Child Device Permissions & Bounds
    // -------------------------------------------------------------------------
    console.log('\n--- Suite 4: Child Device Permissions & Bounds ---');

    // Add child device as a valid family member
    const childDeviceUid = 'child-device-707';
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.database();
      await db.ref(`beeyou/families/${freshFamilyCode}/members/${childDeviceUid}`).set(true);
    });

    const childDevContext = testEnv.authenticatedContext(childDeviceUid, { email: 'childdevice@family.com' });
    const childDevDb = childDevContext.database();

    // 4.1 Child member can read family state
    try {
      await assertSucceeds(childDevDb.ref(`beeyou/families/${freshFamilyCode}`).get());
      assert(true, 'Child member can read family state');
    } catch (e: any) {
      assert(false, 'Child member can read family state', e?.message);
    }

    // 4.2 Child member can trigger SOS alert with active status
    try {
      await assertSucceeds(
        childDevDb.ref(`beeyou/sessions/${freshFamilyCode}/activeAlert`).set({
          status: 'active',
          childName: 'Leo',
          sentAt: Date.now(),
        })
      );
      assert(true, 'Child member can trigger SOS alert with active status');
    } catch (e: any) {
      assert(false, 'Child member can trigger SOS alert with active status', e?.message);
    }

    // 4.3 Child member can update childState (mood, activity)
    try {
      await assertSucceeds(
        childDevDb.ref(`beeyou/families/${freshFamilyCode}/childState`).set({
          currentMood: 'calm',
          currentActivity: 'drawing',
        })
      );
      assert(true, 'Child member can update childState');
    } catch (e: any) {
      assert(false, 'Child member can update childState', e?.message);
    }

    // 4.4 Child member can send message
    try {
      await assertSucceeds(
        childDevDb.ref(`beeyou/families/${freshFamilyCode}/messages/msg-1`).set({
          text: 'I want a snack please',
          timestamp: Date.now(),
          senderName: 'Leo',
        })
      );
      assert(true, 'Child member can send message');
    } catch (e: any) {
      assert(false, 'Child member can send message', e?.message);
    }

    // 4.5 Child member can update child heartbeat ping
    try {
      await assertSucceeds(
        childDevDb.ref(`beeyou/sessions/${freshFamilyCode}/pings/child`).set({
          timestamp: Date.now(),
          name: 'Leo Tablet',
        })
      );
      assert(true, 'Child member can update child heartbeat ping');
    } catch (e: any) {
      assert(false, 'Child member can update child heartbeat ping', e?.message);
    }

    // 4.6 Child member CANNOT revoke other members
    try {
      await assertFails(
        childDevDb.ref(`beeyou/families/${freshFamilyCode}/revokedMembers/${newMemberUid}`).set({
          revokedAt: Date.now(),
        })
      );
      assert(true, 'Child member CANNOT revoke other members');
    } catch (e: any) {
      assert(false, 'Child member CANNOT revoke other members', e?.message);
    }

    // -------------------------------------------------------------------------
    // Suite 5: Revocation Enforcement & Immediate Access Severance
    // -------------------------------------------------------------------------
    console.log('\n--- Suite 5: Revocation Enforcement & Immediate Access Severance ---');

    // Owner revokes ordinary member
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.database();
      await db.ref(`beeyou/families/${freshFamilyCode}/members/${newMemberUid}`).remove();
      await db.ref(`beeyou/families/${freshFamilyCode}/revokedMembers/${newMemberUid}`).set({
        revokedAt: Date.now(),
        reason: 'Revoked by family owner',
      });
    });

    // 5.1 Revoked member is immediately denied read from family state
    try {
      await assertFails(ordinaryMemberDb.ref(`beeyou/families/${freshFamilyCode}`).get());
      assert(true, 'Revoked member is immediately denied read from family state');
    } catch (e: any) {
      assert(false, 'Revoked member is immediately denied read from family state', e?.message);
    }

    // 5.2 Revoked member is immediately denied write to family state
    try {
      await assertFails(
        ordinaryMemberDb.ref(`beeyou/families/${freshFamilyCode}/messages/bad-msg`).set({
          text: 'Attacking after revocation',
          timestamp: Date.now(),
        })
      );
      assert(true, 'Revoked member is immediately denied write to family state');
    } catch (e: any) {
      assert(false, 'Revoked member is immediately denied write to family state', e?.message);
    }

    // 5.3 Revoked member is immediately denied read from sessions
    try {
      await assertFails(ordinaryMemberDb.ref(`beeyou/sessions/${freshFamilyCode}`).get());
      assert(true, 'Revoked member is immediately denied read from sessions');
    } catch (e: any) {
      assert(false, 'Revoked member is immediately denied read from sessions', e?.message);
    }

    // 5.4 Revoked member is immediately denied write to sessions
    try {
      await assertFails(
        ordinaryMemberDb.ref(`beeyou/sessions/${freshFamilyCode}/pings/caregiver`).set({
          timestamp: Date.now(),
        })
      );
      assert(true, 'Revoked member is immediately denied write to sessions');
    } catch (e: any) {
      assert(false, 'Revoked member is immediately denied write to sessions', e?.message);
    }

    // 5.5 Revoked member is immediately denied read from events
    try {
      await assertFails(ordinaryMemberDb.ref(`beeyou/events/${freshFamilyCode}`).get());
      assert(true, 'Revoked member is immediately denied read from events');
    } catch (e: any) {
      assert(false, 'Revoked member is immediately denied read from events', e?.message);
    }

    // 5.6 Revoked member cannot associate users/$uid with the revoked family
    try {
      await assertFails(ordinaryMemberDb.ref(`beeyou/users/${newMemberUid}`).set({ familyCode: freshFamilyCode }));
      assert(true, 'Revoked member cannot associate users/$uid with revoked family');
    } catch (e: any) {
      assert(false, 'Revoked member cannot associate users/$uid with revoked family', e?.message);
    }

    // -------------------------------------------------------------------------
    // Suite 6: Cross-Family Isolation
    // -------------------------------------------------------------------------
    console.log('\n--- Suite 6: Cross-Family Isolation ---');

    // freshOwnerUid is owner of freshFamilyCode (BEE-SEC202), not targetFamilyCode (BEE-SEC101)
    // 6.1 Member of Family A CANNOT read Family B
    try {
      await assertFails(freshOwnerDb.ref(`beeyou/families/${targetFamilyCode}`).get());
      assert(true, 'Member of Family A CANNOT read Family B');
    } catch (e: any) {
      assert(false, 'Member of Family A CANNOT read Family B', e?.message);
    }

    // 6.2 Member of Family A CANNOT write to Family B
    try {
      await assertFails(
        freshOwnerDb.ref(`beeyou/families/${targetFamilyCode}/messages/cross-msg`).set({
          text: 'Cross family inject',
          timestamp: Date.now(),
        })
      );
      assert(true, 'Member of Family A CANNOT write to Family B');
    } catch (e: any) {
      assert(false, 'Member of Family A CANNOT write to Family B', e?.message);
    }

    // 6.3 Member of Family A CANNOT read Family B sessions
    try {
      await assertFails(freshOwnerDb.ref(`beeyou/sessions/${targetFamilyCode}`).get());
      assert(true, 'Member of Family A CANNOT read Family B sessions');
    } catch (e: any) {
      assert(false, 'Member of Family A CANNOT read Family B sessions', e?.message);
    }

    // 6.4 Member of Family A CANNOT write to Family B sessions
    try {
      await assertFails(
        freshOwnerDb.ref(`beeyou/sessions/${targetFamilyCode}/pings/child`).set({
          timestamp: Date.now(),
        })
      );
      assert(true, 'Member of Family A CANNOT write to Family B sessions');
    } catch (e: any) {
      assert(false, 'Member of Family A CANNOT write to Family B sessions', e?.message);
    }

    // 6.5 Member of Family A CANNOT read Family B events
    try {
      await assertFails(freshOwnerDb.ref(`beeyou/events/${targetFamilyCode}`).get());
      assert(true, 'Member of Family A CANNOT read Family B events');
    } catch (e: any) {
      assert(false, 'Member of Family A CANNOT read Family B events', e?.message);
    }

    // -------------------------------------------------------------------------
    // Suite 7: BEE-DEMO Sandbox Isolation
    // -------------------------------------------------------------------------
    console.log('\n--- Suite 7: BEE-DEMO Sandbox Isolation ---');

    const demoContext = testEnv.authenticatedContext('demo-reviewer-uid', { email: 'demo@beeyou.app' });
    const demoDb = demoContext.database();

    // 7.1 Demo reviewer account can read BEE-DEMO family
    try {
      await assertSucceeds(demoDb.ref('beeyou/families/BEE-DEMO').get());
      assert(true, 'Demo reviewer account can read BEE-DEMO family');
    } catch (e: any) {
      assert(false, 'Demo reviewer account can read BEE-DEMO family', e?.message);
    }

    // 7.2 Demo reviewer account can write to BEE-DEMO family
    try {
      await assertSucceeds(
        demoDb.ref('beeyou/families/BEE-DEMO').set({
          familyCode: 'BEE-DEMO',
          ownerUid: 'demo-reviewer-uid',
        })
      );
      assert(true, 'Demo reviewer account can write to BEE-DEMO family');
    } catch (e: any) {
      assert(false, 'Demo reviewer account can write to BEE-DEMO family', e?.message);
    }

    // 7.3 Demo reviewer account CANNOT read real family (BEE-SEC101)
    try {
      await assertFails(demoDb.ref(`beeyou/families/${targetFamilyCode}`).get());
      assert(true, 'Demo reviewer account CANNOT read real family');
    } catch (e: any) {
      assert(false, 'Demo reviewer account CANNOT read real family', e?.message);
    }

    // 7.4 Demo reviewer account CANNOT write to real family (BEE-SEC101)
    try {
      await assertFails(
        demoDb.ref(`beeyou/families/${targetFamilyCode}/messages/demo-msg`).set({
          text: 'Demo injection into real family',
          timestamp: Date.now(),
        })
      );
      assert(true, 'Demo reviewer account CANNOT write to real family');
    } catch (e: any) {
      assert(false, 'Demo reviewer account CANNOT write to real family', e?.message);
    }

    // 7.5 Real user account CANNOT read BEE-DEMO family
    try {
      await assertFails(freshOwnerDb.ref('beeyou/families/BEE-DEMO').get());
      assert(true, 'Real user account CANNOT read BEE-DEMO family');
    } catch (e: any) {
      assert(false, 'Real user account CANNOT read BEE-DEMO family', e?.message);
    }

    // 7.6 Real user account CANNOT write to BEE-DEMO family
    try {
      await assertFails(
        freshOwnerDb.ref('beeyou/families/BEE-DEMO').set({
          familyCode: 'BEE-DEMO',
        })
      );
      assert(true, 'Real user account CANNOT write to BEE-DEMO family');
    } catch (e: any) {
      assert(false, 'Real user account CANNOT write to BEE-DEMO family', e?.message);
    }

    // 7.7 Real user account CANNOT associate users/$uid with BEE-DEMO
    try {
      await assertFails(freshOwnerDb.ref(`beeyou/users/${freshOwnerUid}`).set({ familyCode: 'BEE-DEMO' }));
      assert(true, 'Real user account CANNOT associate users/$uid with BEE-DEMO');
    } catch (e: any) {
      assert(false, 'Real user account CANNOT associate users/$uid with BEE-DEMO', e?.message);
    }

    // -------------------------------------------------------------------------
    // Suite 8: Schema & Input Validation
    // -------------------------------------------------------------------------
    console.log('\n--- Suite 8: Schema & Input Validation ---');

    // 8.1 Rejects malformed familyCode format (must match BEE-[A-Z0-9-]{3,16})
    try {
      await assertFails(
        freshOwnerDb.ref('beeyou/families/invalid_code_123').set({
          familyCode: 'invalid_code_123',
          ownerUid: freshOwnerUid,
          members: { [freshOwnerUid]: true },
        })
      );
      assert(true, 'Rejects malformed familyCode not matching BEE-[A-Z0-9-]{3,16}');
    } catch (e: any) {
      assert(false, 'Rejects malformed familyCode not matching BEE-[A-Z0-9-]{3,16}', e?.message);
    }

    // 8.2 Rejects oversized message text (> 1000 characters)
    const oversizedText = 'A'.repeat(1001);
    try {
      await assertFails(
        freshOwnerDb.ref(`beeyou/families/${freshFamilyCode}/messages/oversized`).set({
          text: oversizedText,
          timestamp: Date.now(),
        })
      );
      assert(true, 'Rejects oversized message text (> 1000 chars)');
    } catch (e: any) {
      assert(false, 'Rejects oversized message text (> 1000 chars)', e?.message);
    }

    // 8.3 Rejects malformed alert status (must be active, acknowledged, or resolved)
    try {
      await assertFails(
        freshOwnerDb.ref(`beeyou/sessions/${freshFamilyCode}/activeAlert`).set({
          status: 'invalid_malicious_status',
        })
      );
      assert(true, 'Rejects malformed alert status');
    } catch (e: any) {
      assert(false, 'Rejects malformed alert status', e?.message);
    }

    // 8.4 Rejects oversized custom icon dataUrl (> 500000 chars)
    const oversizedDataUrl = 'data:image/webp;base64,' + 'X'.repeat(500001);
    try {
      await assertFails(
        freshOwnerDb.ref(`beeyou/families/${freshFamilyCode}/customIcons/big-icon`).set({
          id: 'big-icon',
          label: 'Oversized Icon',
          dataUrl: oversizedDataUrl,
        })
      );
      assert(true, 'Rejects oversized custom icon dataUrl (> 500000 chars)');
    } catch (e: any) {
      assert(false, 'Rejects oversized custom icon dataUrl (> 500000 chars)', e?.message);
    }

    // 8.5 Rejects malformed ping role
    try {
      await assertFails(
        freshOwnerDb.ref(`beeyou/sessions/${freshFamilyCode}/pings/unauthorized_role`).set({
          timestamp: Date.now(),
        })
      );
      assert(true, 'Rejects malformed ping role');
    } catch (e: any) {
      assert(false, 'Rejects malformed ping role', e?.message);
    }

    // -------------------------------------------------------------------------
    // Suite 9: Firebase Storage Rules Verification
    // -------------------------------------------------------------------------
    console.log('\n--- Suite 9: Firebase Storage Rules Verification ---');

    const storageUserUid = 'storage-user-111';
    const storageUserContext = testEnv.authenticatedContext(storageUserUid, {
      email: 'storageuser@family.com',
      familyCode: 'BEE-SEC101',
    });
    const storageUserStorage = storageUserContext.storage();

    // 9.1 Unauthenticated storage access denied
    const unauthedStorage = testEnv.unauthenticatedContext().storage();
    try {
      await assertFails(unauthedStorage.ref(`users/${storageUserUid}/pic.png`).getDownloadURL());
      assert(true, 'Unauthenticated access to user storage denied');
    } catch (e: any) {
      assert(false, 'Unauthenticated access to user storage denied', e?.message);
    }

    // 9.2 Authenticated user can read and write their own user storage
    try {
      await assertSucceeds(
        storageUserStorage.ref(`users/${storageUserUid}/avatar.png`).put(Buffer.from('avatar-png-bytes'), {
          contentType: 'image/png',
        })
      );
      assert(true, 'Authenticated user can write to their own user storage');
    } catch (e: any) {
      assert(false, 'Authenticated user can write to their own user storage', e?.message);
    }

    // 9.3 Authenticated user CANNOT read or write another user storage
    try {
      await assertFails(
        attackerContext.storage().ref(`users/${storageUserUid}/avatar.png`).getDownloadURL()
      );
      assert(true, 'Authenticated user CANNOT read another user storage');
    } catch (e: any) {
      assert(false, 'Authenticated user CANNOT read another user storage', e?.message);
    }

    // 9.4 Family member with valid familyCode token can write their family storage
    try {
      await assertSucceeds(
        storageUserStorage.ref(`beeyou/families/BEE-SEC101/icons/custom.png`).put(Buffer.from('icon-bytes'), {
          contentType: 'image/png',
          customMetadata: {
            familyCode: 'BEE-SEC101',
            userId: storageUserUid,
          },
        })
      );
      assert(true, 'Family member with matching familyCode token can write family storage');
    } catch (e: any) {
      assert(false, 'Family member with matching familyCode token can write family storage', e?.message);
    }

    // 9.5 Cross-family storage read/write is denied
    const crossFamilyContext = testEnv.authenticatedContext('cross-user-222', {
      email: 'cross@other.com',
      familyCode: 'BEE-OTHER99',
    });
    try {
      await assertFails(
        crossFamilyContext.storage().ref(`beeyou/families/BEE-SEC101/icons/custom.png`).getDownloadURL()
      );
      assert(true, 'Cross-family storage read is denied (Family A cannot read Family B)');
    } catch (e: any) {
      assert(false, 'Cross-family storage read is denied (Family A cannot read Family B)', e?.message);
    }

    // 9.6 Demo reviewer account CANNOT access real family storage
    try {
      await assertFails(
        demoContext.storage().ref(`beeyou/families/BEE-SEC101/icons/custom.png`).getDownloadURL()
      );
      assert(true, 'Demo reviewer account CANNOT read real family storage');
    } catch (e: any) {
      assert(false, 'Demo reviewer account CANNOT read real family storage', e?.message);
    }

    // 9.7 Real user CANNOT access BEE-DEMO storage
    try {
      await assertFails(
        storageUserStorage.ref('beeyou/families/BEE-DEMO/icons/demo.png').getDownloadURL()
      );
      assert(true, 'Real user CANNOT access BEE-DEMO storage');
    } catch (e: any) {
      assert(false, 'Real user CANNOT access BEE-DEMO storage', e?.message);
    }

    // 9.8 Rejects oversized file upload (> 5MB)
    const oversizedFile = Buffer.alloc(6 * 1024 * 1024);
    try {
      await assertFails(
        storageUserStorage.ref(`users/${storageUserUid}/huge.png`).put(oversizedFile, {
          contentType: 'image/png',
        })
      );
      assert(true, 'Rejects oversized file upload (> 5MB)');
    } catch (e: any) {
      assert(false, 'Rejects oversized file upload (> 5MB)', e?.message);
    }

    // 9.9 Public read allowed on tts_cache, unauthenticated write denied
    try {
      await assertFails(
        unauthedStorage.ref('tts_cache/audio.wav').put(Buffer.from('hacked-audio'), {
          contentType: 'audio/wav',
        })
      );
      assert(true, 'Unauthenticated write to tts_cache is denied');
    } catch (e: any) {
      assert(false, 'Unauthenticated write to tts_cache is denied', e?.message);
    }

    // Cleanup environment
    await testEnv.cleanup();

    console.log('\n======================================================');
    console.log(`Verification Complete: ${passed} passed, ${failed} failed`);
    console.log('======================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('[Firebase Rules Test Execution Error]:', err);
    try {
      await testEnv.cleanup();
    } catch {}
    process.exit(1);
  }
}

runRulesVerification();
