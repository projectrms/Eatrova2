import React from "react";
import { Link } from "react-router-dom";
import "../styles/FloatingCartButton.css";

export default function FloatingCartButton() {
  return (
    <Link to="/cart" className="floating-cart-btn">
      🛒 View Cart
    </Link>
  );
}
/*✅ 🔥 PROFESSIONAL OWNER DASHBOARD – NEXT FEATURES TO ADD
1️⃣ Real-Time Live Activity Feed (EVENT LOG)

Shows every important system activity in real time:

“Order #23 created (Table 5)”

“Chef marked order #23 preparing”

“Order #23 → ready”

“Waiter served order #23”

“Owner blocked order #42”

“Menu item ‘Burger’ disabled”

Why?
Owners see everything happening inside the restaurant like CCTV but for orders.

2️⃣ Advanced Filters for Orders

Add top filters:

Status filter → pending / preparing / ready / completed / cancelled

Table filter

Customer filter

Date filter (today, yesterday, last 7 days)

Search by Order ID

These appear above the orders table.

3️⃣ Order Analytics Cards

Add 4 cards at the top:

Today Revenue

Today Total Orders

Pending Orders

Cancelled Orders

These change in real time (via Socket).

4️⃣ Staff Analytics

Add card view for each staff type:

Total Managers

Total Chefs

Total Waiters

Active / Inactive Staff Count

Add performance indicators:

Chef speed rating (average time from preparing → ready)

Waiter serving speed (ready → completed)

5️⃣ Table Occupancy Map (Live)

Represent restaurant tables visually:

🟢 Table 1 – Free
🔴 Table 2 – Occupied (Order #54)
🟡 Table 5 – Waiting for bill


This gives owner a live view of restaurant load.

6️⃣ Heatmap Analytics (Advanced UI)

Show weekly heatmap like:

Time	Orders
12 PM	████████
1 PM	█████████████████
2 PM	███

This shows rush hours visually.

7️⃣ Staff Workload Monitor

Shows which chef or waiter is overloaded:

Chef Ram → 12 orders

Chef Rakesh → 3 orders

Waiter A → Delivering 4 orders

Waiter B → Delivering 1 order

Helps balance work.

8️⃣ Inventory Module (Highly Recommended)

Add:

Stock items (Rice, Wheat, Cheese, etc.)

Quantity

Automatic reduction when order contains item

Low stock alert to owner

Out-of-stock auto disable menu item

9️⃣ Expense Manager

Let owner add expenses:

Vegetables: ₹4,200

Staff salary: ₹35,000

Electricity: ₹6,000

Then show:

Profit = Revenue – Expense

🔟 Customer Analytics

Add:

Most frequent customer

Highest paying customer

Customers who visited today

Customers with unpaid bills

Customer purchase history chart

1️⃣1️⃣ Live Kitchen Load

Owner sees live kitchen orders grouped by chef.

Chef Rahul (5 orders)
Chef Amit (1 order)

1️⃣2️⃣ Recommended Smart Features

These increase professionalism:

✔ Owner Notifications

Popup alerts such as:

“Chef inactive”

“Menu item not available”

“Customer order delayed (10+ mins)”

✔ Automatic Order Delay Detection

If order is not updated for 10 minutes, highlight it:

⚠ DELAYED — Order #44 (Table 3)

✔ Auto Logout After Idle Time

Professional systems use this for security.

*/