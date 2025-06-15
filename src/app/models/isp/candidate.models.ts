export interface FullCandidate {
    id: number;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
}

export interface CandidateDto {
    id: number;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
}

export interface AddCandidateDto {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
}

export interface CandidateFilterParameters {
  firstNameContains?: string;
  lastNameContains?: string;
  phoneNumberContains?: string;
  emailContains?: string;
}

export interface CandidateSortOptions {
  sortBy?: string;
  ascending: boolean;
}

export interface CandidatePaginationOptions {
  pageSize: number;
  pageNumber: number;
  totalItems: number;
}
