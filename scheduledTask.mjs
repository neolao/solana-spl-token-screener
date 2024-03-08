import { spawn } from "node:child_process";

function getDelay() {
    const now = Date.now();

    const nextTaskDate = new Date();
    nextTaskDate.setUTCHours(1);
    nextTaskDate.setUTCMinutes(0);
    nextTaskDate.setUTCSeconds(0);
    nextTaskDate.setUTCMilliseconds(0);
    let nextTaskTime = nextTaskDate.getTime();

    if (nextTaskTime < now) {
        nextTaskDate.setUTCDate(nextTaskDate.getUTCDate() + 1);
        nextTaskTime = nextTaskDate.getTime();
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
    const delay = getDelay();
    console.log(`Task in ${delay} seconds ...`);
    setTimeout(async () => {
        await executeTask();
        wait();
    }, delay);
}

wait();
