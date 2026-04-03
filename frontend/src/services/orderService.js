export async function getOrders() {
  const user = JSON.parse(localStorage.getItem("user"));
  const res = await fetch(`http://localhost:5000/api/orders?customer_id=${user.id}`);
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}

export async function placeOrder(cartItems, total) {
  const user = JSON.parse(localStorage.getItem("user"));
  const res = await fetch("http://localhost:5000/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer_id: user.id,
      items: cartItems,
      total_amount: total,
    }),
  });
  if (!res.ok) throw new Error("Failed to place order");
  return res.json();
}
