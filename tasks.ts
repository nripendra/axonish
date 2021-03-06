import { cp, mkdir, rm, exec, cd, ExecOutputReturnValue } from "shelljs";
type TaskFn = () => ExecOutputReturnValue | void;
type TaskDescriptor = {
  name: string;
  fn: TaskFn;
  dependsOn?: string[] | string | TaskFn | TaskFn[];
};
const visitedTasks: any[] = [];
function execute(name: string | TaskFn): ExecOutputReturnValue | void {
  if (name instanceof Function) {
    if (visitedTasks.indexOf(name) === -1) {
      visitedTasks.push(name);
      return name();
    }
    console.log(`Ignoring task "${name.name}", as it was executed previously`);
    return;
  }
  const tasks = ((def as any).tasks || []) as TaskDescriptor[];
  const task = tasks.find(x => x.name == name);
  if (task) {
    if (task.dependsOn !== undefined && task.dependsOn.length > 0) {
      const dependsOn = [];
      if (Array.isArray(task.dependsOn)) {
        dependsOn.push(...task.dependsOn);
      } else {
        dependsOn.push(task.dependsOn);
      }
      for (const item of dependsOn) {
        const result = execute(item);
        if (result && result.code !== 0) {
          return result;
        }
      }
    }
    return execute(task.fn);
  }
}

function def(
  name: string,
  fn: TaskFn,
  dependsOn?: string[] | string | Function | Function[]
) {
  (def as any).tasks = ((def as any).tasks || []) as TaskDescriptor[];
  Object.defineProperty(fn, "name", {
    value: name,
    writable: false
  });
  (def as any).tasks.push({ name, fn, dependsOn });
}

/////////////////////////////////////////////////////

def("build", () => {
  rm("-rf", __dirname + "/@axonish/core/dist");
  rm("-rf", __dirname + "/@axonish/cqrs/dist");
  exec("tsc -b " + __dirname + "/@axonish/core");
  return exec("tsc -b " + __dirname + "/@axonish/cqrs");
});
def(
  "test",
  () => {
    return exec("ts-node --project ./tsconfig.json ./run-specs.ts");
  },
  "build"
);
def("init-pack", () => {
  mkdir("-p", __dirname + "/out/@axonish");
  rm("-rf", __dirname + "/out/@axonish");
  mkdir("-p", __dirname + "/out/@axonish/core");
  mkdir("-p", __dirname + "/out/@axonish/cqrs");
});
def("pack-core", () => {
  try {
    cp("-R", __dirname + "/@axonish/core", __dirname + "/out/@axonish");
    rm("-rf", __dirname + "/out/@axonish/core/.vscode");
    rm("-rf", __dirname + "/out/@axonish/core/src");
    rm("-rf", __dirname + "/out/@axonish/core/dist/test-utils");
    rm(__dirname + "/out/@axonish/core/tsconfig.json");
    cd(__dirname + "/out/@axonish/core");
    return exec("npm pack");
  } finally {
    cd(__dirname);
  }
});
def("pack-cqrs", () => {
  try {
    cp("-R", __dirname + "/@axonish/cqrs", __dirname + "/out/@axonish");
    rm("-rf", __dirname + "/out/@axonish/cqrs/.vscode");
    rm("-rf", __dirname + "/out/@axonish/cqrs/src");
    rm(__dirname + "/out/@axonish/cqrs/tsconfig.json");
    cd(__dirname + "/out/@axonish/cqrs");
    return exec("npm pack");
  } finally {
    cd(__dirname);
  }
});

def("pack", () => {}, ["test", "init-pack", "pack-core", "pack-cqrs"]);

def(
  "copy",
  () => {
    console.log("Copying...");
    mkdir("-p", "/packages");
    mkdir("-p", "c:/packages");
    cp(__dirname + "/out/@axonish/core/*.tgz", "c:/packages");
    cp(__dirname + "/out/@axonish/core/*.tgz", "/packages");
    console.log("Copied @axonish/core tarball to /packages");
    cp(__dirname + "/out/@axonish/cqrs/*.tgz", "c:/packages");
    cp(__dirname + "/out/@axonish/cqrs/*.tgz", "/packages");
    console.log("Copied @axonish/cqrs tarball to /packages");
  },
  ["pack"]
);

const tasks = process.argv.slice(2);
tasks.length === 0 ? tasks.push("copy") : "";
console.log("Running tasks: ", tasks);
tasks.map(task => execute(task));
