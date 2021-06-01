import { v4 as uuidv4 } from 'uuid';
import Queue, { Job } from 'bull';
const q = new Queue('sample', 'redis://localhost:6379');

const ACTION = ["LẤY CƠM", "ĂN CƠM", "NHAI", "NUỐT"]
let currentAction = 0

const doTask = async (index) => {
    console.log("before do task ", index)
    setTimeout(() => {
        process.stdout.write("**********|");
        process.stdout.write(index.toString());
    }, index * 1000)
    console.log("end do task ", index)
}

const heavyTask = async () => {
    console.log("before: ", new Date())
    for (let i = 0; i < 200; i++) {
        await doTask(i)
    }
    setTimeout( () => {
        console.log("end ", new Date())
    }, 10000)
}

const init = async () => {
    // DRINK WATER
    try {
        setInterval(async () => {
            const taskName = uuidv4();
            await q.add(taskName, {});
            q.process(taskName, async (job) => {
                // TODO handle your maintenance operation.
                console.log(" check to drink water: ", currentAction)
                if (currentAction === 1) {
                    console.log('UỐNG NƯỚC')
                }
            }).catch((e) => console.log(`Something went wrong: ${e}`));
        }, 1000) // every 1 second
    } catch (err) {
        console.log(err.message
        )
    }

    // LUNCH
    await q.add('lunch', {}, { repeat: { cron: '*/1 * * * *' } }); // every minute
    q.process('lunch', async (job) => {
        console.log("lunch: ", ACTION[currentAction])
        await heavyTask()
        currentAction = (currentAction + 1) % ACTION.length
    }).catch((e) => console.log(`Something went wrong: ${e}`));
}

init()