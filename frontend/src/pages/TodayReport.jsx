import React, { useEffect, useState } from "react";
import "../styles/TodayReport.css";
import { API } from "../api/constants";
export default function TodayReport() {

  const [orders,setOrders] = useState([]);

  useEffect(()=>{

    fetch(`${API}/owner/today-report`)
      .then(res=>res.json())
      .then(setOrders)

  },[]);


  const totalRevenue = orders.reduce(
    (sum,o)=>sum + Number(o.amount || 0),
    0
  );

  return (

<div className="today-report">

<h2>Today's Report</h2>

<div className="report-summary">

<div className="report-card">
Orders Today
<h3>{orders.length}</h3>
</div>

<div className="report-card">
Total Revenue
<h3>₹ {totalRevenue.toFixed(2)}</h3>
</div>

</div>


<table className="report-table">

<thead>
<tr>
<th>ID</th>
<th>Customer</th>
<th>Items</th>
<th>Amount</th>
<th>Paid</th>
<th>Time</th>
</tr>
</thead>

<tbody>

{orders.map((o,i)=>(
<tr key={i}>

<td>{o.id}</td>

<td>{o.customer}</td>

<td>{o.items}</td>

<td>₹ {Number(o.amount).toFixed(2)}</td>

<td>{o.paid}</td>

<td>{new Date(o.time).toLocaleTimeString()}</td>

</tr>
))}

</tbody>

</table>

</div>

  );
}