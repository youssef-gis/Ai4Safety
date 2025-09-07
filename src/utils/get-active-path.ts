import {closest} from 'fastest-levenshtein'

export const getActivePath = (path:string, paths:string[], ignoredPath:string[]) => {
    const closestPath= closest(path, paths.concat(ignoredPath || []));
    const index= paths.indexOf(closestPath);
    return {active: closestPath, activeindex: index};
};