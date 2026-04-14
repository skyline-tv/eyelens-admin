/** Table body shimmer rows — matches .adm-skel-row / shimmer in injectStyles */
export default function AdminTableSkeleton({ rows = 8, cols = 6 }) {
  return (
    <div className="table-scroll">
      <table className="adm-table">
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c} style={{ padding: "14px 10px", verticalAlign: "middle" }}>
                  <div
                    className="adm-skel-row"
                    style={{ width: `${55 + ((r + c) % 5) * 8}%`, maxWidth: "100%" }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
