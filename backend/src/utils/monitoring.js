import client from "prom-client";

// Prometheus Metric
const clientMetrics = client.collectDefaultMetrics;
clientMetrics({ register: client.register });
const requestResponseTime = new client.Histogram({
  name: "http_express_req_res_time",
  help: "This tells how much time is taken by req and res",
  labelNames: ["method", "route", "status_code"],
  buckets: [1, 50, 100, 200, 400, 500, 800, 1000, 2000],
});

const totalRequestCount = new client.Counter({
  name: "total_req",
  help: "Total request Count",
});

const monitoring = (req, res, time) => {
  totalRequestCount.inc();
  requestResponseTime
    .labels({
      method: req.method,
      route: req.url,
      status_code: res.statusCode,
    })
    .observe(time);
};

export { monitoring };
