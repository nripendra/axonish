const { exec } = require("child_process");
const childService = exec(
  "node -r ts-node/register ./recipe-service/index.ts",
  (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  }
);

const childApi = exec(
  "node -r ts-node/register ./index.ts",
  (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  }
);

childApi.stdout.on("data", function(data) {
  console.log(data.toString());
});

childService.stdout.on("data", function(data) {
  console.log(data.toString());
});

const cleanup = () => {
  try {
    childApi.kill();
  } catch (e) {}
  try {
    childService.kill();
  } catch (e) {}
};

process.on("exit", cleanup);
process.on("SIGINT", cleanup);
process.on("SIGUSR1", cleanup);
process.on("SIGUSR2", cleanup);
process.on("uncaughtException", cleanup);
