import { CaregiverAlert } from '../types';

export interface QuickReplyOption {
  id: string;
  label: string;
  text: string;
  className: string;
}

/**
 * Returns contextually intelligent quick reply responses tailored to the specific alert.
 * E.g., for "Finished My Task! ⭐", it offers "🌟 Great Job!", "🎉 Awesome Work!", "👏 Proud of You!"
 * instead of inappropriate emergency replies like "I'm on my way" or "I'm here for you".
 */
export function getQuickRepliesForAlert(
  alert: Partial<CaregiverAlert> | null | undefined,
  t: (key: string) => string = (s) => s
): QuickReplyOption[] {
  if (!alert) {
    return [
      {
        id: 'coming',
        label: t("🚗 I'm On My Way"),
        text: t("I'm on my way! 🚗"),
        className: 'bg-rose-600 hover:bg-rose-700 text-white',
      },
      {
        id: 'im_here',
        label: t("❤️ I'm Here For You"),
        text: t("I'm here for you ❤️ Take a deep breath."),
        className: 'bg-slate-900 hover:bg-slate-800 text-white',
      },
      {
        id: 'give_minutes',
        label: t("⏳ 5 Minutes"),
        text: t("Give me 5 minutes, finish what you're doing ⏳"),
        className: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
      },
    ];
  }

  const id = (alert.alertId || alert.id || '').toLowerCase();
  const label = (alert.label || '').toLowerCase();
  const note = (alert.note || '').toLowerCase();
  const emoji = alert.emoji || '';
  const textCorpus = `${id} ${label} ${note}`;

  // 1. FINISHED TASK / ROUTINE DONE / CELEBRATION
  if (
    id === 'task_done' ||
    textCorpus.includes('task') ||
    textCorpus.includes('finish') ||
    textCorpus.includes('done') ||
    textCorpus.includes('completed') ||
    textCorpus.includes('routine done') ||
    textCorpus.includes('i did it') ||
    emoji.includes('⭐') ||
    emoji.includes('🌟') ||
    emoji.includes('✅') ||
    emoji.includes('🏆')
  ) {
    return [
      {
        id: 'good_job',
        label: t("🌟 Great Job!"),
        text: t("Super proud of you! Great job finishing your task! ⭐"),
        className: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      },
      {
        id: 'awesome_work',
        label: t("🎉 Awesome Work!"),
        text: t("Awesome work! You did it, take a fun break! 🎉"),
        className: 'bg-purple-600 hover:bg-purple-700 text-white',
      },
      {
        id: 'proud',
        label: t("👏 Proud of You!"),
        text: t("Super proud of you! Keep up the great work! 💫"),
        className: 'bg-slate-900 hover:bg-slate-800 text-white',
      },
    ];
  }

  // 2. SEND LOVE / HUG / CHECK-IN
  if (
    id === 'love_hug' ||
    textCorpus.includes('love') ||
    textCorpus.includes('hug') ||
    textCorpus.includes('thinking of you') ||
    textCorpus.includes('miss you') ||
    emoji.includes('❤️') ||
    emoji.includes('🤗') ||
    emoji.includes('🥰')
  ) {
    return [
      {
        id: 'love_you',
        label: t("❤️ Love You Too!"),
        text: t("Love you so much! Sending you the biggest hugs! ❤️"),
        className: 'bg-rose-600 hover:bg-rose-700 text-white',
      },
      {
        id: 'hug_back',
        label: t("🤗 Big Hug Back!"),
        text: t("Big warm hug right back to you! You make me smile! ✨"),
        className: 'bg-amber-600 hover:bg-amber-700 text-white',
      },
      {
        id: 'proud_day',
        label: t("✨ You Are Awesome!"),
        text: t("Thinking of you too! You are doing amazing today! 🌟"),
        className: 'bg-slate-900 hover:bg-slate-800 text-white',
      },
    ];
  }

  // 3. READY FOR PICKUP / GO HOME
  if (
    id === 'pickup_ready' ||
    textCorpus.includes('pickup') ||
    textCorpus.includes('pick up') ||
    textCorpus.includes('home') ||
    textCorpus.includes('leave') ||
    textCorpus.includes('car') ||
    textCorpus.includes('bus') ||
    emoji.includes('🚗') ||
    emoji.includes('🚌')
  ) {
    return [
      {
        id: 'coming',
        label: t("🚗 I'm On My Way"),
        text: t("I'm on my way to get you! See you very soon 🚗"),
        className: 'bg-rose-600 hover:bg-rose-700 text-white',
      },
      {
        id: 'leaving_5m',
        label: t("⏳ Leaving in 5 Mins"),
        text: t("Leaving in 5 minutes! Wait safely inside 🏫"),
        className: 'bg-amber-600 hover:bg-amber-700 text-white',
      },
      {
        id: 'almost_there',
        label: t("📍 Almost There"),
        text: t("Almost there! Wait right where you are 🚗"),
        className: 'bg-slate-900 hover:bg-slate-800 text-white',
      },
    ];
  }

  // 4. HUNGRY / THIRSTY / MEAL / SNACK
  if (
    id === 'hungry_thirsty' ||
    textCorpus.includes('hungry') ||
    textCorpus.includes('thirsty') ||
    textCorpus.includes('food') ||
    textCorpus.includes('snack') ||
    textCorpus.includes('drink') ||
    textCorpus.includes('water') ||
    emoji.includes('🥪') ||
    emoji.includes('🍎') ||
    emoji.includes('🍕') ||
    emoji.includes('🥤')
  ) {
    return [
      {
        id: 'snack_coming',
        label: t("🍎 Snack Coming Up!"),
        text: t("Snack is coming right up! Getting it ready for you 🍎"),
        className: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      },
      {
        id: 'drink_water',
        label: t("💧 Drink Some Water"),
        text: t("Take a sip of water, grabbing food for you now! 🥤"),
        className: 'bg-sky-600 hover:bg-sky-700 text-white',
      },
      {
        id: 'ready_5m',
        label: t("⏰ Ready in 5 Mins"),
        text: t("Got it! Food will be ready in 5 minutes 🥪"),
        className: 'bg-amber-600 hover:bg-amber-700 text-white',
      },
    ];
  }

  // 5. NEED RESTROOM / BATHROOM
  if (
    id === 'restroom' ||
    textCorpus.includes('restroom') ||
    textCorpus.includes('bathroom') ||
    textCorpus.includes('toilet') ||
    textCorpus.includes('potty') ||
    emoji.includes('🚽')
  ) {
    return [
      {
        id: 'go_ahead',
        label: t("🚻 Go Right Ahead"),
        text: t("Go right ahead! Take your time, you are all good 👍"),
        className: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      },
      {
        id: 'coming_help',
        label: t("🏃 Coming to Help"),
        text: t("I'm coming to help you right now! 🏃"),
        className: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      },
      {
        id: 'got_it_restroom',
        label: t("👍 Got It, Go Ahead"),
        text: t("Got your message! Go ahead to the restroom 👍"),
        className: 'bg-slate-900 hover:bg-slate-800 text-white',
      },
    ];
  }

  // 6. NEED A BREAK / PAUSE
  if (
    id === 'need_break' ||
    textCorpus.includes('break') ||
    textCorpus.includes('pause') ||
    textCorpus.includes('rest') ||
    textCorpus.includes('quiet') ||
    emoji.includes('🧘') ||
    emoji.includes('🌿')
  ) {
    return [
      {
        id: 'take_time',
        label: t("🧘 Take All Time You Need"),
        text: t("Take all the time you need! You've got this 🌿"),
        className: 'bg-teal-600 hover:bg-teal-700 text-white',
      },
      {
        id: 'good_choice',
        label: t("👍 Great Choice to Rest"),
        text: t("Great job listening to your body and taking a break 👍"),
        className: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      },
      {
        id: 'im_here',
        label: t("❤️ I'm Here If Needed"),
        text: t("Rest up and relax. I'm right here if you need anything ❤️"),
        className: 'bg-slate-900 hover:bg-slate-800 text-white',
      },
    ];
  }

  // 7. OVERWHELMED / SENSORY OVERLOAD
  if (
    id === 'overwhelmed' ||
    textCorpus.includes('overwhelm') ||
    textCorpus.includes('sensory') ||
    textCorpus.includes('loud') ||
    textCorpus.includes('bright') ||
    textCorpus.includes('scared') ||
    textCorpus.includes('panic') ||
    emoji.includes('😣') ||
    emoji.includes('🔊') ||
    emoji.includes('🎧')
  ) {
    return [
      {
        id: 'headphones',
        label: t("🎧 Put On Headphones"),
        text: t("Put on your headphones and close your eyes. You are safe 🎧"),
        className: 'bg-purple-600 hover:bg-purple-700 text-white',
      },
      {
        id: 'coming_now',
        label: t("🚗 Coming Right Now"),
        text: t("I am coming to help you right now. You are not alone ❤️"),
        className: 'bg-rose-600 hover:bg-rose-700 text-white',
      },
      {
        id: 'breathe_together',
        label: t("🫁 Breathe With Me"),
        text: t("Find a cozy spot. Let's take 3 slow, deep breaths together 🫁"),
        className: 'bg-slate-900 hover:bg-slate-800 text-white',
      },
    ];
  }

  // 8. GENERAL SOS / NEED HELP (DEFAULT / FALLBACK)
  return [
    {
      id: 'coming',
      label: t("🚗 I'm On My Way"),
      text: t("I'm on my way! 🚗 Keep breathing, help is coming."),
      className: 'bg-rose-600 hover:bg-rose-700 text-white',
    },
    {
      id: 'im_here',
      label: t("❤️ I'm Here For You"),
      text: t("I'm here for you ❤️ Take a slow deep breath, you are safe."),
      className: 'bg-slate-900 hover:bg-slate-800 text-white',
    },
    {
      id: 'give_minutes',
      label: t("⏳ 5 Minutes, Stay Safe"),
      text: t("Give me 5 minutes, stay safe right where you are ⏳"),
      className: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
  ];
}
