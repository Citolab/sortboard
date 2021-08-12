export const DEMO_CODE = 'x-DEMO-x';
export const DATABASE = {
    TEACHER: {
        ACTIVITY: {
            COLLECTION: (userId: string) => `teacher/${userId}/activity`,
            DOC: (userId: string, activityCode: string) => `teacher/${userId}/activity/${activityCode}`,
            STUDENT: {
                COLLECTION: (userId: string, activityCode: string) => `teacher/${userId}/activity/${activityCode}/student`,
                DOC: (userId: string, activityCode: string, studentId: string) => `teacher/${userId}/activity/${activityCode}/student/${studentId}`,
            }
        }
    },
    STUDENT: {
        STATE: {
            COLLECTION: (isDev: boolean) => `sort_state${isDev ? '_dev' : ''}`,
            DOC: (isDev: boolean, userId: string) => `sort_state${isDev ? '_dev' : ''}/${userId}`,
        },
        ACTION: {
            COLLECTION: (isDev: boolean, userId: string) => `student_actions${isDev ? '_dev' : ''}/${userId}/actions`,
        },
    },
    // only used to check the login_code
    ACTIVITY: {
        COLLECTION: 'activity',
        DOC: (activityCode: string) => `activity/${activityCode}`
    }
}