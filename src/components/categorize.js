// ── Doc Type Detection ────────────────────────────────────────────────────────
const docKeywords = [
  {
    keys: ['tutor', 'ติว', 'tutoring', 'tutorial', 'ติวศรว', 'ติว nl',
      'nle1 tutoring', 'nle tutoring', 'peer support',
      'peer tutoring', 'lecture ติว', 'slide ติว',
      'preparation lecture', 'prep lecture'], val: 'Tutoring'
  },

  {
    keys: [
      'nle step 1', 'nle1', 'nle 1', 'nl step 1', 'nl1',
      'national license step 1', 'national licence step 1',
      'ศรว ขั้นที่ 1', 'ศรว.1', 'nle step1',
      'ac nle1', 'nl | step 01', 'nl step 01',
      'nle step 1 20', 'step 1 20'
    ], val: 'NLE 1'
  },

  {
    keys: [
      'nle step 2', 'nle2', 'nle 2', 'nl step 2', 'nl2',
      'national license step 2', 'national licence step 2',
      'ศรว ขั้นที่ 2', 'ศรว.2', 'nle step2',
      'ac nle2', 'nl | step 02', 'nl step 02',
      'nle step 2 20', 'step 2 20', 'nl2 tutorial'
    ], val: 'NLE 2'
  },

  {
    keys: [
      'comprehensive step 1', 'compre step 1', 'comprehensive step1',
      'compre step1', 'comprehensive review step 1',
      'comprehensive review step1', 'comprehensive & nle',
      'ac compre', 'compre mdcu', 'compre 20', 'compre73', 'compre74',
      'compre75', 'compre76', 'compre77', 'compre78',
      'compre เช้า', 'compre บ่าย',
      'compreswu', 'compresiriraj', 'compretu', 'comprersu', 'comprepsu'
    ], val: 'Comprehensive Review STEP 1'
  },

  {
    keys: [
      'comprehensive step 2', 'compre step 2', 'comprehensive step2',
      'compre step2', 'comprehensive review step 2',
      'comprehensive review step2',
      'ac comprehensive step 2', 'compre step 2 mdcu'
    ], val: 'Comprehensive Review STEP 2'
  },

  {
    keys: ['summary', 'สรุป', 'sum ', 'sum_', 'survival guide',
      'short note', 'short key', 'shortnote',
      'recall sheet', 'mind map', 'mindmap',
      'โพย', 'keyword', 'synopsis', 'review',
      'sum up', 'compilation', 'integrate',
      'map -', 'map cvs', 'map gi', 'map rs', 'map kub',
      'thoughts cluster', 'recall',
      'cheat sheet', 'first aid',
      'neuro physio', 'neuro anatomy',
      'สรุปรวม', 'สรุปพี่'], val: 'Summary'
  },

  { keys: ['checklist', 'check list'], val: 'Checklist' },

  {
    keys: ['precourse', 'pre-course', 'pre course',
      'pre clinic', 'pre-clinic'], val: 'Precourse'
  },

  {
    keys: ['guideline', 'cpg', 'criteria',
      'specification', 'protocol'], val: 'Guideline'
  },

  {
    keys: ['slide', 'ppt', 'powerpoint', 'lecture note', 'lecture',
      'handout', 'สไลด์', 'slides',
      'b1 general principles', 'b2 hematopoi',
      'b3 central', 'b4 skin', 'b5 muscul',
      'b6 respiratory', 'b7 cardiovascular',
      'b8 gastrointestinal', 'b9 renal',
      'b10 reproductive', 'b11 endocrine',
      'essential content', 'for student',
      'nle skin', 'nle immunology', 'nle ms',
      'nle1 rs', 'nle cvs', 'nle gi',
      'ms for nle', 'ns for nle'], val: 'Lecture Slide'
  },

  {
    keys: ['worksheet', 'lab ', 'laboratory', 'spot test',
      'spot ', 'ชิง', 'case study', 'case ',
      'pbl', 'tbl', 'formative',
      'lab cell bio', 'lab-', 'lab_',
      'spot tissue', 'spot micro', 'spot hemato',
      'spot kub', 'spot rs', 'spot cvs',
      'spot ms', 'spot neuro', 'spot gi',
      'spot repro', 'histo ',
      'images', 'image',
      'anatomy of', 'gross anatomy',
      'histology of'], val: 'Lab & Spottest'
  },

  {
    keys: ['others', 'other', 'อื่น', 'อื่นๆ',
      'dump', 'misc', 'etc'], val: 'Other'
  },

  {
    keys: [
      'accebs', 'ac cebs', 'acanthocyte', 'acetazolamide',
      'acetoacetate', 'acetylcholine', 'achalasia', 'achilles',
      'achlorhydria', 'achromat', 'acinus', 'acne',
      'acapnia', 'ace inhibitor', 'acromegaly', 'acpiwat',
      'acgasm', 'acromion', 'acetabulum', 'accumulation',
      'acxiety', 'acbestos', 'acidity', 'acsolute',
      'acanthocyte', 'acantholy', 'acne', 'actin',
      'aclimatized', 'accouche', 'acgasm', 'placenta',
      'fracture', 'cardiac', 'stomach', 'levetira',
      'tofacitinib', 'tacrolimus', 'sinovac', 'climacterium',
      'lactation', 'macrophage', 'liquefactive', 'anthracosis',
      'poogunexe', 'a[c]solute',
      'mcq', 'meq', 'osce', 'ข้อสอบ', 'ac nle',
      'แอค', 'question', 'key ', ' key',
      'recall', 'โจทย์', 'เฉลย', 'solution',
      'answer', 'ans ', 'ans_',
      'ac ', 'ac_', 'ac78', 'ac77', 'ac76', 'ac75',
      'ac74', 'ac73', 'ac72', 'ac71', 'ac70', 'ac69',
      'ac68', 'ac67', 'ac66', 'ac65',
      'peer solution', 'peer ac',
      'mock', 'exercise', 'excercise', 'practice',
      'smst', 'nctms', 'kku', 'compre step',
      'rotate', 'rotation', 'r1', 'r2', 'r3', 'r4',
      'rotate a', 'rotate b', 'rotate c', 'rotate d',
      'midterm', 'final', 'ปลาย', 'กลาง',
    ], val: 'AC'
  },
];

// ── Block Map ─────────────────────────────────────────────────────────────────
export const blockMap = [
  {
    keys: [
      'DR/SOC', '3000106', 'DOCTOR AND SOCIETY', 'DOCTOR & SOCIETY',
      'MPD', 'INTRO MED', 'INTRODUCTION TO MEDICINE',
      'DOCTOR SOC', 'DOCSOC'
    ], val: 'MPD'
  },

  // ── Cell Bio & Med Biochem ────────────────────────────────────────────────
  {
    keys: [
      'FUND CELL MOL BIO', 'CELL BIO', 'CELL BIOLOGY', '3000109', 'FCMB',
      'BIOCHEM', 'BIOCHEMISTRY', 'MED BIOCHEM', '3000113', 'ACETOACETATE',
      'METAB', 'METABOLISM', 'BIOCHEM/NUTRI', 'ACTIN',
      'CELL AND MOLECULAR', 'B1.1 BIOCHEM', 'B1.1 BIOCHEMISTRY',
      'INTEGRATION OF METABOLISM', 'CARBOHYDRATE METABOLISM',
      'LIPID METABOLISM', 'AMINO ACID', 'NUCLEOTIDE METAB',
      'ENERGY METABOLISM', 'G6PD', 'INBORN ERROR', 'NUTRITION',
      'TISS BIO', 'TISSUE BIO', '3000111', '3000259', 'ACHROMAT',
      'MED CHEM', '3000103', 'MEDICAL CHEMISTRY',
      'MED PHYS', '3000105', 'MEDICAL PHYSICS',
      'PHARMACO', '3000370', 'PRINC PHARMACO', 'TOFACITINIB',
      'PHARMACOKINETICS', 'PHARMACODYNAMICS'
    ], val: 'Cell Bio & Med Biochem'
  },

  // ── Integ & MS I ──────────────────────────────────────────────────────────
  {
    keys: [
      'MUSCU SYS I', 'MUSCU SYS 1', 'MS I', 'MS 1',
      '3000260', 'ACETABULUM',
      '1-02 INTRODUCTION TO MUSCULO', '1-03 BONE OF UPPER',
      '1-04 SHOULDER', '1-05 AXILLA', '1-06 BRACHIAL',
      '1-07 ARM', '1-08 FOREARM', '1-09 HAND', '1-10 JOINT OF UPPER',
      'UPPER LIMB', 'BRACHIAL PLEXUS',
      'INTEG SYS I', 'INTEGUMENTARY I', '3000373', 'ACNE',
      'B4 SKIN', 'SKIN & RELATED',
      'NLE1 MS', 'NLE MS', 'NLE-MS'
    ], val: 'Integ & MS I'
  },

  // ── NS I (previously MS II) ────────────────────────────────────────────────
  // REQ 3: keys that WERE "MS II" now map to "NS I"
  {
    keys: [
      'MUSCU SYS II', 'MUSCU SYS 2', '3000262',
      'MS SPOT I', 'MS SPOT II', 'ACCUMULATION', 'ACROMION',
      '1-14 GLUTEAL', '1-15 THIGH', '1-16 LEG', '1-17 FOOT',
      '1-18 JOINT OF LOWER', 'LOWER LIMB',
      'DEEP BACK', 'DEEP STRUCTURES OF NECK',
      '2-01 DEEP BACK', '2-02 SPINAL',
      '2-05 SKULL', '2-07 SUPERFICIAL', '2-08 DEEP STRUCTURES OF FACE',
      '2-11 DEEP STRUCTURES OF NECK',
      'INTEG & MS'
    ], val: 'NS I'
  },

  // ── RS I ──────────────────────────────────────────────────────────────────
  {
    keys: [
      'RESP SYS I', 'RESP SYS 1', 'RS 1', 'RS I',
      '3000264', 'ACAPNIA', 'RESPIRATORY SYSTEM I',
      'SPOT RS', 'RS SPOT', 'RS1', 'RS MCQ'
    ], val: 'RS I'
  },

  // ── CVS I ─────────────────────────────────────────────────────────────────
  {
    keys: [
      'CVS SYS I', 'CVS SYS 1', 'CVS 1', 'CVS I', '3000266',
      'ACUTE II 2020', 'CARDIOVASCULAR SYSTEM I', 'CVS SPOT', 'SPOT CVS',
      'HEART AND GREAT VESSELS', '1. HEART', '3. ELECTRICAL',
      '4. CARDIAC CYCLE', '5. BASIC EKG', '6. CIRCULATORY',
      '7. MICROCIRCULATION', '8. CIRCULATORY CONTROL',
      '9. PATHOPHYSIOLOGY OF SHOCK', '10. REGIONAL CIRCULATION',
      '11. BIOCHEMISTRY OF HEART', '12. BIOCHEMISTRY OF BLOOD',
      '14. BLOOD COAGULATION', 'CVS LOVE', 'NEW CVS', 'CVS1 MCQ'
    ], val: 'CVS I'
  },

  // ── Endocrine I ───────────────────────────────────────────────────────────
  {
    keys: [
      'ENDOC SYS I', 'ENDOC SYS 1', 'ENDOCRINE 1', 'ENDO 1', 'ENDOC I',
      '3000273', 'ACROMEGALY', 'ACCLIMATIZED', 'ENDOCRINE SYSTEM I',
      'ENDOCRINE I', 'PITUITARY', 'THYROID', 'INSULIN AND DM',
      'ENDOCRINE BURNFIRE'
    ], val: 'Endocrine I'
  },

  // ── GI I ──────────────────────────────────────────────────────────────────
  {
    keys: [
      'ALIMENTARY SYS I', 'ALIMENTARY 1', 'GI 1', 'GI1', 'GI I',
      '3000268', 'ACHALASIA', 'GI SPOT',
      'GASTROINTESTINAL SYSTEM I', 'ALIMENTARY SYSTEM I'
    ], val: 'GI I'
  },

  // ── Repro I ───────────────────────────────────────────────────────────────
  {
    keys: [
      'REPROD SYS I', 'REPROD SYS 1', 'REPRODUCTIVE 1', 'REPRO 1', 'REPRO I',
      'KUB/REPRO', 'KUB&REPRO', 'REPRO SYS I', '3000271',
      'ACGASM', 'SPOT KUB/REPRO', 'SPOT KUB&REPRO',
      'ACCOUCHEMENT'
    ], val: 'Repro I'
  },

  // ── Uri I ─────────────────────────────────────────────────────────────────
  {
    keys: [
      'URIN SYS I', 'URIN SYS 1', 'KUB 1', 'RENAL 1', 'KUB I',
      '3000269', 'ACUTE RENAL', 'ACETAZOLAMIDE 2020',
      'URINARY SYSTEM I', 'MAGICAL URINE', 'KUB SPOT',
      '06 AC KUB', '07 AC KUB'
    ], val: 'Uri I'
  },

  // ── Year II ───────────────────────────────────────────────────────────────

  // ── Human Life ────────────────────────────────────────────────────────────
  {
    keys: [
      'HUMAN LIFE', '3000281', 'CLIMACTERIUM',
      'MED GEN', 'EMB', '3000283', '3000119',
      'ACHONDROPLASIA', 'GENETICS', 'EMBRYOLOGY',
      'CLINICAL EMBRYOLOGY', 'DEVELOPMENTAL BIO',
      'B1.3 HUMAN DEVELOPMENT', 'B1.3 EMBRYO', 'ACPIWAT',
      'HUMAN LIFE SUMMARY'
    ], val: 'Human Life'
  },

  // ── Epi, Res Meth & Biostal ───────────────────────────────────────────────
  {
    keys: [
      'EPI', 'BIOSTAT', 'EPID', 'BAS EPI', '3000115', '3000362',
      'EPIDEMIOLOGY', 'BIOSTATICS', 'ACCUMULATE',
      'RES METH', 'RESEARCH METHOD'
    ], val: 'Epi, Res Meth & Biostal'
  },

  // ── Hematology ────────────────────────────────────────────────────────────
  {
    keys: [
      'CLIN HEM', 'HEM/SYS', 'HEMATOLOGY', 'HEMA', '3000372',
      'ACANTHOCYTE', 'HEMATO', 'SPOT HEMATO', 'MALARIA', 'THALASSEMIA',
      'B2 HEMATOPOI', 'B2 HEMATO', 'B2 HEMATOPOIETIC',
      '09 HEMATO', '05 HEMATOLOGY', 'WBC PATHOLOGY', 'RBC PATHOLOGY',
      'BASIC HEMATOLOGY', 'CLINICAL HEMATOLOGY'
    ], val: 'Hematology'
  },

  // ── Genetics ──────────────────────────────────────────────────────────────
  {
    keys: [
      'GENETICS', '3000119', 'GENE DEV BIO', 'HUM GENE',
      'ACHONDROPLASIA', 'MENDELIAN'
    ], val: 'Genetics'
  },

  // ── CVS II ────────────────────────────────────────────────────────────────
  {
    keys: [
      'CVS SYS II', 'CVS SYS 2', 'CVS 2', 'CVS II', '3000378',
      'ACE INHIBITOR', 'CARDIOVASCULAR 2', 'CVS PHARM',
      'B7 CARDIOVASCULAR', 'B7 CVS', 'CARDIO MED',
      '01 CARDIOLOGY', '18 CARDIO MED'
    ], val: 'CVS II'
  },

  // ── Uri II ────────────────────────────────────────────────────────────────
  {
    keys: [
      'URIN SYS II', 'URIN SYS 2', 'KUB 2', 'RENAL 2', 'KUB II',
      '3000381', 'ACETAZOLAMIDE', 'ACIDOSIS', 'ACIDEMIA',
      'NEPHRO', 'NEPHROLOGY', 'B9 RENAL', 'B9 KUB', '09 RENAL',
      'HISTO KUB'
    ], val: 'Uri II'
  },

  // ── RS II ─────────────────────────────────────────────────────────────────
  {
    keys: [
      'RESP SYS II', 'RESP SYS 2', 'RS 2', 'RS II',
      '3000376', 'SINOVAC', 'ACINUS', 'CHEST MED', 'CHEST MEDICINE',
      'B6 RESPIRATORY', 'B6 RS', 'RS PHARMACOLOGY',
      'RS PATHOPHYSIOLOGY'
    ], val: 'RS II'
  },

  // ── Princ Microbio Parasite ───────────────────────────────────────────────
  {
    keys: [
      'MICROBIO', 'MICRO/PARASITO', '3000366', 'MICROBIOLOGY',
      'PARASITOLOGY', 'PARASITO', 'PRINC MICRO', 'SPOT MICRO',
      'BACTERIAL INFECTION', 'ANTIMICROBIAL', 'ANTIBIOTIC',
      'INFECTIOUS', 'INFECT DISEASE', 'CIPROFLOXACIN', 'ACTINOMYCETES',
      'B1.9 MICRO', 'B1.9 MICROBIO',
      '06 ID', '08 INFECTIOUS', '02 PRINC MICRO'
    ], val: 'Princ Microbio Parasite'
  },

  // ── Endocrine II ──────────────────────────────────────────────────────────
  {
    keys: [
      'ENDOC SYS II', 'ENDOC SYS 2', 'ENDOCRINE 2', 'ENDO 2', 'ENDOC II',
      '3000385', 'ENDOCRINE II', 'ENDOCRINE SYSTEM II',
      'B11 ENDOCRINE', 'B11 ENDO', 'ENDOCRINE PHARMACOLOGY',
      'ENDOCRINE ESSENTIAL'
    ], val: 'Endocrine II'
  },

  // ── Princ Patho ───────────────────────────────────────────────────────────
  {
    keys: [
      'FUND PATHO', 'FOUND PATHO', '3000369', 'ANTHRACOSIS', 'LIQUEFACTIVE',
      'PATHO MCQ', 'PATHO SPOT', 'GENERAL PATHOLOGY', 'BASIC PATHOLOGY',
      'B1.4 BIOLOGY OF TISSUE', 'B1.4 TISSUE RESPONSE'
    ], val: 'Princ Patho'
  },

  // ── Princ Pharm II ────────────────────────────────────────────────────────
  {
    keys: [
      'PHARMACO', '3000370', 'PRINC PHARMACO', 'TOFACITINIB',
      'PHARMACOLOGY', 'B1.8 PHARMACO', 'B1.8 PHARMACODYN'
    ], val: 'Princ Pharm II'
  },

  // ── Princ Immunology ──────────────────────────────────────────────────────
  {
    keys: [
      'CLIN IMMU', 'IMMUNOCOMP', 'CLIN IMMUNO', 'CIIH',
      'TACROLIMUS', 'PRINC IMMU', '3000364', '3000386',
      'CELLS AC WORK', 'MACROPHAGE', 'MAST CELL',
      'PRINCIPLE OF IMMUNOLOGY',
      'IMMUNO MCQ', 'IMMUNO SPOT',
      'B1.10 IMMUNE', 'B1.10 IMMUN'
    ], val: 'Princ Immunology'
  },

  // ── Year III ──────────────────────────────────────────────────────────────

  // ── NS II (previously NS I) ────────────────────────────────────────────────
  // REQ 3: keys that WERE "NS I" (NEUROSCIENCE 1 / 3000278 / ACETYLCHOLINE) → now "NS II"
  {
    keys: [
      'NEUROSCIENCE 1', 'NEUROSCI 1', '3000278', 'ACETYLCHOLINE',
      'SPOT NEURO', 'NEUROSCI SPOT', 'NEURO ANATOMY', 'NEUROANATOMY',
      'MOTOR SYSTEM', 'SPINAL CORD', 'B3 NS', 'NEUROSCIENCE SPOT',
      'NEUROSCIENCE MCQ'
    ], val: 'NS II'
  },

  // ── NS III (previously NS II) ──────────────────────────────────────────────
  // REQ 3: keys that WERE "NS II" (CLIN NEURO / LEVETIRACETAM) → now "NS III"
  {
    keys: [
      'CLIN NEURO', 'CLIN NEUROSCIENCE', 'LEVETIRACETAM',
      'CLINICAL NEUROSCIENCE', 'NEUROLOG',
      'CLIN NEURO MDCU', 'B3 CENTRAL', 'B3 CNS',
      'NEURO 2', 'NS III', 'NS3', '3000384'
    ], val: 'NS III'
  },

  // ── GI II ─────────────────────────────────────────────────────────────────
  {
    keys: [
      'ALIMENTARY SYS II', 'ALIMENTARY 2', 'GI 2', 'GI2', 'GI II',
      '3000380', 'ACHLORHYDRIA', 'STOMACH', 'ACHALASIA II',
      'HEPATO', 'HEPATOBILIARY', 'HEPATOBIL',
      'B8 GASTROINTESTINAL', 'B8 GI'
    ], val: 'GI II'
  },

  // ── MS II (previously MS III) ─────────────────────────────────────────────
  // REQ 3: keys that WERE "MS III" (MUSCU SYS/CON / 3000375 / FRACTURE) → now "MS II"
  {
    keys: [
      'MUSCU SYS/CON', '3000375',
      'FRACTURE', 'ACHILLES', 'ACHILLES II',
      'B5 MUSCULO', 'B5 MUSKULOSKELETAL', 'MS FOR NLE', 'MS III'
    ], val: 'MS II'
  },

  // ── Integ II ──────────────────────────────────────────────────────────────
  {
    keys: [
      'INTEG SYS II', 'INTEG 2', 'DERMATOLOGY', 'DERMAT',
      'SKIN II', 'INTEG II',
      'ACANTHOLYTIC', 'ACANTHOLY'
    ], val: 'Integ II'
  },

  // ── Cli Immuno & Infect Dis ───────────────────────────────────────────────
  {
    keys: [
      'INFECTION', 'CLI IMMUNO', 'CLI IMMU', 'INFECT DIS'
    ], val: 'Cli Immuno & Infect Dis'
  },

  // ── Repro II ──────────────────────────────────────────────────────────────
  {
    keys: [
      'REPROD SYS II', 'REPROD SYS 2', 'REPRODUCTIVE 2', 'REPRO 2', 'REPRO II',
      'REPRO SYS II', '3000383', 'LACTATION', 'PLACENTA',
      'B10 REPRO', 'B10 REPRODUCTIVE'
    ], val: 'Repro II'
  },

  // ── Psychopatho ───────────────────────────────────────────────────────────
  {
    keys: [
      'PSYCHOPATH', 'PSYCHIATRY', 'PSYCHIATRIC', 'MENTAL HEALTH', 'PSYCHI',
      'PSYCH', '3000388', 'PSYCHOPATHOLOGY', 'SELF-ACTUALIZATION',
      'ANXIETY', 'ACXIETY'
    ], val: 'Psychopatho'
  },

  // ── FCC ───────────────────────────────────────────────────────────────────
  {
    keys: [
      'FCC', 'FOUNDATION OF CLINICAL COMPETENCY', 'FOUNDATION CLINICAL COMPETENCY',
      '3000401', 'PATIENT SAFETY', '3000403', '3000405',
      'DIAGNOSTIC RADIO', 'DIAG RADIO', 'DIAGNO RADIO'
    ], val: 'FCC'
  },

  // ── Radio ─────────────────────────────────────────────────────────────────
  {
    keys: [
      'RADIOLOG', 'RADIOLOGY', 'RADIO', 'NUCLEAR MED', 'NUCLEAR MEDICINE',
      'THERAPEUTIC RADIOLOGY', 'RADIOTHERAPY', 'RT & NM'
    ], val: 'Radio'
  },

  // ── Com Health Pro & Dis Prev ─────────────────────────────────────────────
  {
    keys: [
      'COMMUNITY HEALTH', 'COM HEALTH', 'DIS PREV',
      'HEALTH PRO', 'HEALTH PROMOTION', 'COMMED', 'COM MED',
      'COMMUNITY MED', 'COMMUNITY MEDICINE', '3000406',
      'PREV MED', 'PREVENTIVE', 'HEALTH/ENVI', 'HEALTH ENVI',
      '3000117', 'ACBESTOS', 'HLTH ENVI', '3000396'
    ], val: 'Com Health Pro & Dis Prev'
  },

  // ── Year IV ───────────────────────────────────────────────────────────────
  {
    keys: [
      'MEDICINE I', 'MED I', 'INTERNAL MED 1', 'INTERNAL MEDICINE 1',
      'MED ROTATE', 'MED MCQ', 'MED MEQ', 'MED OSCE', 'AC MED',
      'POMR MED', 'HARRISON', 'GOLDMAN CECIL',
      'SMART PRACTICE', 'COMPREHENSIVE REVIEW IN INTERNAL'
    ], val: 'Medicine I'
  },

  {
    keys: [
      'PEDIATRIC', 'PEDIATRICS', 'PEDI', 'PED OSCE', 'PED MCQ',
      'AC PED', 'PED EXTERN', 'NELSON',
      'NEWBORN', 'NEONATAL'
    ], val: 'Pediatrics I'
  },

  {
    keys: [
      'SURGERY I', 'SURGERY 1', 'GENERAL SX', 'GEN SX',
      'SUBSPE SX', 'SUBSPECIALTY SX', 'SUBSPE SURGERY',
      'SX OSCE', 'SX MCQ', 'SX MEQ', 'AC SX', 'OSCE SX',
      'ANESTHESIOL', 'ANESTHESIA', 'ANES',
      'SABISTON', 'SCHWARTZ'
    ], val: 'Surgery I'
  },

  {
    keys: [
      'ORTHO I', 'ORTHO 1', 'ORTHOPEDIC I', 'ORTHOPEDICS I',
      'ORTHO EXTERN'
    ], val: 'Ortho I'
  },

  {
    keys: [
      'CLI COMP REFRESH', 'CLIN COMP', 'CLINICAL COMPETENCY REFRESH'
    ], val: 'Cli Comp Refresh'
  },

  {
    keys: [
      'OB-GYN', 'OBS-GYN', 'OBSTET', 'GYNECOL', 'OBGYN',
      'OB GYN', 'OB_GYN', 'GYNECOLOGY',
      'B12 OB-GYN', '12 OB-GYN', '12 OBSTET',
      'WILLIAMS OBSTETRICS'
    ], val: 'Obstetrics & Gynecology'
  },

  {
    keys: [
      'PREV MED & HEALTH', 'HEALTH SYS',
      'PREVENTIVE MED', 'PUBLIC HEALTH',
      'REHAB', 'REHABILITATION',
      'EBM', 'EVIDENCE BASED', 'FORENSIC', 'FORENSIC MED',
      'B14 PREVENTIVE', '14 PREVENTIVE'
    ], val: 'Prev Med & Health Sys'
  },

  // ── Year V ────────────────────────────────────────────────────────────────
  { keys: ['MEDICINE II', 'MED II', 'INTERNAL MED 2', 'INTERNAL MEDICINE 2', 'MEDICINE 2'], val: 'Medicine II' },

  { keys: ['FAM MED', 'FAMILY MED', 'FAMILY MEDICINE', 'FAMILY PRACTICE'], val: 'Fam Med' },

  { keys: ['PEDIATRICS II', 'PEDIATRIC II', 'PED II', 'PEDIATRICS 2'], val: 'Pediatrics II' },

  { keys: ['ANES', 'ANESTHESIA', 'ANESTHESIOL', 'CRITICAL CARE', 'ANESTHESIA & CRITICAL'], val: 'Anesthesia & Critical Care' },

  { keys: ['TRAUMA', 'AMBU', 'ER TRAUMA', 'AMBU/ER', 'CHRONIC PALLIATIVE'], val: 'Trauma' },

  {
    keys: [
      'ER I', 'ER 1', 'EMERGENCY 1', 'EMERGENCY I',
      'SHORTCUT ER', 'ER POCKET',
      'EMERGENCY MED', 'EMERGENCY MEDICINE',
      'ACLS', 'TOXICOLOGY', 'ER TOXICOLOGY',
      '18 ER', 'เวชศาสตร์ฉุกเฉิน'
    ], val: 'ER I'
  },

  { keys: ['PSYCHI', 'PSYCHIATRY AND MENTAL', 'MENTAL HEALTH', 'PSYCHIATRIC YEAR 5'], val: 'Psychi' },

  {
    keys: [
      'OPHTHALMO', 'OPHTHALMOLOGY', 'EYE YEAR', 'EYE MDCU',
      'AC EYE', 'EYE MCQ', 'EYE OSCE',
      'B20 EYE', '20 EYE', 'NLE2 EYE', 'NLE EYE',
      'จักษุ', 'OPHTHALMOLOGY MDCU'
    ], val: 'EYE'
  },

  {
    keys: [
      'OTOLARYNGOLOGY', 'OTOLARYNGOL', 'EAR NOSE',
      'ENT YEAR', 'AC ENT', 'ENT MCQ', 'ENT OSCE',
      'B19 ENT', '19 ENT', 'NLE2 ENT', 'NLE ENT',
      'หู คอ จมูก', 'โสต ศอ', 'ENT MDCU'
    ], val: 'ENT'
  },

  { keys: ['REHAB YEAR', 'REHAB MED', 'REHABILITATION MED', 'REHABILITATION MEDICINE'], val: 'Rehab' },

  { keys: ['FORENSIC', 'FORENSIC MED', 'FORENSIC MEDICINE', 'นิติเวช'], val: 'Forensic' },

  // ── Year VI ───────────────────────────────────────────────────────────────
  { keys: ['MEDICINE III', 'MED III', 'INTERNAL MED 3', 'INTERNAL MEDICINE 3', 'MEDICINE 3'], val: 'Medicine III' },
  { keys: ['ER II', 'ER 2', 'EMERGENCY II', 'EMERGENCY 2'], val: 'ER II' },
  { keys: ['SURGERY II', 'SURGERY 2', 'SX II', 'SX 2'], val: 'Surgery II' },
  { keys: ['ORTHO II', 'ORTHO 2', 'ORTHOPEDIC II', 'ORTHOPEDICS II'], val: 'Ortho II' },
  { keys: ['OBGYN II', 'OB GYN II', 'OBSTETRICS GYN II', 'OBGYN 2', 'OB-GYN 2'], val: 'ObGyn II' },
  { keys: ['CLINICAL INTEGRATION', 'CLIN INTEGR'], val: 'Clinical Integration' },
  { keys: ['OSCE PREP', 'OSCE COMPRE', 'OSCE COMPREHENSIVE', 'NL3 OSCE', 'NL OSCE', 'BEAT THE OSCE'], val: 'OSCE Prep' },
  { keys: ['EXIT EXAM', 'EXIT EXAMINATION'], val: 'Exit Examination' },

  // ── Old Block ─────────────────────────────────────────────────────────────
  { keys: ['OLD BLOCK', 'METAB/NUTRI', '3000274'], val: 'Old Block' },
];

// ── Core matching function ────────────────────────────────────────────────────
function matchKeywords(text, entries) {
  const lower = text.toLowerCase();
  for (const entry of entries) {
    for (const key of entry.keys) {
      if (lower.includes(key.toLowerCase())) {
        return entry.val;
      }
    }
  }
  return null;
}

export function detectDocType(fileName) {
  return matchKeywords(fileName, docKeywords) || 'Unknown';
}

export function detectBlock(fileName, path = '') {
  const combined = `${path} ${fileName}`;
  return matchKeywords(combined, blockMap) || 'Unclassified';
}

export function categorizeFile(file) {
  return {
    ...file,
    docType: detectDocType(file.name),
    block: detectBlock(file.name, file.path || ''),
  };
}
