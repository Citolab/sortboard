// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as corsPackage from 'cors';
import {
    Activity, ActivityState, DATABASE, DEMO_CODE, StateToStore
} from '@sortboard/data';

const cors = corsPackage({ origin: true });
admin.initializeApp();

const authenticate = async (res, id: string, allowedProviders: string[]) => {
    const user = await admin.auth().getUser(id);
    if (!user && !allowedProviders.includes('anonymous')) {
        res.status(403).send('Unauthorized');
        return null;
    }
    try {
        const provider = user.providerData.length > 0 ? user.providerData[0].providerId : 'anonymous';
        if (allowedProviders.indexOf(provider) !== -1) {
            return user;
        } else {
            console.error(`Access with provider ${provider} not allowed`)
            return null;
        }
    } catch (e) {
        res.status(403).send('Unauthorized');
        return null;
    }
};

const getActivity = async (code: string) => {
    const doc = await admin.firestore().doc(DATABASE.ACTIVITY.DOC(code)).get();
    return doc.exists ? (doc.data() as Activity) : null;
}

exports.checkCode = functions
    .region('europe-west1')
    .https
    .onRequest((req, res) => {
        cors(req, res, async () => {
            if (req.method !== 'POST') {
                res.sendStatus(404);
            }

            // Grab the code parameter.
            const { code, userId }: { code: string, userId: string } = req.body?.data;
            const user = await authenticate(res, userId, ['anonymous']);
            if (!user) {
                return;
            }
            const activity = await getActivity(code.toUpperCase());
            if (activity && activity.state === ActivityState.inprogress) {
                // create a new avatarIndex if the candidate wasn't started.
                const teacherStudentCollection = admin.firestore().collection(DATABASE.TEACHER.ACTIVITY.STUDENT.COLLECTION(activity.createdBy, activity.code));
                const existingState = await teacherStudentCollection.doc(userId).get();
                if (existingState.exists) {
                    console.warn(`user logs in with same code. Shouldn't be possible`);
                }
                res.send({ data: { activity: activity } });
            } else {
                res.sendStatus(404);
            }
            return;
        });
    });

export const ProcessStudentSortStateChanged = functions
    .region('europe-west1')
    .firestore
    .document('/sort_state/{id}')
    .onWrite(async (changes, context) => {
        const newState = changes.after.data() as StateToStore;
        if (newState?.activity && newState.activity.code !== DEMO_CODE) {
            const studentDocRef = admin.firestore().doc(DATABASE.TEACHER.ACTIVITY.STUDENT.DOC(newState.activity.createdBy, newState.activity.code, context.params.id));
            await studentDocRef.set(newState);
        }
    });

export const ProcessStudentSortStateDevChanged = functions
    .region('europe-west1')
    .firestore
    .document('/sort_state_dev/{id}')
    .onWrite(async (changes, context) => {
        const newState = changes.after.data() as StateToStore;
        if (newState?.activity && newState?.activity?.code !== DEMO_CODE) {
            const studentDocRef = admin.firestore().doc(DATABASE.TEACHER.ACTIVITY.STUDENT.DOC(newState.activity.createdBy, newState.activity.code, context.params.id));
            await studentDocRef.set(newState);
        }
    });

// export const processActivityDataChanges = functions
//     .region('europe-west1')
//     .firestore
//     .document('/action/{id}')
//     .onCreate(async (doc) => {
//         const action = doc.data() as StudentActionBase;
//         switch (action.type) {
//             case studentTypes.ORDER.START: {
//                 const startAction = orderStartAction(action.payload);
//                 const studentDocRef = admin.firestore().doc(`teacher/${action.createdBy}/activity/${action.activityCode}/student/${action.createdBy}`);
//                 await studentDocRef.set({

//                 } as StudentState);
//             }
//         }
//     }
// }