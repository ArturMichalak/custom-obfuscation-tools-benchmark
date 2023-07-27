(async () => {
  const TRIALS_PER_MODULE = process.env.TRIALS_PER_MODULE || 5;
  const BASIC_ITERATIONS_NUMBER = process.env.BASIC_ITERATIONS_NUMBER || 1e6; // 9999999
  const REPETITIONS = process.env.REPETITIONS || 10;

  for (let repIndex = 0; repIndex < REPETITIONS; ++repIndex) {
    const controlGroupBenchmarkFunction = (iterations, benchmarkTestedModule) => {
      this.iterations = iterations;
      return new Promise((resolve) => {
        const t0 = performance.now();
        const sum = benchmarkTestedModule.func.call(this);
        const t1 = performance.now();
        resolve(`time: ${(t1 - t0) / 1000}s, with sum ${sum}, for ${this.iterations} iterations`);
      });
    };

    const indexesBenchmarkFunction = (iterations, benchmarkTestedModule) => {
      this.iterations = iterations;
      return new Promise((resolve) => {
        const t0 = performance.now();
        const sum = benchmarkTestedModule["func"].call(this);
        const t1 = performance.now();
        resolve(`time: ${(t1 - t0) / 1000}s, with sum ${sum}, for ${this.iterations} iterations`);
      });
    };

    const indexesAndHEXBenchmarkFunction = (iterations, benchmarkTestedModule) => {
      this.iterations = iterations;
      return new Promise((resolve) => {
        const t0 = performance.now();
        const sum = benchmarkTestedModule["\x66\x75\x6e\x63"].call(this);
        const t1 = performance.now();
        resolve(`time: ${(t1 - t0) / 1000}s, with sum ${sum}, for ${this.iterations} iterations`);
      });
    };

    const OptimaziedArrayItemBenchmarkFunction = (iterations, benchmarkTestedModule) => {
      this.iterations = iterations;
      return new Promise((resolve) => {
        const t0 = performance.now();
        const sum = benchmarkTestedModule[0].call(this);
        const t1 = performance.now();
        resolve(`time: ${(t1 - t0) / 1000}s, with sum ${sum}, for ${this.iterations} iterations`);
      });
    };

    const EnclodedBenchmarkFunction = (iterations, benchmarkTestedModule) => {
      this.iterations = iterations;
      return new Promise((resolve) => {
        const t0 = performance.now();
        const sum =
          benchmarkTestedModule[require("crypto").createHmac("sha256", "secret").update("func").digest("hex")].call(
            this
          );
        const t1 = performance.now();
        resolve(`time: ${(t1 - t0) / 1000}s, with sum ${sum}, for ${this.iterations} iterations`);
      });
    };

    const BasedOnTimeSecretBenchmarkFunction = (iterations, benchmarkTestedModule) => {
      this.iterations = iterations;
      return new Promise((resolve) => {
        const t0 = performance.now();
        const sum =
          benchmarkTestedModule[
            require("crypto")
              .createHmac("sha256", `${Math.ceil(Date.now() / 10000)}`)
              .update("func")
              .digest("hex")
          ].call(this);
        const t1 = performance.now();
        resolve(`time: ${(t1 - t0) / 1000}s, with sum ${sum}, for ${this.iterations} iterations`);
      });
    };

    const testmodule = {
      func: () => {
        let sum = 0;
        for (let i = 1; i <= this.iterations; ++i) sum += i;
        return sum;
      },
    };

    const enclodedTestmodule = {
      [require("crypto").createHmac("sha256", "secret").update("func").digest("hex")]: () => {
        let sum = 0;
        for (let i = 1; i <= this.iterations; ++i) sum += i;
        return sum;
      },
    };

    const enclodedByTimeTestmodule = {
      [require("crypto")
        .createHmac("sha256", `${Math.ceil(Date.now() / 10000)}`)
        .update("func")
        .digest("hex")]: () => {
        let sum = 0;
        for (let i = 1; i <= this.iterations; ++i) sum += i;
        return sum;
      },
    };

    const trials = Array(TRIALS_PER_MODULE)
      .fill(0)
      .map((_, i) => BASIC_ITERATIONS_NUMBER * Math.pow(10, i + 1) - 1);

    for (const iterations of trials) {
      console.log({ method: "control group", result: await controlGroupBenchmarkFunction(iterations, testmodule) });
    }

    for (const iterations of trials) {
      console.log({ method: "array index", result: await indexesBenchmarkFunction(iterations, testmodule) });
    }

    for (const iterations of trials) {
      console.log({
        method: "array index in hex",
        result: await indexesAndHEXBenchmarkFunction(iterations, testmodule),
      });
    }

    for (const iterations of trials) {
      console.log({
        method: "module as a array",
        result: await OptimaziedArrayItemBenchmarkFunction(iterations, Object.values(testmodule)),
      });
    }

    for (const iterations of trials) {
      console.log({
        method: "encodedName",
        result: await EnclodedBenchmarkFunction(iterations, enclodedTestmodule),
      });
    }

    try {
      for (const iterations of trials) {
        console.log({
          method: "with secret based on a time but memorized",
          result: await BasedOnTimeSecretBenchmarkFunction(iterations, enclodedByTimeTestmodule),
        });
      }
    } catch (err) {
      console.error("the lifetime of the memorized module has been exceeded");
    }

    for (const iterations of trials) {
      console.log({
        method: "with secret based on a time",
        result: await BasedOnTimeSecretBenchmarkFunction(iterations, {
          [require("crypto")
            .createHmac("sha256", `${Math.ceil(Date.now() / 10000)}`)
            .update("func")
            .digest("hex")]: () => {
            let sum = 0;
            for (let i = 1; i <= this.iterations; ++i) sum += i;
            return sum;
          },
        }),
      });
    }
  }
})();
