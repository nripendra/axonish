import { TapBark } from "tap-bark";
import { TestSet, TestRunner } from "alsatian";

(async () => {
  console.clear();
  const testSet = TestSet.create();
  console.log("Preparing to run tests...");
  console.log(" -> Adding test files: ./@axonish/**/*.spec.ts");
  testSet.addTestsFromFiles("./@axonish/**/*.spec.ts");

  const testRunner = new TestRunner();

  console.log(" -> Setting up test pipeline...");
  testRunner.outputStream
    .pipe(TapBark.create().getPipeable())
    .pipe(process.stdout);

  console.log(" -> Running the testset..");
  await testRunner.run(testSet);
})().catch(e => {
  console.error("An error occured, exiting process", e);
  process.exit(1);
});
