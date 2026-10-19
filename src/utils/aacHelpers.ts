import { AACItem, Routine } from '../types';

export const getGrammaticalCategoryLabel = (colorType: AACItem['colorType']): string => {
  switch (colorType) {
    case 'subject': return 'Person';
    case 'verb': return 'Verb';
    case 'noun': return 'Noun';
    case 'adjective': return 'Descriptor';
    case 'social': return 'Social';
    case 'emergency': return 'Alert';
    default: return 'Word';
  }
};

/**
 * Reconciles local and remote AAC items during synchronization:
 * 1. Prevents duplicate items by merging on item ID and normalized label+category.
 * 2. Prevents data loss: preserves offline custom additions, voice recordings (audioDataUrl),
 *    custom photos, drawings, and pinned/favorite statuses.
 * 3. Keeps consistent motor index order for AAC motor-planning consistency.
 */
export function reconcileAacItems(localItems: AACItem[] = [], remoteItems: AACItem[] = []): AACItem[] {
  if (!Array.isArray(remoteItems) || remoteItems.length === 0) {
    return Array.isArray(localItems) ? localItems : [];
  }
  if (!Array.isArray(localItems) || localItems.length === 0) {
    return remoteItems;
  }

  // Map to hold merged items by ID
  const mapById = new Map<string, AACItem>();

  // 1. Populate remote items first
  for (const rItem of remoteItems) {
    if (rItem && rItem.id) {
      mapById.set(rItem.id, { ...rItem });
    }
  }

  // 2. Merge local items, preserving local offline edits and custom creations
  for (const lItem of localItems) {
    if (!lItem || !lItem.id) continue;

    if (mapById.has(lItem.id)) {
      const existing = mapById.get(lItem.id)!;
      // Merge properties: preserve local voice recordings, custom drawings, photos, and favorite status
      mapById.set(lItem.id, {
        ...existing,
        ...lItem,
        audioDataUrl: lItem.audioDataUrl || existing.audioDataUrl,
        audioRecordedBy: lItem.audioRecordedBy || existing.audioRecordedBy,
        audioRecordedAt: lItem.audioRecordedAt || existing.audioRecordedAt,
        customDrawingUrl: lItem.customDrawingUrl || existing.customDrawingUrl,
        photoUrl: lItem.photoUrl || existing.photoUrl,
        isCustom: lItem.isCustom || existing.isCustom,
        isFavorite: lItem.isFavorite !== undefined ? lItem.isFavorite : existing.isFavorite,
      });
    } else {
      // Item created locally offline that does not yet exist on the remote server
      mapById.set(lItem.id, { ...lItem });
    }
  }

  // 3. Deduplicate by normalized label + category to prevent accidental clones
  const seenKeys = new Set<string>();
  const merged: AACItem[] = [];

  for (const item of mapById.values()) {
    const normKey = `${(item.label || '').trim().toLowerCase()}::${item.category || 'general'}`;
    if (!seenKeys.has(normKey)) {
      seenKeys.add(normKey);
      merged.push(item);
    }
  }

  // 4. Guarantee stable motor planning index
  return merged.map((item, index) => ({
    ...item,
    motorIndex: item.motorIndex !== undefined ? item.motorIndex : index,
  }));
}

/**
 * Reconciles local and remote visual schedules / routines during synchronization:
 * Prevents duplicates and retains offline step completion progress and custom routines.
 */
export function reconcileRoutines(localRoutines: Routine[] = [], remoteRoutines: Routine[] = []): Routine[] {
  if (!Array.isArray(remoteRoutines) || remoteRoutines.length === 0) {
    return Array.isArray(localRoutines) ? localRoutines : [];
  }
  if (!Array.isArray(localRoutines) || localRoutines.length === 0) {
    return remoteRoutines;
  }

  const routineMap = new Map<string, Routine>();

  // 1. Add remote routines
  for (const r of remoteRoutines) {
    if (r && r.id) {
      routineMap.set(r.id, { ...r });
    }
  }

  // 2. Merge local routines
  for (const l of localRoutines) {
    if (!l || !l.id) continue;

    if (routineMap.has(l.id)) {
      const existing = routineMap.get(l.id)!;
      // Reconcile steps: preserve step completion if completed locally
      const stepMap = new Map((l.steps || []).map((s) => [s.id || s.title, s]));
      const mergedSteps = (existing.steps || []).map((step) => {
        const localStep = stepMap.get(step.id || step.title);
        return localStep ? { ...step, ...localStep, completed: localStep.completed || step.completed } : step;
      });

      routineMap.set(l.id, {
        ...existing,
        ...l,
        steps: mergedSteps.length > 0 ? mergedSteps : (l.steps || existing.steps),
      });
    } else {
      // Local routine created offline
      routineMap.set(l.id, { ...l });
    }
  }

  return Array.from(routineMap.values());
}

