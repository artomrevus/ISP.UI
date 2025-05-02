import { FullCandidate } from "./candidate.models";
import { FullInterviewRequestStatus } from "./interview-request-status.models";
import { FullInterview } from "./interview.models";

export interface FullInterviewRequest {
    id: number;
    vacancyId: number;
    candidateId: number;
    interviewRequestStatusId: number;
    number: string;
    applicationDate: string;
    considerationDate?: string;
    candidate: FullCandidate,
    interviewRequestStatus: FullInterviewRequestStatus,
    interview?: FullInterview,
}

export interface InterviewRequestDto {
    id: number;
    vacancyId: number;
    candidateId: number;
    interviewRequestStatusId: number;
    number: string;
    applicationDate: string;
    considerationDate?: string;
}