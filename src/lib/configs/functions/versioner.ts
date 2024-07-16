const buildInfo = {
    // @ts-ignore
    nodeEnv: I_NODE_ENV,
    // @ts-ignore
    publicCommit: I_COMMIT,
    // @ts-ignore
    lastMod: I_LAST_MOD,
    // @ts-ignore
    version: I_VERSION
};

export const getVersion = () => {
    return `v${buildInfo?.version}-${buildInfo?.publicCommit.substring(0, 7)}-${buildInfo?.nodeEnv?.substring(0, 4)} (${buildInfo?.lastMod})`
};