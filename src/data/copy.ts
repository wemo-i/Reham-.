import { Locale, WordCategory } from '../types';

export interface ConsentSection {
  title: string;
  body: string;
}

export interface AppCopy {
  brandTitle: string;
  navExperiment: string;
  navDashboard: string;
  languageSwitch: string;
  introKicker: string;
  introHeadline: string;
  introLead: string;
  consentFormHeader: string;
  studyTitleLabel: string;
  studyTitleValue: string;
  consentSections: ConsentSection[];
  agreementHeading: string;
  agreeOption: string;
  declineOption: string;
  declinedTitle: string;
  declinedMessage: string;
  reconsiderButton: string;
  participantLabel: string;
  participantPlaceholder: string;
  participantHelp: string;
  generateCode: string;
  startButton: string;
  consentRequiredHint: string;
  openDashboardLink: string;
  protocolMeta: string[];
  trialQuestion: string;
  yesLabel: string;
  noLabel: string;
  trialHint: string;
  exitSession: string;
  pointsLabel: string;
  reflexFast: string;
  soundOn: string;
  soundOff: string;
  thankYouHeadline: string;
  thankYouBody: string;
  personalSummaryTitle: string;
  realRecognizedLabel: string;
  coinedSpottedLabel: string;
  nonwordsRejectedLabel: string;
  avgSpeedLabel: string;
  redirectingNotice: (seconds: number) => string;
  glossaryPromptTitle: string;
  glossaryPromptSubtitle: string;
  glossaryOpenButton: string;
  glossaryCloseButton: string;
  glossaryCredit: string;
  yourAnswerLabel: string;
  viewStatsNow: string;
  playAgain: string;
  studentCompleteNotice: string;
  dashboardTitle: string;
  dashboardSubtitle: string;
  copyStudentLink: string;
  copyResearcherLink: string;
  copiedLabel: string;
  refreshResults: string;
  exportCsv: string;
  lockDashboard: string;
  researcherAccessLabel: string;
  researcherPinTitle: string;
  researcherPinSubtitle: string;
  researcherPinPlaceholder: string;
  researcherPinSubmit: string;
  researcherPinCancel: string;
  researcherPinError: string;
  researcherAuthTitle: string;
  researcherAuthDesc: string;
  researcherSignInButton: string;
  researcherSignOutButton: string;
  researcherWrongAccountNotice: string;
  researcherAuthError: string;
  newParticipant: string;
  clearData: string;
  confirmClear: string;
  cancelClear: string;
  statParticipants: string;
  statResponses: string;
  statOverallYes: string;
  statLastUpdated: string;
  categorySectionTitle: string;
  categorySectionDesc: string;
  yesRateLabel: string;
  chartTitle: string;
  wordBreakdownTitle: string;
  filterAll: string;
  participantFilterLabel: string;
  allParticipants: string;
  colWord: string;
  colCategory: string;
  colTrials: string;
  colYes: string;
  colNo: string;
  colYesRate: string;
  recentLogsTitle: string;
  colParticipant: string;
  colAnswer: string;
  colTimestamp: string;
  emptyTitle: string;
  emptyDesc: string;
  emptyAction: string;
  categoryLabels: Record<WordCategory, { title: string; subtitle: string }>;
}

export const COPY: Record<Locale, AppCopy> = {
  en: {
    brandTitle: 'Mystic Lexicon',
    navExperiment: 'Play Game',
    navDashboard: 'Researcher Dashboard',
    languageSwitch: 'العربية',
    introKicker: 'Enchanted Word Challenge · 24 Mystical Cards',
    introHeadline: 'Real Word or Enchanted Illusion?',
    introLead:
      'Step into the silver mist and test your linguistic intuition across 24 mysterious word cards. Read the research consent below to unlock the challenge.',
    consentFormHeader: 'Informed Consent Form',
    studyTitleLabel: 'Study Title:',
    studyTitleValue: 'Recognition of Coined Words in Harry Potter as Real English Words',
    consentSections: [
      {
        title: '1. Purpose of the Study',
        body: 'This study investigates whether people recognize coined words from Harry Potter as real English words and whether familiar word patterns influence their judgments.',
      },
      {
        title: '2. What Will You Do?',
        body: 'You will complete a short word-judgement task. You will see coined words, real English words, and invented words that resemble English words. For each word, you will answer “Yes” or “No” to indicate whether you think it is a real English word.',
      },
      {
        title: '3. Voluntary Participation',
        body: 'Participation is voluntary. You may stop at any time without penalty.',
      },
      {
        title: '4. Risks and Benefits',
        body: 'This study involves minimal risk. You may feel uncertain when judging unfamiliar words. There may be no direct personal benefit, but the findings may contribute to research on word recognition.',
      },
      {
        title: '5. Privacy and Use of Information',
        body: 'No names or directly identifying information will be collected. Responses will be kept confidential, analysed for academic research, and presented in summary form.',
      },
      {
        title: '6. Consent',
        body: 'By selecting “I agree,” you confirm that you have read and understood this information and voluntarily agree to participate.',
      },
    ],
    agreementHeading: "Participant's Agreement:",
    agreeOption: 'I agree to participate in this study.',
    declineOption: 'I do not agree to participate in this study.',
    declinedTitle: 'Participation Declined',
    declinedMessage:
      'Thank you for your time. Because you chose not to participate, the word challenge will not begin and no responses have been recorded.',
    reconsiderButton: 'Review Consent Form',
    participantLabel: 'Participant Code (Optional)',
    participantPlaceholder: 'e.g. P-8421',
    participantHelp: 'Leave blank to automatically assign an anonymous random code.',
    generateCode: 'Random Code',
    startButton: 'Start Game',
    consentRequiredHint: 'Please select "I agree to participate in this study." above to begin.',
    openDashboardLink: 'View Researcher Dashboard',
    protocolMeta: ['24 enchanted word cards', 'Voluntary & anonymous', 'Takes ~2 minutes'],
    trialQuestion: 'Do you think this is a real English word?',
    yesLabel: 'Yes',
    noLabel: 'No',
    trialHint: 'Tap a luminous seal below or press ← for Yes and → for No',
    exitSession: 'Exit Game',
    pointsLabel: 'Points',
    reflexFast: 'Quick Reflex',
    soundOn: 'Sound On',
    soundOff: 'Muted',
    thankYouHeadline: 'Challenge Complete!',
    thankYouBody: 'All 24 responses have been confidentially recorded for participant',
    personalSummaryTitle: 'Your Challenge Summary',
    realRecognizedLabel: 'Real Words ("Yes")',
    coinedSpottedLabel: 'Coined Words ("Yes")',
    nonwordsRejectedLabel: 'Nonwords ("No")',
    avgSpeedLabel: 'Avg. Speed',
    redirectingNotice: (seconds: number) => `Opening Researcher Dashboard in ${seconds}s...`,
    glossaryPromptTitle: 'Curious about the magic behind those words?',
    glossaryPromptSubtitle:
      'Discover the enchanting meanings of the coined words featured in this challenge.',
    glossaryOpenButton: 'Reveal Magical Word Meanings',
    glossaryCloseButton: 'Hide Meanings',
    glossaryCredit:
      'These 8 coined words were created by Harry Potter author J.K. Rowling—blending familiar English word patterns with wizarding lore.',
    yourAnswerLabel: 'Your answer',
    viewStatsNow: 'Open Statistics Now',
    playAgain: 'Play Again',
    studentCompleteNotice: 'Your responses have been safely recorded. You may now close this page.',
    dashboardTitle: 'Researcher Dashboard',
    dashboardSubtitle: 'Aggregated lexical decision rates across all recorded participants.',
    copyStudentLink: 'Copy Student Link',
    copyResearcherLink: 'Copy My Results Link',
    copiedLabel: 'Copied!',
    refreshResults: 'Refresh',
    exportCsv: 'Export CSV',
    lockDashboard: 'Lock Results',
    researcherAccessLabel: 'Researcher Access',
    researcherPinTitle: 'Researcher Results Access',
    researcherPinSubtitle: 'Enter the researcher passcode to view participant data and export CSV.',
    researcherPinPlaceholder: 'Passcode',
    researcherPinSubmit: 'Unlock Results',
    researcherPinCancel: 'Cancel',
    researcherPinError: 'Incorrect passcode. Please try again.',
    researcherAuthTitle: 'Researcher Google Sign-In Required',
    researcherAuthDesc:
      'Participant responses are stored permanently in Cloud Firestore. Sign in with your authorized researcher Google account to view, export, or manage study data.',
    researcherSignInButton: 'Sign in with Google',
    researcherSignOutButton: 'Sign Out',
    researcherWrongAccountNotice:
      'Signed in with a different Google account. Please sign in with the authorized researcher account.',
    researcherAuthError: 'Google sign-in could not be completed. Please try again.',
    newParticipant: 'New Participant',
    clearData: 'Reset Study Data',
    confirmClear: 'Confirm Reset',
    cancelClear: 'Cancel',
    statParticipants: 'Participants',
    statResponses: 'Recorded Trials',
    statOverallYes: 'Overall "Yes" Rate',
    statLastUpdated: 'Latest Response',
    categorySectionTitle: '"Yes" Selection Rate by Word Category',
    categorySectionDesc:
      'Percentage of trials where participants judged the stimulus to be a real English word.',
    yesRateLabel: '"Yes" selected',
    chartTitle: 'Category Comparison (% Selected "Yes")',
    wordBreakdownTitle: 'All 24 Words Breakdown',
    filterAll: 'All Categories',
    participantFilterLabel: 'Participant',
    allParticipants: 'All Participants',
    colWord: 'Word',
    colCategory: 'Category',
    colTrials: 'Trials',
    colYes: 'Yes',
    colNo: 'No',
    colYesRate: '"Yes" %',
    recentLogsTitle: 'Recorded Trial Log',
    colParticipant: 'Participant Code',
    colAnswer: 'Answer',
    colTimestamp: 'Timestamp',
    emptyTitle: 'No experiment trials recorded yet',
    emptyDesc:
      'Complete a 24-word participant session to populate category statistics, word recognition rates, and downloadable CSV logs.',
    emptyAction: 'Start First Session',
    categoryLabels: {
      'Real English Words': {
        title: 'Real English Words',
        subtitle: 'Recognition rate as genuine English words',
      },
      'Harry Potter Coined Words': {
        title: 'Harry Potter Coined Words',
        subtitle: 'Rate mistaken for real English words',
      },
      'Plausible Nonwords': {
        title: 'Plausible Nonwords',
        subtitle: 'False-alarm rate for invented pseudowords',
      },
    },
  },
  ar: {
    brandTitle: 'معجم الضباب السحري',
    navExperiment: 'اللعبة',
    navDashboard: 'لوحة تحكم الباحث',
    languageSwitch: 'English',
    introKicker: 'تحدي الكلمات السحري · 24 بطاقة غامضة',
    introHeadline: 'كلمة إنجليزية حقيقية أم وهم سحري؟',
    introLead:
      'ادخل إلى الضباب الفضي واختبر حدسك اللغوي عبر 24 بطاقة كلمات غامضة. اقرأ نموذج الموافقة البحثية أدناه لبدء التحدي.',
    consentFormHeader: 'نموذج الموافقة المستنيرة (Informed Consent Form)',
    studyTitleLabel: 'عنوان الدراسة:',
    studyTitleValue: 'Recognition of Coined Words in Harry Potter as Real English Words',
    consentSections: [
      {
        title: '1. الغرض من الدراسة (Purpose of the Study)',
        body: 'تبحث هذه الدراسة فيما إذا كان الأشخاص يتعرفون على الكلمات المبتكرة من عالم هاري بوتر ككلمات إنجليزية حقيقية، وما إذا كانت أنماط الكلمات المألوفة تؤثر على أحكامهم.',
      },
      {
        title: '2. ما الذي ستفعله؟ (What Will You Do?)',
        body: 'ستكمل مهمة قصيرة للحكم على الكلمات، حيث ستشاهد كلمات مبتكرة وكلمات إنجليزية حقيقية وكلمات مخترعة تشبه الإنجليزية، وستجيب بـ "Yes" أو "No" لتحديد ما إذا كنت تعتقد أنها كلمة إنجليزية حقيقية.',
      },
      {
        title: '3. المشاركة الطوعية (Voluntary Participation)',
        body: 'المشاركة طوعية تماماً، ويمكنك التوقف في أي وقت دون أي تبعات.',
      },
      {
        title: '4. المخاطر والفوائد (Risks and Benefits)',
        body: 'تنطوي هذه الدراسة على حد أدنى من المخاطر، وقد تشعر بعدم اليقين عند الحكم على كلمات غير مألوفة. قد لا تكون هناك فائدة شخصية مباشرة، لكن النتائج تساهم في أبحاث التعرف على الكلمات.',
      },
      {
        title: '5. الخصوصية واستخدام المعلومات (Privacy and Use of Information)',
        body: 'لن يتم جمع أي أسماء أو معلومات تعريف شخصية. ستبقى الإجابات سرية، وتُحلل لأغراض البحث الأكاديمي وتُعرض بشكل ملخص.',
      },
      {
        title: '6. الموافقة (Consent)',
        body: 'باختيارك "أوافق"، فإنك تؤكد أنك قرأت وفهمت هذه المعلومات وتوافق طواعيةً على المشاركة.',
      },
    ],
    agreementHeading: 'إقرار المشارك:',
    agreeOption: 'أوافق على المشاركة في هذه الدراسة.',
    declineOption: 'لا أوافق على المشاركة في هذه الدراسة.',
    declinedTitle: 'تم رفض المشاركة',
    declinedMessage:
      'شكراً لوقتك. نظراً لعدم الموافقة على المشاركة، لن تبدأ التجربة ولن يتم تسجيل أي بيانات.',
    reconsiderButton: 'مراجعة نموذج الموافقة',
    participantLabel: 'رمز المشارك (اختياري)',
    participantPlaceholder: 'مثال: P-8421',
    participantHelp: 'اترك الحقل فارغاً ليتم تعيين رمز عشوائي مجهول تلقائياً.',
    generateCode: 'رمز عشوائي',
    startButton: 'ابدأ اللعبة',
    consentRequiredHint: 'يرجى اختيار "أوافق على المشاركة في هذه الدراسة" أعلاه للبدء.',
    openDashboardLink: 'عرض لوحة تحكم الباحث',
    protocolMeta: ['24 بطاقة سحرية', 'مشاركة طوعية ومجهولة', 'دقيقتان تقريباً'],
    trialQuestion: 'Do you think this is a real English word?',
    yesLabel: 'Yes',
    noLabel: 'No',
    trialHint: 'اضغط على أحد الزرين أو استخدم الأسهم: ← Yes / → No',
    exitSession: 'إنهاء',
    pointsLabel: 'نقطة',
    reflexFast: 'سرعة فائقة',
    soundOn: 'الصوت مفعل',
    soundOff: 'كتم الصوت',
    thankYouHeadline: 'أحسنت! اكتمل التحدي',
    thankYouBody: 'تم تسجيل جميع الاستجابات الـ 24 بسرية تامة للمشارك',
    personalSummaryTitle: 'ملخص جولتك',
    realRecognizedLabel: 'كلمات حقيقية (Yes)',
    coinedSpottedLabel: 'كلمات مبتكرة (Yes)',
    nonwordsRejectedLabel: 'كلمات زائفة (No)',
    avgSpeedLabel: 'متوسط السرعة',
    redirectingNotice: (seconds: number) => `الانتقال إلى إحصائيات البيانات خلال ${seconds} ثوانٍ...`,
    glossaryPromptTitle: 'هل تتساءل عن أسرار هذه الكلمات السحرية؟',
    glossaryPromptSubtitle:
      'اكتشف المعاني الخفية للكلمات المبتكرة التي ظهرت لك في هذا التحدي.',
    glossaryOpenButton: 'اكشف معاني كلمات هاري بوتر',
    glossaryCloseButton: 'إخفاء المعاني',
    glossaryCredit:
      'هذه الكلمات الثماني هي من إبداع كاتبة سلسلة هاري بوتر ج. ك. رولينغ (J.K. Rowling)، حيث صنعتها بدمج أنماط اللغة الإنجليزية مع عالم السحر.',
    yourAnswerLabel: 'إجابتك',
    viewStatsNow: 'عرض الإحصائيات الآن',
    playAgain: 'العب مجدداً',
    studentCompleteNotice: 'تم حفظ إجاباتك بنجاح. يمكنك الآن إغلاق هذه الصفحة.',
    dashboardTitle: 'لوحة تحكم الباحث',
    dashboardSubtitle: 'إحصائيات النسب المئوية لاختيار "Yes" عبر جميع المشاركين المسجلين.',
    copyStudentLink: 'نسخ رابط الطلاب',
    copyResearcherLink: 'نسخ رابط النتائج الخاص بي',
    copiedLabel: 'تم النسخ!',
    refreshResults: 'تحديث النتائج',
    exportCsv: 'تصدير CSV',
    lockDashboard: 'قفل النتائج',
    researcherAccessLabel: 'دخول الباحث',
    researcherPinTitle: 'لوحة نتائج الباحث',
    researcherPinSubtitle: 'أدخل رمز الباحث لعرض إجابات المشاركين وتصدير ملف CSV.',
    researcherPinPlaceholder: 'رمز الدخول',
    researcherPinSubmit: 'فتح النتائج',
    researcherPinCancel: 'إلغاء',
    researcherPinError: 'الرمز غير صحيح، حاول مرة أخرى.',
    researcherAuthTitle: 'تسجيل دخول الباحث عبر Google',
    researcherAuthDesc:
      'يتم حفظ إجابات المشاركين بشكل دائم في قاعدة البيانات السحابية. سجّل الدخول بحساب Google المصرّح للباحث لعرض النتائج وتصدير ملف CSV.',
    researcherSignInButton: 'تسجيل الدخول بحساب Google',
    researcherSignOutButton: 'تسجيل الخروج',
    researcherWrongAccountNotice:
      'تم تسجيل الدخول بحساب Google آخر غير مصرّح له. يرجى التبديل إلى حساب الباحث المصرّح.',
    researcherAuthError: 'تعذر إتمام تسجيل الدخول عبر Google. حاول مرة أخرى.',
    newParticipant: 'مشارك جديد',
    clearData: 'مسح البيانات',
    confirmClear: 'تأكيد المسح',
    cancelClear: 'إلغاء',
    statParticipants: 'عدد المشاركين',
    statResponses: 'الاستجابات المسجلة',
    statOverallYes: 'نسبة "Yes" الإجمالية',
    statLastUpdated: 'آخر استجابة',
    categorySectionTitle: 'نسبة اختيار "Yes" حسب فئة الكلمات',
    categorySectionDesc:
      'النسبة المئوية للمحاولات التي اعتقد فيها المشاركون أن الكلمة المعروضة هي كلمة إنجليزية حقيقية.',
    yesRateLabel: 'نسبة اختيار Yes',
    chartTitle: 'مقارنة الفئات (نسبة اختيار "Yes")',
    wordBreakdownTitle: 'تفاصيل الـ 24 كلمة',
    filterAll: 'جميع الفئات',
    participantFilterLabel: 'المشارك',
    allParticipants: 'جميع المشاركين',
    colWord: 'الكلمة',
    colCategory: 'الفئة',
    colTrials: 'المحاولات',
    colYes: 'Yes',
    colNo: 'No',
    colYesRate: 'نسبة Yes',
    recentLogsTitle: 'سجل الاستجابات المسجلة',
    colParticipant: 'رمز المشارك',
    colAnswer: 'الإجابة',
    colTimestamp: 'الطابع الزمني',
    emptyTitle: 'لا توجد جولات مسجلة حتى الآن',
    emptyDesc:
      'أكمل جولة من 24 بطاقة لعرض إحصائيات الفئات وتفاصيل الكلمات وتصدير ملف CSV.',
    emptyAction: 'ابدأ أول جلسة',
    categoryLabels: {
      'Real English Words': {
        title: 'Real Words (كلمات إنجليزية حقيقية)',
        subtitle: 'نسبة التعرف عليها ككلمات إنجليزية حقيقية',
      },
      'Harry Potter Coined Words': {
        title: 'Harry Potter Words (كلمات هاري بوتر)',
        subtitle: 'نسبة الاعتقاد بأنها كلمات إنجليزية حقيقية',
      },
      'Plausible Nonwords': {
        title: 'Plausible Nonwords (كلمات زائفة معقولة)',
        subtitle: 'نسبة الاعتقاد بأنها كلمات إنجليزية حقيقية',
      },
    },
  },
};
