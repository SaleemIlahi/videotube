import { useEffect, useState } from "react";
import S from "../styles/analytics.module.scss";
import Table from "../components/Table";
import { analytics } from "../utils/api";
import { useAsyncHandler } from "../utils/asyncHandler";
import Icons from "../components/Icons";

function Analytics() {
  const [data, setData] = useState(null);
  const [table, setTable] = useState([]);
  const [filter, setFilter] = useState(null);
  const [reports] = useAsyncHandler(async () => {
    console.log(filter);
    let query =
      filter &&
      filter?.cohort &&
      Object.entries(filter)
        .map(([k, v]) => `${k}=${v}`)
        .join("&");
    const res = await analytics(query);
    if (res.statusCode === 200) {
      setData(res.data);
      let tableData = [];
      res.data.reports.forEach((o) => {
        tableData.push([
          {
            id: "title",
            value: o.title,
            style: {
              width: "60%",
            },
          },
          {
            id: "impression",
            value: o._impressions,
            style: {
              width: "40%",
            },
          },
        ]);
      });
      // console.log(tableData);
      setTable(tableData);
    }
  });
  useEffect(() => {
    reports();
  }, [filter]);
  return (
    <div className={S.analytics_cnt}>
      <div className={S.cohorts}>
        {data?.cohorts.map((o) => (
          <div
            className={
              filter?.cohort === o.id
                ? S.cohorts_item + " " + S.active
                : S.cohorts_item
            }
            key={o.id}
            onClick={() => setFilter((f) => ({ ...f, cohort: o.id }))}
          >
            <Icons name={o.icon} />
            <span>{o.name}</span>
          </div>
        ))}
      </div>
      {table.length > 0 && (
        <Table tableHead={data.tableHead} tableBody={table}></Table>
      )}
    </div>
  );
}

export default Analytics;
