import { cp, mkdir, rm, exec, cd } from "shelljs";

mkdir("-p", __dirname + "/out/@axonish");
rm("-rf", __dirname + "/out/@axonish");

mkdir("-p", __dirname + "/out/@axonish/core");
mkdir("-p", __dirname + "/out/@axonish/cqrs");

cp("-R", __dirname + "/@axonish/core", __dirname + "/out/@axonish");
cp("-R", __dirname + "/@axonish/cqrs", __dirname + "/out/@axonish");

rm("-rf", __dirname + "/out/@axonish/core/.vscode");
rm("-rf", __dirname + "/out/@axonish/core/src");
rm("-rf", __dirname + "/out/@axonish/core/dist/test-utils");
rm(__dirname + "/out/@axonish/core/tsconfig.json");

rm("-rf", __dirname + "/out/@axonish/cqrs/.vscode");
rm("-rf", __dirname + "/out/@axonish/cqrs/src");

rm(__dirname + "/out/@axonish/cqrs/tsconfig.json");

cd(__dirname + "/out/@axonish/core");
exec("yarn pack");
cd(__dirname + "/out/@axonish/cqrs");
exec("yarn pack");
cd(__dirname);
