import React from "react";
import S from "../styles/table.module.scss";

function Table(props) {
  const { tableHead, tableBody } = props;
  return (
    <div className={S.table_cnt}>
      <table>
        <thead>
          <tr>
            {tableHead.map((o, i) => (
              <th style={o.style} key={o.id + i}>
                {o.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableBody.map((row, i) => (
            <tr key={JSON.stringify(row) + i}>
              {row.map((o, i) => (
                <td style={o.style} key={JSON.stringify(o) + i}>
                  {o.value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
