import { FullContract } from "./contract.models";
import { FullInterviewResult } from "./interview-result.models";

export interface FullInterview {
    id: number;
    interviewRequestId: number;
    interviewResultId: number;
    date: string;
    interviewResult: FullInterviewResult;
    contract?: FullContract;
}

export interface InterviewDto {
    id: number;
    interviewRequestId: number;
    interviewResultId: number;
    date: string;
}

export interface AddInterviewDto {
    interviewRequestId: number;
    interviewResultId: number;
    date: string;
}