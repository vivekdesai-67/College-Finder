export interface ICutoff {
  general: number;
  obc: number;
  sc: number;
  st: number;
}

export interface IBranch {
  name: string;
  cutoff: ICutoff;
  placementRate?: number;
  avgSalary?: number;
  maxSalary?: number;
  admissionTrend?: number;
  industryGrowth?: number;
  isBooming?: boolean;
}

export interface ICollege {
  _id: string;
  name: string;
  location: string;
  fees: number;
  infraRating?: number;
  branchesOffered: IBranch[];
  catalogueUrl?: string;
  description?: string;
  views?: number;
  established?: number;
  type?: "Government" | "Private" | "Autonomous";
  accreditation?: string;
  image?: string;
}
