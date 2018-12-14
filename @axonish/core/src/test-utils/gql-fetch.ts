import * as http from "http";

/**
 * A utility function for helping with unit tests (or, rather integration tests). This functions
 * invokes a graphQL query on give port number. The host will always be hard-coded to localhost.
 * @param port
 * @param query
 */
export async function gqlFetch<T>(port: number, query: string) {
  const response: { data: T } = await new Promise(function(resolve, reject) {
    const postQuery = JSON.stringify({
      query
    });

    const httpRequest = http.request(
      {
        port: port,
        host: "localhost",
        path: "/graphql",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postQuery)
        }
      },
      function(httpResponse) {
        let responseData = "";
        httpResponse.setEncoding("utf8");
        httpResponse.on("data", chunk => {
          responseData += chunk;
        });
        httpResponse.on("end", () => {
          let obj = JSON.parse(responseData);
          if (obj.errors || obj.error) {
            reject(obj.errors || obj.error);
            return;
          }
          resolve(obj);
        });
      }
    );

    httpRequest.on("error", err => {
      reject(err);
    });

    httpRequest.write(postQuery);
    httpRequest.end();
  });

  return response.data;
}
