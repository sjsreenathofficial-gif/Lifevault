export const DOCUMENT_CATEGORIES = {
  identity: {
    label: 'Identity',
    icon: 'Fingerprint',
    color: '#00f5ff',
    types: ['Aadhaar Card', 'PAN Card', 'Passport', 'Voter ID', 'Driving License', 'Birth Certificate'],
  },
  education: {
    label: 'Education',
    icon: 'GraduationCap',
    color: '#7c3aed',
    types: ['SSC Memo', 'Intermediate Certificate', 'Degree Certificate', 'Diploma', 'Transcript', 'Marksheet'],
  },
  property: {
    label: 'Property',
    icon: 'Home',
    color: '#f59e0b',
    types: ['Property Document', 'Land Record', 'Sale Deed', 'Rental Agreement', 'Registry'],
  },
  financial: {
    label: 'Financial',
    icon: 'Banknote',
    color: '#10b981',
    types: ['Insurance Document', 'Bank Statement', 'Tax Return', 'Investment Certificate', 'Loan Document'],
  },
  medical: {
    label: 'Medical',
    icon: 'Heart',
    color: '#ef4444',
    types: ['Medical Record', 'Prescription', 'Test Report', 'Vaccination Certificate', 'Hospital Discharge'],
  },
  personal: {
    label: 'Personal',
    icon: 'Star',
    color: '#f97316',
    types: ['Marriage Certificate', 'Death Certificate', 'Will', 'Power of Attorney', 'Other'],
  },
};

export const FAMILY_RELATIONS = [
  'Self', 'Spouse', 'Father', 'Mother', 'Son', 'Daughter',
  'Brother', 'Sister', 'Grandfather', 'Grandmother', 'Other'
];

export const ALL_DOCUMENT_TYPES = Object.values(DOCUMENT_CATEGORIES)
  .flatMap(cat => cat.types);

export const CATEGORY_KEYWORDS = {
  identity: ['aadhaar', 'pan', 'passport', 'voter', 'driving', 'birth', 'id', 'identity', 'national'],
  education: ['ssc', 'intermediate', 'degree', 'diploma', 'certificate', 'marks', 'grade', 'school', 'college', 'university'],
  property: ['property', 'land', 'deed', 'rental', 'registry', 'house', 'plot', 'flat', 'sale'],
  financial: ['insurance', 'bank', 'tax', 'investment', 'loan', 'finance', 'mutual', 'fund', 'policy'],
  medical: ['medical', 'prescription', 'test', 'vaccine', 'hospital', 'doctor', 'health', 'report', 'blood'],
  personal: ['marriage', 'death', 'will', 'power', 'attorney', 'personal'],
};
