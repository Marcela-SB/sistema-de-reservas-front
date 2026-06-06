export type AuthorizationT = {
    id: string;
    name: string;
    roomsId: string[];
    authorizationProfessorId: string;
    authorizationResponsibleId: string;
    authorizatedToId: string;
    creationDate: string | null;
    authorizationStart: string;
    authorizationEnd: string;
    startTime: string | null;
    endTime: string | null;
    comment: string | null;
};
