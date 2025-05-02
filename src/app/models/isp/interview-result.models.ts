export enum InterviewResult {
    PASSED = 'Passed',
    FAILED = 'Failed'
  }

export interface FullInterviewResult {
    id: number;
    interviewResultName: string;
}

export interface InterviewResultDto {
    id: number;
    interviewResultName: string;
}