export interface LoginResponse{

    token:string;

    refreshToken:string;

    expires:string;

    username:string;

    roles:string[];

}