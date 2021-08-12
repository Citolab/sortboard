
import { LayoutRect, RectEntry, ViewRect } from '@dnd-kit/core';
import { Coordinates } from '@dnd-kit/core/dist/types';


function centerOfRectangle(
    rect: LayoutRect,
    left = rect.offsetLeft,
    top = rect.offsetTop
): Coordinates {
    return {
        x: left + rect.width * 0.5,
        y: top + rect.height * 0.5,
    };
}

function distanceBetween(p1: Coordinates, p2: Coordinates) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

export const getMinValueIndex = (array: number[]) =>
    getValueIndex(array, (value, tracked) => value < tracked);

/**
 * Returns the index of the smallest number in an array of numbers
 */
export function getValueIndex(
    array: number[],
    comparator: (value: number, tracked: number) => boolean
) {
    if (array.length === 0) {
        return -1;
    }

    let tracked = array[0];
    let index = 0;

    for (let i = 1; i < array.length; i++) {
        if (comparator(array[i], tracked)) {
            index = i;
            tracked = array[i];
        }
    }

    return index;
}

export const closestCenterByPixel = (rects: RectEntry[], rect: ViewRect) => {
    const centerRect = centerOfRectangle(rect, rect.left, rect.top);
    const distances = rects.map(([_, rect]) =>
        distanceBetween(centerOfRectangle(rect), centerRect)
    );

    const minValueIndex = getMinValueIndex(distances);
    const closest = distances[minValueIndex];
    if (closest < 50) {
        return rects[minValueIndex] ? rects[minValueIndex][0] : null;
    }
    return null;
}