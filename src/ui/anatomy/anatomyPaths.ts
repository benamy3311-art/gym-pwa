export const BODYPART_TO_REGIONS: Record<string, string[]> = {
    chest: ['chest'],
    back: ['latsBack', 'trapsBack', 'lowerBack'],
    shoulders: ['deltsFront', 'deltsBack'],
    biceps: ['bicepsFront'],
    triceps: ['tricepsBack'],
    legs: ['quadsFront', 'hamstringsBack', 'calvesBack'],
    glutes: ['glutesBack'],
    core: ['abs'],
    fullbody: [
        'chest', 'abs', 'quadsFront', 'bicepsFront', 'deltsFront',
        'latsBack', 'trapsBack', 'lowerBack', 'hamstringsBack', 'calvesBack', 'glutesBack', 'tricepsBack', 'deltsBack'
    ]
};

// minimal stylized silhouettes
// base body parts have opacity, regions have absolute fill if highlighted

export const REGION_PATHS_FRONT: Record<string, string> = {
    // base outline/fill (rendered non-highlighted usually)
    baseHead: "M43 14 C43 6, 57 6, 57 14 C57 23, 53 26, 50 30 C47 26, 43 23, 43 14 Z",
    baseNeck: "M47 30 L53 30 L54 36 L46 36 Z",

    // highlight regions
    chest: "M38 46 C45 42, 55 42, 62 46 C64 54, 60 62, 50 62 C40 62, 36 54, 38 46 Z",
    abs: "M42 63 C48 61, 52 61, 58 63 L55 85 C52 87, 48 87, 45 85 Z",
    deltsFront: "M38 46 C32 40, 26 44, 28 52 C31 58, 35 52, 38 46 Z M62 46 C68 40, 74 44, 72 52 C69 58, 65 52, 62 46 Z",
    bicepsFront: "M28 53 C24 60, 25 68, 28 72 C31 68, 32 60, 28 53 Z M72 53 C76 60, 75 68, 72 72 C69 68, 68 60, 72 53 Z",
    forearmsFront: "M28 73 C23 80, 23 90, 26 95 C29 90, 31 80, 28 73 Z M72 73 C77 80, 77 90, 74 95 C71 90, 69 80, 72 73 Z",
    quadsFront: "M44 95 C38 105, 34 125, 38 135 C42 125, 48 105, 48 95 Z M56 95 C62 105, 66 125, 62 135 C58 125, 52 105, 56 95 Z",
    calvesFront: "M38 140 C34 150, 35 165, 40 175 C43 165, 42 150, 38 140 Z M62 140 C66 150, 65 165, 60 175 C57 165, 58 150, 62 140 Z"
};

export const REGION_PATHS_BACK: Record<string, string> = {
    // base outline/fill 
    baseHead: "M43 14 C43 6, 57 6, 57 14 C57 23, 53 26, 50 30 C47 26, 43 23, 43 14 Z",
    baseNeck: "M46 25 L54 25 L55 34 L45 34 Z",

    // highlight regions
    trapsBack: "M45 34 C38 38, 32 40, 36 45 C43 40, 50 45, 50 52 C50 45, 57 40, 64 45 C68 40, 62 38, 55 34 Z",
    latsBack: "M36 46 C32 55, 38 65, 44 65 C48 55, 45 45, 50 42 Z M64 46 C68 55, 62 65, 56 65 C52 55, 55 45, 50 42 Z",
    lowerBack: "M44 66 C48 64, 52 64, 56 66 L54 80 C50 82, 50 82, 46 80 Z",
    deltsBack: "M36 45 C28 42, 24 48, 27 55 C32 50, 34 48, 36 45 Z M64 45 C72 42, 76 48, 73 55 C68 50, 66 48, 64 45 Z",
    tricepsBack: "M27 56 C22 62, 23 70, 27 75 C31 70, 31 62, 27 56 Z M73 56 C78 62, 77 70, 73 75 C69 70, 69 62, 73 56 Z",
    forearmsBack: "M27 76 C22 84, 22 92, 25 96 C29 90, 30 84, 27 76 Z M73 76 C78 84, 78 92, 75 96 C71 90, 70 84, 73 76 Z",
    glutesBack: "M40 82 C34 88, 34 98, 48 98 L50 90 L52 98 C66 98, 66 88, 60 82 Z",
    hamstringsBack: "M40 100 C34 110, 34 125, 38 135 C42 125, 46 110, 48 100 Z M60 100 C66 110, 66 125, 62 135 C58 125, 54 110, 52 100 Z",
    calvesBack: "M38 140 C32 150, 34 165, 40 175 C44 165, 42 150, 38 140 Z M62 140 C68 150, 66 165, 60 175 C56 165, 58 150, 62 140 Z"
};
