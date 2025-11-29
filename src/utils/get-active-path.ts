import {closest} from 'fastest-levenshtein'

// export const getActivePath = (path:string, paths:string[], ignoredPath:string[]) => {
//     const closestPath= closest(path, paths.concat(ignoredPath || []));

//     const index= paths.indexOf(closestPath);
//     console.log("closest path index: ", closestPath, index);
//     return {active: closestPath, activeindex: index};
// };

export const getActivePath = (currentPath: string, navPaths: string[]) => {
    let activePath = '';
    let longestMatch = 0;

    // Find the nav path that is the longest prefix of the current path
    for (const navPath of navPaths) {
        if (currentPath.startsWith('/'+navPath) && navPath.length > longestMatch) {
            longestMatch = navPath.length;
            activePath = navPath;
        }
    }

    const activeIndex = navPaths.indexOf(activePath);

    console.log("Active Path Found:", navPaths);

    return { active: activePath, activeindex: activeIndex };
};