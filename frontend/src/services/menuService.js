export async function getMenuItems() {
  const res = await fetch("http://localhost:5000/api/menu");
  if (!res.ok) throw new Error("Failed to fetch menu");
  return res.json();
}
