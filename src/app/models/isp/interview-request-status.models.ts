export enum InterviewRequestStatus {
    PENDING = 'Pending',
    ACCEPTED = 'Accepted',
    REJECTED = 'Rejected'
  }

export interface FullInterviewRequestStatus {
    id: number;
    interviewRequestStatusName: string;
}

export interface InterviewRequestStatusDto {
    id: number;
    interviewRequestStatusName: string;
}