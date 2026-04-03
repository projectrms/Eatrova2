import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    console.log("Stripe Session ID:", sessionId);

    if (!sessionId) {
      navigate("/"); // fallback
      return;
    }

    // You can call backend here if needed
    // but DO NOT navigate(sessionId)

    setTimeout(() => {
      navigate("/");  // go back to home or bills page
    }, 3000);

  }, [navigate, searchParams]);

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>✅ Payment Successful!</h2>
      <p>Redirecting...</p>
    </div>
  );
};

export default PaymentSuccess;