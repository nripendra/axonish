import { TestFixture, AsyncTest, Expect, FocusTests } from "alsatian";
import { AxonishService } from ".";
import { IServiceStartup } from "../interfaces/IServiceStartup";
import { IServiceConfiguration } from "../interfaces/IServiceConfiguration";
import { __InjectConventionsForUnitTest } from "./directory-convention";
import { __InjectRootDir } from "./directory-convention";

__InjectRootDir(__dirname);

@TestFixture()
export class AxonishServiceSpecs {
  @AsyncTest(`Calls config`)
  async lifeCycleFunctions() {
    const calledFunctions: string[] = [];
    @AxonishService("Test-Service")
    class TestService implements IServiceStartup {
      config(serviceConfig: IServiceConfiguration): void | Promise<void> {
        calledFunctions.push("config");
      }
      onError(err: any): void {}
    }
    Expect(calledFunctions).toContain("config");
  }

  @AsyncTest(`config gets service name`)
  async serviceName() {
    let gotServiceName: string = "";
    @AxonishService("Test-Service")
    class TestService implements IServiceStartup {
      config(serviceConfig: IServiceConfiguration): void | Promise<void> {
        gotServiceName = serviceConfig.serviceName;
      }
      onError(err: any): void {}
    }
    Expect(gotServiceName).toBe("Test-Service");
  }

  @AsyncTest(`executes conventions`)
  async customConventions() {
    let conventionExecuted: boolean = false;
    function customConvention(config: IServiceConfiguration): void {
      conventionExecuted = true;
    }
    @AxonishService("Test-Service")
    class TestService implements IServiceStartup {
      config(serviceConfig: IServiceConfiguration): void | Promise<void> {
        serviceConfig.addConvention(customConvention);
      }
      onError(err: any): void {}
    }
    Expect(conventionExecuted).toBe(true);
  }

  @AsyncTest(`executes directory convention`)
  async directoryConventions() {
    let gotReply: boolean = false;
    __InjectConventionsForUnitTest([
      "../test-utils/service/**/write-model/*.{js,ts}"
    ]);
    @AxonishService("Test-Service")
    class TestService implements IServiceStartup {
      config(serviceConfig: IServiceConfiguration): void | Promise<void> {}
      onError(err: any): void {}
    }
    const emitter = (await import("../test-utils/service/emitter")).myEmitter;
    emitter.on("test-reply", () => {
      gotReply = true;
    });
    emitter.emit("test");
    Expect(gotReply).toBe(true);
  }
}
