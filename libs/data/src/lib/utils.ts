import firebase from 'firebase/app';
import { Card, UserInfo } from './model';
import { useEffect, useRef, useCallback } from 'react';
import { data } from './data';

export function isDefined<T>(value: T | undefined | null): value is T {
    return <T>value !== undefined && <T>value !== null;
}

export function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const createCode = (length: number) => {
    let result = '';
    const characters = 'BCDFGHJKLMNPQRSTVWXYZ';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


export const isBaseUrl = (url: string) => {
    const parsedUrl = parseUrl(url);
    return !trim(parsedUrl.pathname, '/');
}

export const parseUrl = (url: string) => {
    // eslint-disable-next-line no-useless-escape
    const m = url.match(/^(([^:\/?#]+:)?(?:\/\/((?:([^\/?#:]*):([^\/?#:]*)@)?([^\/?#:]*)(?::([^\/?#:]*))?)))?([^?#]*)(\?[^#]*)?(#.*)?$/),
        r = {
            hash: m[10] || "",                   // #asd
            host: m[3] || "",                    // localhost:257
            hostname: m[6] || "",                // localhost
            href: m[0] || "",                    // http://username:password@localhost:257/deploy/?asd=asd#asd
            origin: m[1] || "",                  // http://username:password@localhost:257
            pathname: m[8] || (m[1] ? "/" : ""), // /deploy/
            port: m[7] || "",                    // 257
            protocol: m[2] || "",                // http:
            search: m[9] || "",                  // ?asd=asd
            username: m[4] || "",                // username
            password: m[5] || ""                 // password
        };
    if (r.protocol.length == 2) {
        r.protocol = "file:///" + r.protocol.toUpperCase();
        r.origin = r.protocol + "//" + r.host;
    }
    r.href = r.origin + r.pathname + r.search + r.hash;
    return r;
};



// returns a function that when called will
// return `true` if the component is mounted
export const useIsMounted = () => {
    const mountedRef = useRef(false)
    const isMounted = useCallback(() => mountedRef.current, [])
    useEffect(() => {
        mountedRef.current = true
        return () => {
            mountedRef.current = false
        }
    }, [])

    return isMounted;
}

export const stringsAreEqual = (string1: string, string2: string) => {
    return string1.trim().toUpperCase() === string2.trim().toUpperCase();
}

export const trim = (s: string, char: string) => {
    if (char === "]") char = "\\]";
    if (char === "^") char = "\\^";
    if (char === "\\") char = "\\\\";
    return s.replace(new RegExp(
        "^[" + char + "]+|[" + char + "]+$", "g"
    ), "");
}


const demoUserPhotoUrl = 'https://demouser.nl/demouser.png';

export const dateId = () => {
    const dt = new Date();
    const year = dt.getFullYear();
    const month = (dt.getMonth() + 1).toString().padStart(2, "0");
    const day = dt.getDate().toString().padStart(2, "0");
    const hour = (dt.getHours()).toString().padStart(2, "0");
    const minutes = (dt.getMinutes()).toString().padStart(2, "0");
    const seconds = (dt.getSeconds()).toString().padStart(2, "0");
    const milliseconds = (dt.getMilliseconds()).toString().padStart(3, "0");
    return `${year}${month}${day}${hour}${minutes}${seconds}${milliseconds}`;
}

export const getUserInfo = async (user: firebase.User): Promise<UserInfo> => {
    if (user) {
        const splittedUser = user.displayName?.split('|');
        return {
            id: user.uid,
            activityCode: splittedUser?.length > 1 ? splittedUser[0] : '',
            teacherId: splittedUser?.length > 2 ? splittedUser[1] : '',
            avatarIndex: splittedUser?.length > 3 ? +splittedUser[2] : 0,
            demoUser: user.photoURL === demoUserPhotoUrl,
            token: await user.getIdToken()
        }
    }
    return null;
}

export const setUserInfo = async (user: firebase.User, activityCode: string, teacherId: string, demoUser = false) => {
    await user.updateProfile({
        // (ab)use display name to store the code of the
        // started started activity and teacher Id.
        displayName: `${activityCode}|${teacherId}`,
        photoURL: demoUser ? demoUserPhotoUrl : ''
    });
    const updatedUser = await getUserInfo(user);
    return updatedUser;
}

export const precise_round = (num: number, dec = 0): number => {
    const num_sign = num >= 0 ? 1 : -1;
    return +(Math.round((num * Math.pow(10, dec)) + (num_sign * 0.0001)) / Math.pow(10, dec)).toFixed(dec);
}

export const scale = (value: number, prevMax: number, decimals = 0) => {
    const result = prevMax === 0 ? 0 : (value * 100) / prevMax;

    if (result <= 0) {
        return 0;
    } else if (result > 100) {
        return 100;
    }
    return precise_round(result, decimals);
};

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

export function getUnique<T>(arr: T[]): T[] {
    return arr.filter(onlyUnique);
}

// export const scaleArray = (distibution: { id: string, value: number }[]) => {
//     const total = sum(distibution.map(d => d.value));
//     const scaledDistribution: { id: string, value: number }[] = distibution.map(d => {
//         return { ...d, value: scale(d.value, total) }
//     });
//     return scaledDistribution;
// }

export function scaleArray<T>(items: T[], getKey: (item: T) => number) {
    const total = sum(items.map(getKey));
    const scaledArray = items.map(d => {
        return { ...d, scaled: scale(getKey(d) || 0, total) }
    });
    return scaledArray;
}

export const getCardDistributions = (draggedCards: Card[], showAll = false) => {
    const uniqueCardsId = showAll ? data.map(card => card.id) : getUnique(draggedCards.map(d => d.id));
    return uniqueCardsId.map(cardId => {
        const dragged = draggedCards.filter(c => c.id === cardId);
        const card = dragged.find(d => d.id === cardId) || data.find(card => card.id === cardId);
        const keuzes = card.keuzes.map(keuze => {
            const cardsPerKeuze = dragged.filter(d => d.keuzeId === keuze.id);
            return { ...keuze, count: cardsPerKeuze?.length || 0 };
        })
        const scaled = scaleArray(keuzes, k => k.count);
        return { ...card, keuzes: scaled };
    }).filter(c => showAll || !!c.keuzes.find(k => k.count !== 0))
}


export const sum = (items: number[]) => items.reduce((sum, current) => +sum + +current, 0);

export function sumField<T>(items: T[], getKey: (item: T) => number) {
    return sum(items.map(getKey))
}

export function avgField<T>(items: T[], getKey: (item: T) => number) {
    if (items.length === 0) return 0;
    const summedValues = sum(items.map(getKey));
    return Math.round(summedValues / items.length);
}
export function flatten<T>(nestedArrays: T[][]): T[] {
    return [].concat(...nestedArrays);
}

export function sort<T, K>(list: T[], getKey: (item: T) => K, desc = false) {
    list.sort((a: T, b: T) => {
        const valueA = getKey(a);
        const valueB = getKey(b);
        if (valueA < valueB) {
            return !desc ? -1 : 1;
        } else if (valueA > valueB) {
            return !desc ? 1 : -1;
        } else {
            return 0;
        }
    });
    return list;
}
