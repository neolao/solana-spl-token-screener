import { spawn } from "node:child_process";

function getNextTaskDate() {
    const nextTaskDate = new Date();
    nextTaskDate.setUTCHours(1);
    nextTaskDate.setUTCMinutes(0);
    nextTaskDate.setUTCSeconds(0);
    nextTaskDate.setUTCMilliseconds(0);

    return nextTaskDate;
}

function getDelay(nextDate) {
    const now = Date.now();

    let nextTaskTime = nextDate.getTime();

    if (nextTaskTime < now) {
        nextDate.setUTCDate(nextDate.getUTCDate() + 1);
        nextTaskTime = nextDate.getTime();
    }

    const delay = nextTaskTime - now;
    return delay;
}


async function executeTask() {
    return new Promise((resolve, reject) => {
        const task = spawn("node", ["fetchYesterdayOHLCV.mjs"]);

        task.stdout.on('data', (data) => {
          process.stdout.write(data);
        });

        task.stderr.on('data', (data) => {
          console.error(`ERROR: ${data}`);
        });

        task.on('close', (code) => {
            resolve();
        });
    });
}

function wait() {
    const nextTaskDate = getNextTaskDate();
    const delay = getDelay(nextTaskDate);
    console.log(`Task at ${nextTaskDate.toLocaleString('fr-FR')} ...`);
    setTimeout(async () => {
        await executeTask();
        wait();
    }, delay);
}

wait();
