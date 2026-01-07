export default (arr) => {
    let max = "P4";
    function gpan(p) {
        switch (p) {
            case "P1":
                return 1;
            case "P2":
                return 2;
            case "P3":
                return 3;
            case "P4":
                return 4;
            default:
                break;
        }
    }

    for (let i = 0; i < arr.length; i++) {
        const priority = gpan(arr[i].priority);
        if (priority < gpan(max)) {
            max = arr[i].priority;
        }
    }
    return max;
}