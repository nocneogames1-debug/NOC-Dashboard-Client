function normalize(str) {
    return String(str || '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9:_-]/g, '');
}

const ENV_DICTIONARY = {
    // Alberta
    AGLC: [
        'aglc',
        'datacentername:aglc',
    ],

    // North Carolina Education Lottery
    NCEL: [
        'ncel',
        'nc',
        'northcarolina',
        'north_carolina',
        'datacentername:nc',
    ],

    // Sazka / Czech Republic
    SAZKA: [
        'sazka',
        'sz',
        'cz',
        'czech',
        'czechrepublic',
        'datacentername:cz',
    ],

    // Michigan State Lottery
    MSL: [
        'msl',
        'mi',
        'michigan',
        'datacentername:mi',
    ],

    // Virginia Lottery
    VAL: [
        'val',
        'va',
        'virginia',
        'datacentername:va',
    ],

    // West Virginia Lottery
    WV: [
        'wv',
        'westvirginia',
        'west_virginia',
        'datacentername:wv',
    ],

    // Nigeria Lottery
    'NG-LOT': [
        'ng-lot',
        'ng',
        'nigeria',
        'datacentername:ng',
    ],

    // New Hampshire Lottery
    NHL: [
        'nh',
        'nhl',
        'newhampshire',
        'new_hampshire',
        'datacentername:nh',
    ],

    // US Lottery / IGT / ALC
    'US-LOT': [
        'us-lot',
        'igt',
        'alc',
        'uslot',
        'datacentername:us',
    ],
};


const METRIC_DICTIONARY = {
    Deposits: [
        'deposit',
        'deposits',
    ],

    Bets: [
        'bet',
        'bets',
        'wager',
        'wagers',
        'betting',
    ],

    Logins: [
        'login',
        'logins',
        'authentication',
        'auth',
        'signin',
    ],

    Performance: [
        'cpu',
        'coralogix',
        'apm',
        'mem',
        'memory',
        'ram',
        'response time',
        'responsetime',
        'latency',
        'slow',
        'timeout',
    ],
};


// priority order (optional, useful later for coloring)
const PRIORITIES = ['P1', 'P2', 'P3', 'P4'];

function matchFromTags(tags, dictionary) {
    for (const tag of tags) {
        const nTag = normalize(tag);

        for (const [canonical, aliases] of Object.entries(dictionary)) {
            for (const alias of aliases) {
                if (nTag.includes(normalize(alias))) {
                    return { value: canonical, from: tag };
                }
            }
        }
    }
    return null;
}

/**
 * Extract priority from alert object or tags
 */
function extractPriority(alert) {
    // 1️⃣ preferred: Opsgenie field
    if (typeof alert?.priority === 'string') {
        return alert.priority.toUpperCase();
    }

    // 2️⃣ fallback: tags like "priority:p2"
    const tags = Array.isArray(alert?.tags) ? alert.tags : [];
    for (const tag of tags) {
        const m = normalize(tag).match(/priority:(p[1-4])/);
        if (m) return m[1].toUpperCase();
    }

    return undefined;
}

export function classifyAlert(alert) {
    const tags = Array.isArray(alert?.tags) ? alert.tags : [];

    const envMatch = matchFromTags(tags, ENV_DICTIONARY);
    const metricMatch = matchFromTags(tags, METRIC_DICTIONARY);
    const priority = extractPriority(alert);

    return {
        env: envMatch?.value,
        metric: metricMatch?.value,
        priority,
    };
}

// batch version
export function classifyAlerts(alerts) {
    if (!Array.isArray(alerts)) return [];

    return alerts.map((alert) => ({
        id: alert.id,
        ...classifyAlert(alert),
    }));
}
