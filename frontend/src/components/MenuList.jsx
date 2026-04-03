// MenuList.jsx
import React from 'react';
import { useMenu } from '../hooks/useMenu';

export default function MenuList({ addToCart }) {
  const { menu, loading, error } = useMenu();
  if (loading) return <div>Loading menu...</div>;
  if (error) return <div>Error loading menu</div>;

  return (
    <div>
      {menu.map(item => (
        <div key={item.id}>
          <h3>{item.item_name} - ₹{item.price}</h3>
          <p>{item.description}</p>
          <button onClick={() => addToCart(item)}>Add to cart</button>
        </div>
      ))}
    </div>
  );
}
