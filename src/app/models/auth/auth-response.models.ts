export interface LoginEmployeeResponseDto {
    userId: string;
    employeeId: string;
    userName: string;
    token: string;
    role: string;
}

export interface RegisterEmployeeResponseDto {
    userId: string;
    employeeId: string;
    userName: string;
    role: string;
}