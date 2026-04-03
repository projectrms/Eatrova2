import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function DineIn() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const tableNo = params.get("t");

    if (!tableNo) {
      navigate("/invalid-table");
      return;
    }

    // Save table session
    localStorage.setItem("table_session", tableNo);

    // Redirect to menu
    navigate("/menu");
  }, [params, navigate]);

  return null;
}
//http://localhost:5173/dine-in?t=5
//http://127.0.0.1:5000/bills/session/5
