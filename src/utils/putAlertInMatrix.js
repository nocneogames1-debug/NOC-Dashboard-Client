const putAlertInMatrix = (envs = [], metric = [], classifiedAlerts = []) => {
    const arr = envs.map(() => metric.map(() => []));

    for (let i = 0; i < envs.length; i++) {
        for (let j = 0; j < metric.length; j++) {
            for (let k = 0; k < classifiedAlerts.length; k++) {
                if (
                    classifiedAlerts[k].env === envs[i] &&
                    classifiedAlerts[k].metric === metric[j]
                ) {
                    arr[i][j] = [...arr[i][j], classifiedAlerts[k].priority];
                }
            }
        }
    }

    return arr;
};

export default putAlertInMatrix;
