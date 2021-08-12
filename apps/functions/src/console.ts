/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { data, State, StateToStore } from '@sortboard/data';
import * as admin from 'firebase-admin';
import * as Excel from 'exceljs';

export class Row {
    code: string;
    status: string;
    geslacht: string;
    leeftijd: string;
}

(async () => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const serviceAccount = require(process.cwd() + '/apps/functions/citolab-sortboard-firebase-adminsdk.json');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: 'https://citolab-sortboard.firebaseio.com'
        });
        const docs = (await admin.firestore().collection('/sort_state').listDocuments());
        const rows = [];
        const columns = [
         { key:'code',  header: 'code' },
         { key:'geslacht',  header: 'geslacht' },
         { key:'status',  header: 'status' },
         { key:'leeftijd',  header: 'leeftijd' }
        ];
        
        data.forEach(card => {
            columns.push({ key:`${card.id}-order`,  header: `${card.id}-${card.stelling.substring(0, 10)}-order` });
            columns.push({ key:`${card.id}-sort`,  header: `${card.id}-${card.stelling.substring(0, 10)}-sort` });
            columns.push({ key:`${card.id}-text`,  header: `${card.id}-${card.stelling.substring(0, 10)}-text` });
        });
        for (const doc of docs) {
            const state = (await doc.get()).data() as StateToStore;
            if (state.userInfo) {
                const row: Row = {
                    code: state.activity.code,
                    status: state.state === State.done ? 'Klaar' : 'Niet afgerond',
                    geslacht: state.userInfo.gender,
                    leeftijd: state.userInfo.group
                }
                data.forEach(card => {
                    const matchingCard = state.cards.find(c => c.id === card.id);
                    row[`${card.id}-order`] = matchingCard.keuzeId;
                    row[`${card.id}-text`] = card.keuzes.find(k => k.id ===  matchingCard.keuzeId)?.text;
                    row[`${card.id}-sort`] = matchingCard.sortKey;
                });
                rows.push(row);
            }
        }
        const workbook = new Excel.Workbook();
        //Creating Sheet for that particular WorkBook
        const sheetName = 'Sheet1';
        const sheet = workbook.addWorksheet(sheetName);
        sheet.columns = columns;
        for (const row of rows) {
            sheet.addRow(row);
        }  
        //Finally creating XLSX file
        const fileName = "sortboard.xlsx";
        await workbook.xlsx.writeFile(fileName);
        console.log("done");

        /// 
    } catch (e) {
        // Deal with the fact the chain failed
        console.error(e);
    }
}
)();