export let addTime = (cpuTimeSumArr: Array<number>, n1: number) => {
    cpuTimeSumArr.push(performance.now() - n1);
}

export let showTime = (cpuTimeSumArr: Array<number>) => {
    setInterval(() => {
        let filteredCPUTimeSumArr = cpuTimeSumArr.sort().slice(0, cpuTimeSumArr.length - 3);

        let cpuTime = filteredCPUTimeSumArr.reduce((sum, time) => {
            return sum + time;
        }, 0) / filteredCPUTimeSumArr.length;

        cpuTime = Math.round(cpuTime * 100) / 100;

        document.querySelector("#cpu_time").innerHTML = String(cpuTime);
    }, 300);
}