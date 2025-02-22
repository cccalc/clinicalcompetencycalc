export type EPAKFDesc = {
  epa_desc: { [key: string]: string };
  kf_desc: { [key: string]: string };
};

export type MCQ = {
  epa: string;
  kf: string;
  opt_count: number;
  options: { [key: string]: string };
  question: string;
};

export type DevLevel = 'none' | 'remedial' | 'early-developing' | 'developing' | 'entrustable';
