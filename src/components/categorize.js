// ── Doc Type Detection ────────────────────────────────────────────────────────
const docKeywords = [
  { keys: ['tutor', 'ติว', 'tutoring', 'tutorial', 'ติวศรว', 'ติว nl',
           'nle1 tutoring', 'nle tutoring', 'peer support',
           'peer tutoring', 'lecture ติว', 'slide ติว',
           'preparation lecture', 'prep lecture'], val: 'Tutoring' },

  { keys: [
    'nle step 1', 'nle1', 'nle 1', 'nl step 1', 'nl1',
    'national license step 1', 'national licence step 1',
    'ศรว ขั้นที่ 1', 'ศรว.1', 'nle step1',
    'ac nle1', 'nl | step 01', 'nl step 01',
    'nle step 1 20', 'step 1 20'
  ], val: 'NLE 1' },

  { keys: [
    'nle step 2', 'nle2', 'nle 2', 'nl step 2', 'nl2',
    'national license step 2', 'national licence step 2',
    'ศรว ขั้นที่ 2', 'ศรว.2', 'nle step2',
    'ac nle2', 'nl | step 02', 'nl step 02',
    'nle step 2 20', 'step 2 20', 'nl2 tutorial'
  ], val: 'NLE 2' },

  { keys: [
    'comprehensive step 1', 'compre step 1', 'comprehensive step1',
    'compre step1', 'comprehensive review step 1',
    'comprehensive review step1', 'comprehensive & nle',
    'ac compre', 'compre mdcu', 'compre 20', 'compre73', 'compre74',
    'compre75', 'compre76', 'compre77', 'compre78',
    'compre เช้า', 'compre บ่าย',
    'compreswu', 'compresiriraj', 'compretu', 'comprersu', 'comprepsu'
  ], val: 'Comprehensive Review STEP 1' },

  { keys: [
    'comprehensive step 2', 'compre step 2', 'comprehensive step2',
    'compre step2', 'comprehensive review step 2',
    'comprehensive review step2',
    'ac comprehensive step 2', 'compre step 2 mdcu'
  ], val: 'Comprehensive Review STEP 2' },

  { keys: ['summary', 'สรุป', 'sum ', 'sum_', 'survival guide',
           'short note', 'short key', 'shortnote',
           'recall sheet', 'mind map', 'mindmap',
           'โพย', 'keyword', 'synopsis', 'review',
           'sum up', 'compilation', 'integrate',
           'map -', 'map cvs', 'map gi', 'map rs', 'map kub',
           'thoughts cluster', 'recall',
           'cheat sheet', 'first aid',
           'neuro physio', 'neuro anatomy',
           'สรุปรวม', 'สรุปพี่'], val: 'Summary' },

  { keys: ['checklist', 'check list'], val: 'Checklist' },

  { keys: ['precourse', 'pre-course', 'pre course',
           'pre clinic', 'pre-clinic'], val: 'Precourse' },

  { keys: ['guideline', 'cpg', 'criteria',
           'specification', 'protocol'], val: 'Guideline' },

  { keys: ['slide', 'ppt', 'powerpoint', 'lecture note', 'lecture',
           'handout', 'สไลด์', 'slides',
           'b1 general principles', 'b2 hematopoi',
           'b3 central', 'b4 skin', 'b5 muscul',
           'b6 respiratory', 'b7 cardiovascular',
           'b8 gastrointestinal', 'b9 renal',
           'b10 reproductive', 'b11 endocrine',
           'essential content', 'for student',
           'nle skin', 'nle immunology', 'nle ms',
           'nle1 rs', 'nle cvs', 'nle gi',
           'ms for nle', 'ns for nle'], val: 'Lecture Slide' },

  { keys: ['worksheet', 'lab ', 'laboratory', 'spot test',
           'spot ', 'ชิง', 'case study', 'case ',
           'pbl', 'tbl', 'formative',
           'lab cell bio', 'lab-', 'lab_',
           'spot tissue', 'spot micro', 'spot hemato',
           'spot kub', 'spot rs', 'spot cvs',
           'spot ms', 'spot neuro', 'spot gi',
           'spot repro', 'histo ',
           'images', 'image',
           'anatomy of', 'gross anatomy',
           'histology of'], val: 'Lab & Spottest' },

  { keys: ['others', 'other', 'อื่น', 'อื่นๆ',
           'dump', 'misc', 'etc'], val: 'Other' },

  { keys: [
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
  ], val: 'AC' },
];

// ── Block Map ─────────────────────────────────────────────────────────────────
export const blockMap = [
  { keys: ['DR/SOC','3000106','DOCTOR AND SOCIETY','DOCTOR & SOCIETY','MPD','INTRO MED','INTRODUCTION TO MEDICINE','DOCTOR SOC','DOCSOC'], val: 'MPD' },
  { keys: ['FUND CELL MOL BIO','CELL BIO','CELL BIOLOGY','3000109','FCMB','BIOCHEM','BIOCHEMISTRY','MED BIOCHEM','3000113','ACETOACETATE','METAB','METABOLISM','BIOCHEM/NUTRI','ACTIN','CELL AND MOLECULAR','B1.1 BIOCHEM','B1.1 BIOCHEMISTRY','INTEGRATION OF METABOLISM','CARBOHYDRATE METABOLISM','LIPID METABOLISM','AMINO ACID','NUCLEOTIDE METAB','ENERGY METABOLISM','G6PD','INBORN ERROR','NUTRITION','TISS BIO','TISSUE BIO','3000111','3000259','ACHROMAT','MED CHEM','3000103','MEDICAL CHEMISTRY','MED PHYS','3000105','MEDICAL PHYSICS','PHARMACO','3000370','PRINC PHARMACO','TOFACITINIB','PHARMACOKINETICS','PHARMACODYNAMICS'], val: 'Cell Bio & Med Biochem' },
  { keys: ['MUSCU SYS I','MUSCU SYS 1','MS I','MS 1','3000260','ACETABULUM','1-02 INTRODUCTION TO MUSCULO','1-03 BONE OF UPPER','1-04 SHOULDER','1-05 AXILLA','1-06 BRACHIAL','1-07 ARM','1-08 FOREARM','1-09 HAND','1-10 JOINT OF UPPER','UPPER LIMB','BRACHIAL PLEXUS','INTEG SYS I','INTEGUMENTARY I','3000373','ACNE','B4 SKIN','SKIN & RELATED','NLE1 MS','NLE MS','NLE-MS'], val: 'Integ & MS I' },
  { keys: ['MUSCU SYS II','MUSCU SYS 2','3000262','MS SPOT I','MS SPOT II','ACCUMULATION','ACROMION','1-14 GLUTEAL','1-15 THIGH','1-16 LEG','1-17 FOOT','1-18 JOINT OF LOWER','LOWER LIMB','DEEP BACK','DEEP STRUCTURES OF NECK','2-01 DEEP BACK','2-02 SPINAL','2-05 SKULL','2-07 SUPERFICIAL','2-08 DEEP STRUCTURES OF FACE','2-11 DEEP STRUCTURES OF NECK','INTEG & MS'], val: 'NS I' },
  { keys: ['RESP SYS I','RESP SYS 1','RS 1','RS I','3000264','ACAPNIA','RESPIRATORY SYSTEM I','SPOT RS','RS SPOT','RS1','RS MCQ'], val: 'RS I' },
  { keys: ['CVS SYS I','CVS SYS 1','CVS 1','CVS I','3000266','ACUTE II 2020','CARDIOVASCULAR SYSTEM I','CVS SPOT','SPOT CVS','HEART AND GREAT VESSELS','1. HEART','3. ELECTRICAL','4. CARDIAC CYCLE','5. BASIC EKG','6. CIRCULATORY','7. MICROCIRCULATION','8. CIRCULATORY CONTROL','9. PATHOPHYSIOLOGY OF SHOCK','10. REGIONAL CIRCULATION','11. BIOCHEMISTRY OF HEART','12. BIOCHEMISTRY OF BLOOD','14. BLOOD COAGULATION','CVS LOVE','NEW CVS','CVS1 MCQ'], val: 'CVS I' },
  { keys: ['ENDOC SYS I','ENDOC SYS 1','ENDOCRINE 1','ENDO 1','ENDOC I','3000273','ACROMEGALY','ACCLIMATIZED','ENDOCRINE SYSTEM I','ENDOCRINE I','PITUITARY','THYROID','INSULIN AND DM','ENDOCRINE BURNFIRE'], val: 'Endocrine I' },
  { keys: ['ALIMENTARY SYS I','ALIMENTARY 1','GI 1','GI1','GI I','3000268','ACHALASIA','GI SPOT','GASTROINTESTINAL SYSTEM I','ALIMENTARY SYSTEM I'], val: 'GI I' },
  { keys: ['REPROD SYS I','REPROD SYS 1','REPRODUCTIVE 1','REPRO 1','REPRO I','KUB/REPRO','KUB&REPRO','REPRO SYS I','3000271','ACGASM','SPOT KUB/REPRO','SPOT KUB&REPRO','ACCOUCHEMENT'], val: 'Repro I' },
  { keys: ['URIN SYS I','URIN SYS 1','KUB 1','RENAL 1','KUB I','3000269','ACUTE RENAL','ACETAZOLAMIDE 2020','URINARY SYSTEM I','MAGICAL URINE','KUB SPOT','06 AC KUB','07 AC KUB'], val: 'Uri I' },
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
