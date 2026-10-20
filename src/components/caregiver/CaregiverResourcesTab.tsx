import React, { useState, useMemo } from 'react';
import { 
  Compass, 
  MapPin, 
  Search, 
  ExternalLink, 
  Phone, 
  Mail, 
  Bookmark, 
  BookmarkCheck, 
  Share2, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  MessageSquare, 
  BookOpen, 
  Landmark, 
  Users, 
  LifeBuoy, 
  X,
  Filter,
  Globe,
  Loader2
} from 'lucide-react';
import { 
  CAREGIVER_RESOURCES, 
  SUPPORTED_REGIONS, 
  ResourceCategory, 
  detectInitialRegion, 
  detectRegionFromCoordinates,
  detectRegionFromTimezone,
  filterResources 
} from '../../data/caregiverResourcesData';
import { playChime } from '../../utils/audio';
import { triggerHaptic } from '../../services/haptics';
import { t } from '../../services/translator';

interface CaregiverResourcesTabProps {
  onShowNotification: (msg: string) => void;
  onStartTour?: () => void;
}

export const CaregiverResourcesTab: React.FC<CaregiverResourcesTabProps> = ({
  onShowNotification,
}) => {
  // Location and Region State
  const [isLocationEnabled, setIsLocationEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('beeyou_location_enabled') === 'true';
    } catch {
      return false;
    }
  });

  const [selectedRegionCode, setSelectedRegionCode] = useState<string>(() => {
    return detectInitialRegion();
  });

  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | 'all' | 'saved'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Bookmarking / Saved resources
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem('beeyou_saved_resources');
      if (raw) return new Set(JSON.parse(raw));
    } catch {}
    return new Set();
  });

  // Copied item indicator
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Request & Enable Geolocation
  const handleEnableLocation = () => {
    if (isLocating) return;
    setIsLocating(true);
    playChime('tap');
    triggerHaptic('selection');

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      const fallback = detectRegionFromTimezone();
      setSelectedRegionCode(fallback);
      setIsLocationEnabled(true);
      try {
        localStorage.setItem('beeyou_location_enabled', 'true');
        localStorage.setItem('beeyou_caregiver_region', fallback);
      } catch {}
      const regionObj = SUPPORTED_REGIONS.find((r) => r.code === fallback);
      onShowNotification(`Location enabled: ${regionObj?.name || fallback}`);
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const detected = await detectRegionFromCoordinates(pos.coords.latitude, pos.coords.longitude);
          setSelectedRegionCode(detected);
          setIsLocationEnabled(true);
          try {
            localStorage.setItem('beeyou_location_enabled', 'true');
            localStorage.setItem('beeyou_caregiver_region', detected);
          } catch {}
          const regionObj = SUPPORTED_REGIONS.find((r) => r.code === detected);
          onShowNotification(`Location enabled: ${regionObj?.name || detected}`);
          playChime('star');
          triggerHaptic('success');
        } catch {
          const fallback = detectRegionFromTimezone();
          setSelectedRegionCode(fallback);
          setIsLocationEnabled(true);
          try {
            localStorage.setItem('beeyou_location_enabled', 'true');
            localStorage.setItem('beeyou_caregiver_region', fallback);
          } catch {}
          const regionObj = SUPPORTED_REGIONS.find((r) => r.code === fallback);
          onShowNotification(`Location enabled: ${regionObj?.name || fallback}`);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) { // PERMISSION_DENIED
          onShowNotification('Location permission denied. Showing global resources.');
        } else {
          // Timeout or position unavailable -> fallback to device timezone heuristic
          const fallback = detectRegionFromTimezone();
          setSelectedRegionCode(fallback);
          setIsLocationEnabled(true);
          try {
            localStorage.setItem('beeyou_location_enabled', 'true');
            localStorage.setItem('beeyou_caregiver_region', fallback);
          } catch {}
          const regionObj = SUPPORTED_REGIONS.find((r) => r.code === fallback);
          onShowNotification(`Estimated location: ${regionObj?.name || fallback}`);
        }
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  };

  // Turn off location & revert to Global mode
  const handleDisableLocation = () => {
    setIsLocationEnabled(false);
    setSelectedRegionCode('GLOBAL');
    try {
      localStorage.setItem('beeyou_location_enabled', 'false');
    } catch {}
    playChime('tap');
    triggerHaptic('selection');
    onShowNotification('Location disabled. Showing global resources only.');
  };

  // Toggle bookmark
  const handleToggleBookmark = (id: string, title: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      const isSaved = next.has(id);
      if (isSaved) {
        next.delete(id);
        onShowNotification(`Removed "${title}" from saved`);
      } else {
        next.add(id);
        playChime('star');
        triggerHaptic('success');
        onShowNotification(`Saved "${title}" to your favorites`);
      }
      try {
        localStorage.setItem('beeyou_saved_resources', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  // Copy contact / link
  const handleCopy = (text: string, id: string, label: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
      setCopiedId(id);
      playChime('tap');
      triggerHaptic('selection');
      onShowNotification(`Copied ${label} to clipboard!`);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const currentRegion = useMemo(() => {
    return SUPPORTED_REGIONS.find((r) => r.code === selectedRegionCode) || {
      code: 'GLOBAL',
      name: 'Global Resources',
      flag: '',
      country: 'GLOBAL' as const,
      group: 'International' as const,
      description: 'Global online communities, Facebook groups, affirming blogs & international guides',
    };
  }, [selectedRegionCode]);

  // Filtered list
  const filteredList = useMemo(() => {
    return filterResources(
      CAREGIVER_RESOURCES,
      selectedRegionCode,
      selectedCategory,
      searchQuery,
      bookmarkedIds
    );
  }, [selectedRegionCode, selectedCategory, searchQuery, bookmarkedIds]);

  // Counts by category within this view
  const categoryCounts = useMemo(() => {
    const regionFiltered = filterResources(
      CAREGIVER_RESOURCES,
      selectedRegionCode,
      'all',
      '',
      bookmarkedIds
    );
    return {
      all: regionFiltered.length,
      funding: regionFiltered.filter((r) => r.category === 'funding').length,
      organizations: regionFiltered.filter((r) => r.category === 'organizations').length,
      community: regionFiltered.filter((r) => r.category === 'community').length,
      blogs: regionFiltered.filter((r) => r.category === 'blogs').length,
      helplines: regionFiltered.filter((r) => r.category === 'helplines').length,
      saved: regionFiltered.filter((r) => bookmarkedIds.has(r.id)).length,
    };
  }, [selectedRegionCode, bookmarkedIds]);

  const getCategoryIcon = (category: ResourceCategory) => {
    switch (category) {
      case 'funding':
        return <Landmark className="w-4 h-4 text-emerald-700" />;
      case 'organizations':
        return <Users className="w-4 h-4 text-blue-700" />;
      case 'community':
        return <MessageSquare className="w-4 h-4 text-amber-700" />;
      case 'blogs':
        return <BookOpen className="w-4 h-4 text-indigo-700" />;
      case 'helplines':
        return <LifeBuoy className="w-4 h-4 text-rose-700" />;
    }
  };

  const getCategoryBadgeClass = (category: ResourceCategory) => {
    switch (category) {
      case 'funding':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'organizations':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'community':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'blogs':
        return 'bg-indigo-100 text-indigo-900 border-indigo-300';
      case 'helplines':
        return 'bg-rose-100 text-rose-900 border-rose-300';
    }
  };

  const getCategoryLabel = (category: ResourceCategory) => {
    switch (category) {
      case 'funding':
        return 'Government & Funding';
      case 'organizations':
        return 'Advocacy & Navigators';
      case 'community':
        return 'Communities (FB & Reddit)';
      case 'blogs':
        return 'Blogs & Guides';
      case 'helplines':
        return 'Helplines & Crisis';
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER & LOCATION BANNER */}
      <div className={`p-5 sm:p-6 rounded-3xl border-2 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
        isLocationEnabled
          ? 'bg-linear-to-r from-emerald-500/10 via-emerald-100/40 to-teal-100/30 border-emerald-300'
          : 'bg-linear-to-r from-amber-500/10 via-amber-200/40 to-orange-100/30 border-amber-300'
      }`}>
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black shadow-xs shrink-0 ${
              isLocationEnabled ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-amber-950'
            }`}>
              <Compass className="w-4 h-4" />
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {t('Caregiver & Community Resources')}
            </h2>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border hidden sm:inline-block ${
              isLocationEnabled ? 'bg-emerald-100 text-emerald-950 border-emerald-300' : 'bg-amber-200 text-amber-950 border-amber-300'
            }`}>
              {t('Verified 2025/2026')}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
            {isLocationEnabled
              ? t('Curated government programs, funding grants, peer communities, and affirming blogs strictly filtered for your location.')
              : t('Global peer support circles, Facebook groups, Reddit communities, and affirming blogs. Enable location to discover verified state or provincial funding programs and Medicaid waivers.')}
          </p>
        </div>

        {/* LOCATION ACTION: ENABLE OR ACTIVE STATUS */}
        {isLocationEnabled ? (
          <div className="w-full md:w-auto px-4 py-2.5 rounded-2xl bg-white border-2 border-emerald-400 shadow-2xs flex items-center justify-between md:justify-center gap-3 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="text-left min-w-0">
                <span className="text-[10px] uppercase tracking-wider text-emerald-800 font-black block leading-none">
                  {t('Location Active')}
                </span>
                <span className="truncate block font-black text-slate-900 text-xs sm:text-sm">
                  {currentRegion.name}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDisableLocation}
              className="px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-extrabold border border-stone-300 cursor-pointer transition active:scale-95"
              title={t('Turn off location')}
            >
              {t('Turn Off')}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleEnableLocation}
            disabled={isLocating}
            className="w-full md:w-auto px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs sm:text-sm border-2 border-amber-500 shadow-2xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all shrink-0"
          >
            {isLocating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-900" />
                <span>{t('Detecting Location...')}</span>
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4 text-amber-900" />
                <span>{t('Enable Location')}</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* LOCATION STATUS NOTICE */}
      {isLocationEnabled ? (
        <div className="px-4 py-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between gap-2 text-xs font-bold text-emerald-950">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">
              {t('Location Active:')} <strong className="font-black">{currentRegion.name}</strong> ({currentRegion.country === 'US' ? 'United States' : currentRegion.country === 'CA' ? 'Canada' : 'International'}). {t('Out-of-region programs are strictly excluded.')}
            </span>
          </div>
          <button
            type="button"
            onClick={handleEnableLocation}
            disabled={isLocating}
            className="text-[11px] text-emerald-800 hover:text-emerald-950 underline font-black shrink-0 cursor-pointer"
          >
            {isLocating ? t('Locating...') : t('Refresh')}
          </button>
        </div>
      ) : (
        <div className="px-4 py-2.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center gap-2 text-xs font-bold text-amber-950">
          <Globe className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            {t('Global Resources Active (Location Disabled). Showing universal Facebook groups, Reddit communities, affirming blogs, and helplines. Enable location above to unlock local funding & state waivers.')}
          </span>
        </div>
      )}

      {/* SEARCH AND CATEGORY FILTER BAR */}
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('Search programs, blogs, subreddits, Facebook groups, keywords (e.g. OAP, IHSS, respite, sensory)...')}
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white border-2 border-stone-200 focus:border-amber-400 focus:outline-none text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-stone-400 shadow-2xs transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 rounded-lg"
              title={t('Clear search')}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
          {[
            { id: 'all' as const, label: 'All Resources', count: categoryCounts.all, icon: Filter },
            { id: 'funding' as const, label: 'Funding & Government', count: categoryCounts.funding, icon: Landmark },
            { id: 'organizations' as const, label: 'Navigators & Non-Profits', count: categoryCounts.organizations, icon: Users },
            { id: 'community' as const, label: 'Communities (FB & Reddit)', count: categoryCounts.community, icon: MessageSquare },
            { id: 'blogs' as const, label: 'Blogs & Guides', count: categoryCounts.blogs, icon: BookOpen },
            { id: 'helplines' as const, label: 'Helplines', count: categoryCounts.helplines, icon: LifeBuoy },
            { id: 'saved' as const, label: 'Saved', count: categoryCounts.saved, icon: Bookmark },
          ].map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const CatIcon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  playChime('tap');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 border shrink-0 ${
                  isSelected
                    ? 'bg-amber-400 text-amber-950 font-black border-amber-500 shadow-2xs scale-[1.02]'
                    : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200'
                }`}
              >
                <CatIcon className="w-3.5 h-3.5 shrink-0" />
                <span>{t(cat.label)}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  isSelected ? 'bg-amber-950/15 text-amber-950' : 'bg-stone-100 text-stone-600'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* RESOURCE CARDS LIST */}
      {filteredList.length === 0 ? (
        <div className="p-8 text-center rounded-3xl bg-white border-2 border-stone-200/80 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-800">
            {t('No resources found')}
          </h3>
          <p className="text-xs text-stone-600 font-medium max-w-md mx-auto">
            {searchQuery
              ? `${t('No resources matching')} "${searchQuery}" ${t('in')} ${currentRegion.name}. ${t('Try clearing your search or browsing All.')}`
              : selectedCategory === 'saved'
              ? t('You have not bookmarked any resources yet. Tap the bookmark icon on any card to save it for quick access.')
              : t('No resources in this specific category for the selected region.')}
          </p>
          {(searchQuery || selectedCategory !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                playChime('tap');
              }}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs cursor-pointer shadow-2xs active:scale-95 transition"
            >
              {t('Reset Filters')}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map((item) => {
            const isSaved = bookmarkedIds.has(item.id);
            const isCopied = copiedId === item.id;
            const scopeLabel = 
              item.scope === 'regional'
                ? `${item.regionCode?.replace('CA-', '').replace('US-', '')} Regional`
                : item.scope === 'national'
                ? `${item.countryCode === 'CA' ? 'Canada' : 'United States'} National`
                : 'Global Community';

            return (
              <div
                key={item.id}
                className="p-5 rounded-3xl bg-white border-2 border-stone-200/90 shadow-2xs hover:border-amber-300 transition-all flex flex-col justify-between space-y-4"
              >
                {/* Top: Badges & Bookmark */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border flex items-center gap-1 ${getCategoryBadgeClass(item.category)}`}>
                        {getCategoryIcon(item.category)}
                        <span>{getCategoryLabel(item.category)}</span>
                      </span>

                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-stone-100 text-stone-700 border border-stone-200">
                        {scopeLabel}
                      </span>

                      {item.isVerified && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>{item.lastVerifiedYear}</span>
                        </span>
                      )}
                    </div>

                    {/* Bookmark Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleBookmark(item.id, item.title)}
                      className={`p-2 rounded-xl transition-all cursor-pointer active:scale-90 ${
                        isSaved
                          ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          : 'text-stone-400 hover:bg-stone-100 hover:text-stone-600'
                      }`}
                      title={isSaved ? t('Remove from saved') : t('Save for later')}
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-4 h-4 fill-amber-500" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Title & Organization */}
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-amber-900/80 font-bold mt-0.5">
                      {item.organization}
                    </p>
                  </div>

                  {/* Summary */}
                  <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                    {item.summary}
                  </p>

                  {/* Detailed Notes */}
                  <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-200/70 text-xs text-stone-700 font-semibold leading-relaxed">
                    {item.detailedNotes}
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {item.badges.map((badge, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-200"
                      >
                        #{badge}
                      </span>
                    ))}
                  </div>

                  {/* Contact Info (if available) */}
                  {(item.phone || item.email) && (
                    <div className="pt-2 flex items-center gap-2 flex-wrap text-xs">
                      {item.phone && (
                        <a
                          href={`tel:${item.phone.replace(/[^0-9]/g, '')}`}
                          className="px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold flex items-center gap-1.5 border border-stone-200 active:scale-95 transition"
                          title="Call"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{item.phone}</span>
                        </a>
                      )}
                      {item.email && (
                        <a
                          href={`mailto:${item.email}`}
                          className="px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold flex items-center gap-1.5 border border-stone-200 active:scale-95 transition"
                          title="Email"
                        >
                          <Mail className="w-3 h-3 text-blue-600" />
                          <span>{item.email}</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(item.url, item.id, 'Resource Link')}
                    className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center gap-1.5 border border-stone-200 cursor-pointer active:scale-95 transition"
                    title={t('Copy link')}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">{t('Copied!')}</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-stone-500" />
                        <span>{t('Share')}</span>
                      </>
                    )}
                  </button>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs flex items-center gap-1.5 shadow-2xs active:scale-95 transition"
                  >
                    <span>{t('Visit Official Resource')}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUGGEST A RESOURCE FOOTER BANNER */}
      <div className="p-4 rounded-2xl bg-stone-100/80 border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600 font-semibold">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            {t('Know an active regional autism program or support circle in your area? Let us know so we can add it.')}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            if (typeof navigator !== 'undefined' && navigator.clipboard) {
              navigator.clipboard.writeText('support@beeyou.app').catch(() => {});
              onShowNotification('Copied support@beeyou.app to clipboard!');
              playChime('tap');
            }
          }}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-stone-800 font-black text-xs border border-stone-300 shadow-2xs cursor-pointer active:scale-95 transition shrink-0"
        >
          support@beeyou.app
        </button>
      </div>
    </div>
  );
};
