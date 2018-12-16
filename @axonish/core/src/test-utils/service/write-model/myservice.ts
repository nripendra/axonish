import { myEmitter } from "../emitter";
myEmitter.on("test", () => {
  myEmitter.emit("test-reply");
});
