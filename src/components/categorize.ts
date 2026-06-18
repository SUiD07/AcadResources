// ── Types ─────────────────────────────────────────────────────────────────────
import { KeywordConfig } from '../lib/types';

interface KeywordEntry {
  keys: string[];
  val: string;
}

// ── Internal State ────────────────────────────────────────────────────────────
let docKeywords: KeywordEntry[] = [
  { keys: ['tutor', 'ติว', 'tutoring', 'tutorial', 'ติวศรว', 'ติว nl', 'nle1 tutoring', 'nle tutoring', 'peer support', 'peer tutoring', 'lecture ติว', 'slide ติว', 'preparation lecture', 'prep lecture'], val: 'Tutoring' },
  { keys: ['nle step 1', 'nle1', 'nle 1', 'nl step 1', 'nl1', 'national license step 1', 'national licence step 1', 'ศรว ขั้นที่ 1', 'ศรว.1', 'nle step1', 'ac nle1', 'nl | step 01', 'nl step 01', 'nle step 1 20', 'step 1 20'], val: 'NLE 1' },
  { keys: ['nle step 2', 'nle2', 'nle 2', 'nl step 2', 'nl2', 'national license step 2', 'national licence step 2', 'ศรว ขั้นที่ 2', 'ศรว.2', 'nle step2', 'ac nle2', 'nl | step 02', 'nl step 02', 'nle step 2 20', 'step 2 20', 'nl2 tutorial'], val: 'NLE 2' },
  { keys: ['comprehensive step 1', 'compre step 1', 'comprehensive step1', 'compre step1', 'comprehensive review step 1', 'comprehensive review step1', 'comprehensive & nle', 'ac compre', 'compre mdcu', 'compre 20', 'compre73', 'compre74', 'compre75', 'compre76', 'compre77', 'compre78', 'compre เช้า', 'compre บ่าย', 'compreSWU', 'compreSiriraj', 'compreTU', 'compreRSU', 'comprePSU'], val: 'Comprehensive Review STEP 1' },
  { keys: ['comprehensive step 2', 'compre step 2', 'comprehensive step2', 'compre step2', 'comprehensive review step 2', 'comprehensive review step1', 'ac comprehensive step 2', 'compre step 2 mdcu'], val: 'Comprehensive Review STEP 2' },
  { keys: ['summary', 'สรุป', 'sum ', 'sum_', 'survival guide', 'short note', 'short key', 'shortnote', 'recall sheet', 'mind map', 'mindmap', 'โพย', 'keyword', 'synopsis', 'review', 'sum up', 'compilation', 'integrate', 'map -', 'map cvs', 'map gi', 'map rs', 'map kub', 'thoughts cluster', 'recall', 'cheat sheet', 'first aid', 'neuro physio', 'neuro anatomy', 'สรุปรวม', 'สรุปพี่'], val: 'Summary' },
  { keys: ['checklist', 'check list'], val: 'Checklist' },
  { keys: ['precourse', 'pre-course', 'pre course', 'pre clinic', 'pre-clinic'], val: 'Precourse' },
  { keys: ['guideline', 'cpg', 'criteria', 'specification', 'protocol'], val: 'Guideline' },
  { keys: ['slide', 'ppt', 'powerpoint', 'lecture note', 'lecture', 'handout', 'สไลด์', 'slides', 'b1 general principles', 'b2 hematopoi', 'b3 central', 'b4 skin', 'b5 muscul', 'b6 respiratory', 'b7 cardiovascular', 'b8 gastrointestinal', 'b9 renal', 'b10 reproductive', 'b11 endocrine', 'essential content', 'for student', 'nle skin', 'nle immunology', 'nle ms', 'nle1 rs', 'nle cvs', 'nle gi', 'ms for nle', 'ns for nle'], val: 'Lecture Slide' },
  { keys: ['worksheet', 'lab ', 'laboratory', 'spot test', 'spot ', 'ชิง', 'case study', 'case ', 'pbl', 'tbl', 'formative', 'lab cell bio', 'lab-', 'lab_', 'spot tissue', 'spot micro', 'spot hemato', 'spot kub', 'spot rs', 'spot cvs', 'spot ms', 'spot neuro', 'spot gi', 'spot repro', 'histo ', 'images', 'image', 'anatomy of', 'gross anatomy', 'histology of'], val: 'Lab & Spottest' },
  { keys: ['others', 'other', 'อื่น', 'อื่นๆ', 'dump', 'misc', 'etc'], val: 'Other' },
  { keys: ['accebs', 'ac cebs', 'mcq', 'meq', 'osce', 'ข้อสอบ', 'ac nle', 'แอค', 'question', 'key ', ' key', 'โจทย์', 'เฉลย', 'solution', 'answer', 'ans ', 'ans_', 'ac ', 'ac_', 'peer solution', 'peer ac', 'mock', 'exercise', 'excercise', 'practice', 'smst', 'nctms', 'kku', 'compre step', 'rotate', 'rotation', 'midterm', 'final', 'ปลาย', 'กลาง'], val: 'AC' },
  { keys: ['first aid', 'kaplan', 'netter', 'guyton', 'pathoma', 'robbins', 'usmle', 'histology', 'anatomy atlas', 'campbell biology', 'rubin', 'junqueira', 'wheater', 'bates', 'goldman-cecil', 'harrison', "grant's atlas", 'moore', 'sabiston', 'schwartz', 'surgical recall', 'case files', 'step up to usmle', 'deja review', 'pocket book', 'manual of medical'], val: 'Textbook' }
];

export let blockMap: KeywordEntry[] = [
  { keys: ['DR/SOC', '3000106', 'DOCTOR AND SOCIETY', 'DOCTOR & SOCIETY', 'MPD', 'INTRO MED', 'INTRODUCTION TO MEDICINE', 'DOCTOR SOC', 'DOCSOC'], val: 'MPD' },
  { keys: ['FUND CELL MOL BIO', 'CELL BIO', 'CELL BIOLOGY', '3000109', 'FCMB', 'BIOCHEM', 'BIOCHEMISTRY', 'MED BIOCHEM', '3000113', 'ACETOACETATE', 'METAB', 'METABOLISM', 'BIOCHEM/NUTRI', 'ACTIN', 'CELL AND MOLECULAR', 'B1.1 BIOCHEM', 'B1.1 BIOCHEMISTRY', 'INTEGRATION OF METABOLISM', 'CARBOHYDRATE METABOLISM', 'LIPID METABOLISM', 'AMINO ACID', 'NUCLEOTIDE METAB', 'ENERGY METABOLISM', 'G6PD', 'INBORN ERROR', 'NUTRITION', 'TISS BIO', 'TISSUE BIO', '3000111', '3000259', 'ACHROMAT', 'MED CHEM', '3000103', 'MEDICAL CHEMISTRY', 'MED PHYS', '3000105', 'MEDICAL PHYSICS', 'PHARMACO', '3000370', 'PRINC PHARMACO', 'TOFACITINIB', 'PHARMACOKINETICS', 'PHARMACODYNAMICS'], val: 'Cell Bio & Med Biochem' },
  { keys: ['MUSCU SYS I', 'MUSCU SYS 1', 'MS I', 'MS 1', '3000260', 'ACETABULUM', '1-02 INTRODUCTION TO MUSCULO', '1-03 BONE OF UPPER', '1-04 SHOULDER', '1-05 AXILLA', '1-06 BRACHIAL', '1-07 ARM', '1-08 FOREARM', '1-09 HAND', '1-10 JOINT OF UPPER', 'UPPER LIMB', 'BRACHIAL PLEXUS', 'INTEG SYS I', 'INTEGUMENTARY I', '3000373', 'ACNE', 'B4 SKIN', 'SKIN & RELATED', 'NLE1 MS', 'NLE MS', 'NLE-MS'], val: 'Integ & MS I' },
  { keys: ['MUSCU SYS II', 'MUSCU SYS 2', '3000262', 'MS SPOT I', 'MS SPOT II', 'ACCUMULATION', 'ACROMION', '1-14 GLUTEAL', '1-15 THIGH', '1-16 LEG', '1-17 FOOT', '1-18 JOINT OF LOWER', 'LOWER LIMB', 'DEEP BACK', 'DEEP STRUCTURES OF NECK', '2-01 DEEP BACK', '2-02 SPINAL', '2-05 SKULL', '2-07 SUPERFICIAL', '2-08 DEEP STRUCTURES OF FACE', '2-11 DEEP STRUCTURES OF NECK', 'INTEG & MS'], val: 'NS I' },
  { keys: ['RESP SYS I', 'RESP SYS 1', 'RS 1', 'RS I', '3000264', 'ACAPNIA', 'RESPIRATORY SYSTEM I', 'SPOT RS', 'RS SPOT', 'RS1', 'RS MCQ'], val: 'RS I' },
  { keys: ['CVS SYS I', 'CVS SYS 1', 'CVS 1', 'CVS I', '3000266', 'ACUTE II 2020', 'CARDIOVASCULAR SYSTEM I', 'CVS SPOT', 'SPOT CVS', 'HEART AND GREAT VESSELS', '1. HEART', '3. ELECTRICAL', '4. CARDIAC CYCLE', '5. BASIC EKG', '6. CIRCULATORY', '7. MICROCIRCULATION', '8. CIRCULATORY CONTROL', '9. PATHOPHYSIOLOGY OF SHOCK', '10. REGIONAL CIRCULATION', '11. BIOCHEMISTRY OF HEART', '12. BIOCHEMISTRY OF BLOOD', '14. BLOOD COAGULATION', 'CVS LOVE', 'NEW CVS', 'CVS1 MCQ'], val: 'CVS I' },
  { keys: ['ENDOC SYS I', 'ENDOC SYS 1', 'ENDOCRINE 1', 'ENDO 1', 'ENDOC I', '3000273', 'ACROMEGALY', 'ACCLIMATIZED', 'ENDOCRINE SYSTEM I', 'ENDOCRINE I', 'PITUITARY', 'THYROID', 'INSULIN AND DM', 'ENDOCRINE BURNFIRE'], val: 'Endocrine I' },
  { keys: ['ALIMENTARY SYS I', 'ALIMENTARY 1', 'GI 1', 'GI1', 'GI I', '3000268', 'ACHALASIA', 'GI SPOT', 'GASTROINTESTINAL SYSTEM I', 'ALIMENTARY SYSTEM I', 'NLE2_MED_GI', 'NLE2_PED_GI_NUTRI', 'GI MED', '16 NLE 2 - GI MED'], val: 'GI I' },
  { keys: ['REPROD SYS I', 'REPROD SYS 1', 'REPRODUCTIVE 1', 'REPRO 1', 'REPRO I', 'KUB/REPRO', 'KUB&REPRO', 'REPRO SYS I', '3000271', 'ACGASM', 'SPOT KUB/REPRO', 'SPOT KUB&REPRO', 'ACCOUCHEMENT'], val: 'Repro I' },
  { keys: ['URIN SYS I', 'URIN SYS 1', 'KUB 1', 'RENAL 1', 'KUB I', '3000269', 'ACUTE RENAL', 'ACETAZOLAMIDE 2020', 'URINARY SYSTEM I', 'MAGICAL URINE', 'KUB SPOT', '06 AC KUB', '07 AC KUB'], val: 'Uri I' },
  { keys: ['HUMAN LIFE', '3000281', 'CLIMACTERIUM', 'MED GEN', 'EMB', '3000283', '3000119', 'ACHONDROPLASIA', 'GENETICS', 'EMBRYOLOGY', 'CLINICAL EMBRYOLOGY', 'DEVELOPMENTAL BIO', 'B1.3 HUMAN DEVELOPMENT', 'B1.3 EMBRYO', 'ACPIWAT', 'HUMAN LIFE SUMMARY'], val: 'Human Life' },
  { keys: ['EPI', 'BIOSTAT', 'EPID', 'BAS EPI', '3000115', '3000362', 'EPIDEMIOLOGY', 'BIOSTATICS', 'ACCUMULATE', 'RES METH', 'RESEARCH METHOD'], val: 'Epi, Res Meth & Biostal' },
  { keys: ['CLIN HEM', 'HEM/SYS', 'HEMATOLOGY', 'HEMA', '3000372', 'ACANTHOCYTE', 'HEMATO', 'SPOT HEMATO', 'MALARIA', 'THALASSEMIA', 'B2 HEMATOPOI', 'B2 HEMATO', 'B2 HEMATOPOIETIC', '09 HEMATO', '05 HEMATOLOGY', 'WBC PATHOLOGY', 'RBC PATHOLOGY', 'BASIC HEMATOLOGY', 'CLINICAL HEMATOLOGY'], val: 'Hematology' },
  { keys: ['GENETICS', '3000119', 'GENE DEV BIO', 'HUM GENE', 'ACHONDROPLASIA', 'MENDELIAN'], val: 'Genetics' },
  { keys: ['CVS SYS II', 'CVS SYS 2', 'CVS 2', 'CVS II', '3000378', 'ACE INHIBITOR', 'CARDIOVASCULAR 2', 'CVS PHARM', 'B7 CARDIOVASCULAR', 'B7 CVS', 'CARDIO MED', '01 CARDIOLOGY', '18 CARDIO MED', 'NLE2_MED_CARDIO', 'NLE2_PED_RS_CVS', '10-1 NLE 2 - PED CARDIOLOGY'], val: 'CVS II' },
  { keys: ['URIN SYS II', 'URIN SYS 2', 'KUB 2', 'RENAL 2', 'KUB II', '3000381', 'ACETAZOLAMIDE', 'ACIDOSIS', 'ACIDEMIA', 'NEPHRO', 'NEPHROLOGY', 'B9 RENAL', 'B9 KUB', '09 RENAL', 'HISTO KUB'], val: 'Uri II' },
  { keys: ['RESP SYS II', 'RESP SYS 2', 'RS 2', 'RS II', '3000376', 'SINOVAC', 'ACINUS', 'CHEST MED', 'CHEST MEDICINE', 'B6 RESPIRATORY', 'B6 RS', 'RS PHARMACOLOGY', 'RS PATHOPHYSIOLOGY', 'NLE2_MED_RS', 'NLE2_PED_RS', '5 NLE 2 - LUNG', 'GI MED LUNG'], val: 'RS II' },
  { keys: ['MICROBIO', 'MICRO/PARASITO', '3000366', 'MICROBIOLOGY', 'PARASITOLOGY', 'PARASITO', 'PRINC MICRO', 'SPOT MICRO', 'BACTERIAL INFECTION', 'ANTIMICROBIAL', 'ANTIBIOTIC', 'INFECTIOUS', 'INFECT DISEASE', 'CIPROFLOXACIN', 'ACTINOMYCETES', 'B1.9 MICRO', 'B1.9 MICROBIO', '06 ID', '08 INFECTIOUS', '02 PRINC MICRO'], val: 'Princ Microbio Parasite' },
  { keys: ['ENDOC SYS II', 'ENDOC SYS 2', 'ENDOCRINE 2', 'ENDO 2', 'ENDOC II', '3000385', 'ENDOCRINE II', 'ENDOCRINE SYSTEM II', 'B11 ENDOCRINE', 'B11 ENDO', 'ENDOCRINE PHARMACOLOGY', 'ENDOCRINE ESSENTIAL', '9 NLE 2 - ENDOCRINE'], val: 'Endocrine II' },
  { keys: ['FUND PATHO', 'FOUND PATHO', '3000369', 'ANTHRACOSIS', 'LIQUEFACTIVE', 'PATHO MCQ', 'PATHO SPOT', 'GENERAL PATHOLOGY', 'BASIC PATHOLOGY', 'B1.4 BIOLOGY OF TISSUE', 'B1.4 TISSUE RESPONSE'], val: 'Princ Patho' },
  { keys: ['PHARMACO', '3000370', 'PRINC PHARMACO', 'TOFACITINIB', 'PHARMACOLOGY', 'B1.8 PHARMACO', 'B1.8 PHARMACODYN'], val: 'Princ Pharm II' },
  { keys: ['CLIN IMMU', 'IMMUNOCOMP', 'CLIN IMMUNO', 'CIIH', 'TACROLIMUS', 'PRINC IMMU', '3000364', '3000386', 'CELLS AC WORK', 'MACROPHAGE', 'MAST CELL', 'PRINCIPLE OF IMMUNOLOGY', 'IMMUNO MCQ', 'IMMUNO SPOT', 'B1.10 IMMUNE', 'B1.10 IMMUN'], val: 'Princ Immunology' },
  { keys: ['NEUROSCIENCE 1', 'NEUROSCI 1', '3000278', 'ACETYLCHOLINE', 'SPOT NEURO', 'NEUROSCI SPOT', 'NEURO ANATOMY', 'NEUROANATOMY', 'MOTOR SYSTEM', 'SPINAL CORD', 'B3 NS', 'NEUROSCIENCE SPOT', 'NEUROSCIENCE MCQ'], val: 'NS II' },
  { keys: ['CLIN NEURO', 'CLIN NEUROSCIENCE', 'LEVETIRACETAM', 'CLINICAL NEUROSCIENCE', 'NEUROLOG', 'CLIN NEURO MDCU', 'B3 CENTRAL', 'B3 CNS', 'NEURO 2', 'NS III', 'NS3', '3000384'], val: 'NS III' },
  { keys: ['ALIMENTARY SYS II', 'ALIMENTARY 2', 'GI 2', 'GI2', 'GI II', '3000380', 'ACHLORHYDRIA', 'STOMACH', 'ACHALASIA II', 'HEPATO', 'HEPATOBILIARY', 'HEPATOBIL', 'B8 GASTROINTESTINAL', 'B8 GI'], val: 'GI II' },
  { keys: ['MUSCU SYS/CON', '3000375', 'FRACTURE', 'ACHILLES', 'ACHILLES II', 'B5 MUSCULO', 'B5 MUSKULOSKELETAL', 'MS FOR NLE', 'MS III'], val: 'MS II' },
  { keys: ['INTEG SYS II', 'INTEG 2', 'DERMATOLOGY', 'DERMAT', 'SKIN II', 'INTEG II', 'ACANTHOLYTIC', 'ACANTHOLY'], val: 'Integ II' },
  { keys: ['INFECTION', 'CLI IMMUNO', 'CLI IMMU', 'INFECT DIS', 'NLE2_PED_ID', 'NLE2_PED_ALLEGY_IMMUNOLOGY', 'PED ALLEGY'], val: 'Cli Immuno & Infect Dis' },
  { keys: ['REPROD SYS II', 'REPROD SYS 2', 'REPRODUCTIVE 2', 'REPRO 2', 'REPRO II', 'REPRO SYS II', '3000383', 'LACTATION', 'PLACENTA', 'B10 REPRO', 'B10 REPRODUCTIVE'], val: 'Repro II' },
  { keys: ['PSYCHOPATH', 'PSYCHIATRY', 'PSYCHIATRIC', 'MENTAL HEALTH', 'PSYCHI', 'PSYCH', '3000388', 'PSYCHOPATHOLOGY', 'SELF-ACTUALIZATION', 'ANXIETY', 'ACXIETY'], val: 'Psychopatho' },
  { keys: ['FCC', 'FOUNDATION OF CLINICAL COMPETENCY', 'FOUNDATION CLINICAL COMPETENCY', '3000401', 'PATIENT SAFETY', '3000403', '3000405', 'DIAGNOSTIC RADIO', 'DIAG RADIO', 'DIAGNO RADIO'], val: 'FCC' },
  { keys: ['RADIOLOG', 'RADIOLOGY', 'RADIO', 'NUCLEAR MED', 'NUCLEAR MEDICINE', 'THERAPEUTIC RADIOLOGY', 'RADIOTHERAPY', 'RT & NM'], val: 'Radio' },
  { keys: ['COMMUNITY HEALTH', 'COM HEALTH', 'DIS PREV', 'HEALTH PRO', 'HEALTH PROMOTION', 'COMMED', 'COM MED', 'COMMUNITY MED', 'COMMUNITY MEDICINE', '3000406', 'PREV MED', 'PREVENTIVE', 'HEALTH/ENVI', 'HEALTH ENVI', '3000117', 'ACBESTOS', 'HLTH ENVI', '3000396'], val: 'Com Health Pro & Dis Prev' },
  { keys: ['MEDICINE I', 'MED I', 'INTERNAL MED 1', 'INTERNAL MEDICINE 1', 'MED ROTATE', 'MED MCQ', 'MED MEQ', 'MED OSCE', 'AC MED', 'POMR MED', 'HARRISON', 'GOLDMAN CECIL', 'SMART PRACTICE', 'COMPREHENSIVE REVIEW IN INTERNAL'], val: 'Medicine I' },
  { keys: ['PEDIATRIC', 'PEDIATRICS', 'PEDI', 'PED OSCE', 'PED MCQ', 'AC PED', 'PED EXTERN', 'NELSON', 'NEWBORN', 'NEONATAL', 'NLE2_PED', '11 NLE 2 - PED', 'PED NATIONAL LICENSE EXAM', 'OSCE PED', 'MCQ PED', 'AC MCQ PED'], val: 'Pediatrics I' },
  { keys: ['SURGERY I', 'SURGERY 1', 'GENERAL SX', 'GEN SX', 'SUBSPE SX', 'SUBSPECIALTY SX', 'SUBSPE SURGERY', 'SX OSCE', 'SX MCQ', 'SX MEQ', 'AC SX', 'OSCE SX', 'ANESTHESIOL', 'ANESTHESIA', 'ANES', 'SABISTON', 'SCHWARTZ', '171114 GENERAL SURGERY', '180223 GENERAL SURGERY', '4 NLE 2 - GENERAL SURGERY'], val: 'Surgery I' },
  { keys: ['ORTHO I', 'ORTHO 1', 'ORTHOPEDIC I', 'ORTHOPEDICS I', 'ORTHO EXTERN', 'ORTHOPAEDIC', 'ORTHO', '171128 ORTHOPAEDICS', '6 NLE 2 - ORTHOPAEDIC'], val: 'Ortho I' },
  { keys: ['CLI COMP REFRESH', 'CLIN COMP', 'CLINICAL COMPETENCY REFRESH'], val: 'Cli Comp Refresh' },
  { keys: ['OB-GYN', 'OBS-GYN', 'OBSTET', 'GYNECOL', 'OBGYN', 'OB GYN', 'OB_GYN', 'GYNECOLOGY', 'B12 OB-GYN', '12 OB-GYN', '12 OBSTET', 'WILLIAMS OBSTETRICS', 'GYN', '7 NLE 2 - GYN', 'NL2 TUTORIAL IN OB', 'OSCE OB/GYN', 'OB/GYN'], val: 'Obstetrics & Gynecology' },
  { keys: ['PREV MED & HEALTH', 'HEALTH SYS', 'PREVENTIVE MED', 'PUBLIC HEALTH', 'EBM', 'EVIDENCE BASED', 'B14 PREVENTIVE', '14 PREVENTIVE'], val: 'Prev Med & Health Sys' },
  { keys: ['MEDICINE II', 'MED II', 'INTERNAL MED 2', 'INTERNAL MEDICINE 2', 'MEDICINE 2'], val: 'Medicine II' },
  { keys: ['FAM MED', 'FAMILY MED', 'FAMILY MEDICINE', 'FAMILY PRACTICE'], val: 'Fam Med' },
  { keys: ['PEDIATRICS II', 'PEDIATRIC II', 'PED II', 'PEDIATRICS 2'], val: 'Pediatrics II' },
  { keys: ['ANES', 'ANESTHESIA', 'ANESTHESIOL', 'CRITICAL CARE', 'ANESTHESIA & CRITICAL'], val: 'Anesthesia & Critical Care' },
  { keys: ['TRAUMA', 'AMBU', 'ER TRAUMA', 'AMBU/ER', 'CHRONIC PALLIATIVE'], val: 'Trauma' },
  { keys: ['ER I', 'ER 1', 'EMERGENCY 1', 'EMERGENCY I', 'SHORTCUT ER', 'ER POCKET', 'EMERGENCY MED', 'EMERGENCY MEDICINE', 'ACLS', 'TOXICOLOGY', 'ER TOXICOLOGY', '18 ER', 'เวชศาสตร์ฉุกเฉิน'], val: 'ER I' },
  { keys: ['PSYCHI', 'PSYCHIATRY AND MENTAL', 'MENTAL HEALTH', 'PSYCHIATRIC YEAR 5'], val: 'Psychi' },
  { keys: ['OPHTHALMO', 'OPHTHALMOLOGY', 'EYE YEAR', 'EYE MDCU', 'AC EYE', 'EYE MCQ', 'EYE OSCE', 'B20 EYE', '20 EYE', 'NLE2 EYE', 'NLE EYE', 'จักษุ', 'OPHTHALMOLOGY MDCU'], val: 'EYE' },
  { keys: ['OTOLARYNGOLOGY', 'OTOLARYNGOL', 'EAR NOSE', 'ENT YEAR', 'AC ENT', 'ENT MCQ', 'ENT OSCE', 'B19 ENT', '19 ENT', 'NLE2 ENT', 'NLE ENT', 'หู คอ จมูก', 'โสต ศอ', 'ENT MDCU', 'ENT'], val: 'ENT' },
  { keys: ['REHAB YEAR', 'REHAB MED', 'REHABILITATION MED', 'REHABILITATION MEDICINE'], val: 'Rehab' },
  { keys: ['FORENSIC', 'FORENSIC MED', 'FORENSIC MEDICINE', 'นิติเวช'], val: 'Forensic' },
  { keys: ['MEDICINE III', 'MED III', 'INTERNAL MED 3', 'INTERNAL MEDICINE 3', 'MEDICINE 3'], val: 'Medicine III' },
  { keys: ['ER II', 'ER 2', 'EMERGENCY II', 'EMERGENCY 2'], val: 'ER II' },
  { keys: ['SURGERY II', 'SURGERY 2', 'SX II', 'SX 2', '15 NLE 2 - SURGERY', 'NLE2_SURGERY'], val: 'Surgery II' },
  { keys: ['ORTHO II', 'ORTHO 2', 'ORTHOPEDIC II', 'ORTHOPEDICS II'], val: 'Ortho II' },
  { keys: ['OBGYN II', 'OB GYN II', 'OBSTETRICS GYN II', 'OBGYN 2', 'OB-GYN 2'], val: 'ObGyn II' },
  { keys: ['CLINICAL INTEGRATION', 'CLIN INTEGR'], val: 'Clinical Integration' },
  { keys: ['OSCE PREP', 'OSCE COMPRE', 'OSCE COMPREHENSIVE', 'NL3 OSCE', 'NL OSCE', 'BEAT THE OSCE'], val: 'OSCE Prep' },
  { keys: ['EXIT EXAM', 'EXIT EXAMINATION'], val: 'Exit Examination' },
  { keys: ['OLD BLOCK', 'METAB/NUTRI', '3000274'], val: 'Old Block' }
];

// ── Year Mapping ─────────────────────────────────────────────────────────────
export let SUBJECT_YEAR_MAP: Record<string, number | 'other'> = {
  'Cell Bio & Med Biochem': 1, 'Integ & MS I': 1, 'NS I': 1, 'RS I': 1, 'CVS I': 1, 'Endocrine I': 1, 'GI I': 1, 'Repro I': 1, 'Uri I': 1,
  'Human Life': 2, 'Epi, Res Meth & Biostal': 2, 'Hematology': 2, 'Genetics': 2, 'CVS II': 2, 'Uri II': 2, 'RS II': 2, 'Princ Microbio Parasite': 2, 'Endocrine II': 2, 'Princ Patho': 2, 'Princ Pharm II': 2, 'Princ Immunology': 2,
  'NS II': 3, 'NS III': 3, 'GI II': 3, 'MS II': 3, 'Integ II': 3, 'Cli Immuno & Infect Dis': 3, 'Repro II': 3, 'Psychopatho': 3, 'FCC': 3, 'Radio': 3, 'Com Health Pro & Dis Prev': 3,
  'Medicine I': 4, 'Pediatrics I': 4, 'Surgery I': 4, 'Ortho I': 4, 'Cli Comp Refresh': 4, 'Obstetrics & Gynecology': 4, 'Prev Med & Health Sys': 4,
  'Medicine II': 5, 'Fam Med': 5, 'Pediatrics II': 5, 'Anesthesia & Critical Care': 5, 'Trauma': 5, 'ER I': 5, 'Psychi': 5, 'EYE': 5, 'ENT': 5, 'Rehab': 5, 'Forensic': 5,
  'Medicine III': 6, 'ER II': 6, 'Surgery II': 6, 'Ortho II': 6, 'ObGyn II': 6, 'Clinical Integration': 6, 'OSCE Prep': 6, 'Exit Examination': 6,
  'MPD': "other", 'Old Block': 'other', 'Unclassified': 'other'
};

// ── Initialization ───────────────────────────────────────────────────────────
export function initializeCategorizer(configs: KeywordConfig[]) {
  const newDocKeywords: KeywordEntry[] = [];
  const newBlockMap: KeywordEntry[] = [];
  const newYearMap: Record<string, number | 'other'> = {};

  configs.forEach(config => {
    const entry = { keys: config.keys, val: config.label };
    if (config.config_type === 'doc_type') {
      newDocKeywords.push(entry);
    } else if (config.config_type === 'block_mapping') {
      newBlockMap.push(entry);
      if (config.year) {
        newYearMap[config.label] = config.year === 'other' ? 'other' : parseInt(config.year, 10);
      }
    }
  });

  if (newDocKeywords.length > 0) docKeywords = newDocKeywords;
  if (newBlockMap.length > 0) blockMap = newBlockMap;
  Object.assign(SUBJECT_YEAR_MAP, newYearMap);
}

// ── Core matching function ────────────────────────────────────────────────────
function matchKeywords(text: string, entries: KeywordEntry[]): string | null {
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

export function detectDocType(fileName: string, path = ''): string {
  const combined = `${fileName} ${path}`;
  return matchKeywords(combined, docKeywords) || 'Unknown';
}

export function detectBlock(fileName: string, path = ''): string {
  const pathParts = path.split(' > ').reverse();
  const searchStrings = [fileName, ...pathParts];

  for (const text of searchStrings) {
    const matched = matchKeywords(text, blockMap);
    if (matched) return matched;
  }

  return 'Unclassified';
}

export function detectGeneration(fileName: string, path = ''): string {
  const combined = `${path} > ${fileName}`;
  const parts = combined.split(' > ').reverse();

  for (const part of parts) {
    const mdcuMatch = part.match(/MDCU\s*(\d{2,3})/i);
    if (mdcuMatch) return `MDCU ${parseInt(mdcuMatch[1], 10)}`;

    const bracketMatch = part.match(/\[(\d{2,3})\]/);
    if (bracketMatch) return `MDCU ${parseInt(bracketMatch[1], 10)}`;

    const rawNumbers = part.match(/\b(\d{2,3})\b/g);
    if (rawNumbers) {
      for (const numStr of rawNumbers) {
        const num = parseInt(numStr, 10);
        if (num >= 63 && num <= 90) return `MDCU ${num}`;
      }
    }
  }

  return 'Auto-Detected';
}

export function categorizeFile(file: { name: string; path?: string }): object {
  const fileName = file.name;
  const path = file.path || '';
  const block = detectBlock(fileName, path);

  return {
    ...file,
    docType: detectDocType(fileName, path),
    block: block,
    generation: detectGeneration(fileName, path),
    year: SUBJECT_YEAR_MAP[block] || 'other'
  };
}