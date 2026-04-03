import React, { useEffect, useState } from "react";
import "../styles/BillPage.css";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loadStripe } from "@stripe/stripe-js";
import ScrollToTopButton from "../components/ScrollToTopButton";

export default function BillPage() {
  const stripePromise = loadStripe("pk_test_51TA2YtLnPGzSFoPHffAIz6ARMLJIRVkFKYUqQZx6RF3onF82UjWIGTZ5H6Tf4tKi6K3CxeRd2KZM8RfV0oj04Xy400Gh9U4Umy");
  const tableNo = Number(localStorage.getItem("table_session"));

  const [currentBill, setCurrentBill] = useState(null);
  const [billHistory, setBillHistory] = useState([]);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paying, setPaying] = useState(false);

  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();

  /* ================= AUTH GUARD ================= */
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  

  /* ================= CURRENT BILL ================= */
  useEffect(() => {
    if (!tableNo || Number.isNaN(tableNo)) {
      setLoading(false);
      return;
    }

    setLoading(true);

    fetch(`http://127.0.0.1:5000/bills/session/${tableNo}`)
      .then(res => {
        if (!res.ok) throw new Error("Bill fetch failed");
        return res.json();
      })
      .then(data => {
        setCurrentBill(data?.items?.length ? data : null);
      })
      .catch(() => setCurrentBill(null))
      .finally(() => setLoading(false));
  }, [tableNo]);


  /* ================= BILL HISTORY ================= */
  const fetchHistory = async () => {
    if (!user?.id) return [];

    try {
      const res = await fetch(
        `http://127.0.0.1:5000/bills/history/user/${user.id}`
      );

      if (!res.ok) throw new Error("History fetch failed");

      const data = await res.json();
      setBillHistory(data || []);
      return data || [];

    } catch (err) {
      console.error("History error:", err);
      setBillHistory([]);
      return [];
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    fetchHistory();
  }, [user]);

  /* ================= INVOICE ================= */
  const openInvoice = async (sessionId) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/bills/invoice/${sessionId}`
      );

      if (!res.ok) throw new Error("Invoice fetch failed");

      const data = await res.json();
      setInvoice(data);
    } catch (err) {
      console.error("Invoice error:", err);
      alert("Unable to open invoice");
    }
  };

  if (loading) return <p className="loading">Loading bill...</p>;

  /* ================= PAY BILL ================= */
  const payBill = async (method) => {
    if (paying) return;
    setPaying(true);

    try {

      // 🔵 CASH PAYMENT (Old Logic)
      if (method === "Cash") {

        const res = await fetch(
          `http://127.0.0.1:5000/pay/session/${tableNo}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ method })
          }
        );

        if (!res.ok) throw new Error("Payment failed");

        alert("Cash Payment Successful");

        const historyData = await fetchHistory();
        if (historyData.length > 0) {
          openInvoice(historyData[0].session_id);
        }

        setCurrentBill(null);
      }

      // 🔵 CARD PAYMENT (Stripe)
      else if (method === "Card" || method === "UPI") {

      const res = await fetch(
        "http://localhost:5000/create-checkout-session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            table_no: tableNo,
            amount: currentBill.total
          })
        }
      );

      const data = await res.json();

      console.log("FULL RESPONSE:", data);   // 🔥 VERY IMPORTANT

      if (!data.url) {
        alert("Stripe URL not received. Check backend.");
        return;
      }

      window.location.href = data.url;
    }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed");
    } finally {
      setPaying(false);
    }
  };

  const printInvoice = () => {
  const invoiceContent = document.querySelector(".invoice-box").innerHTML;

  const printWindow = window.open("", "", "width=800,height=600");

  printWindow.document.write(`
    <html>
      <head>
        <title>Eatrova Invoice</title>
        <style>
          body{
            font-family: "Courier New", monospace;
            padding:20px;
          }

          h3, p{
            text-align:center;
            margin:6px 0;
          }

          .bill-row{
            display:flex;
            justify-content:space-between;
            margin:4px 0;
            font-size:16px;
          }

          .bill-row.total{
            font-weight:bold;
            font-size:18px;
          }

          hr{
            border:none;
            border-top:1px dashed #000;
            margin:10px 0;
          }

          .invoice-actions{
            display:none;
          }

          .small{
            font-size:12px;
            color:#555;
          }
        </style>
      </head>

      <body>
        ${invoiceContent}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};
  return (
    <>
      <Navbar />

      <div className="bill-page">
        {(!tableNo || Number.isNaN(tableNo)) ? (
          <p>No active table session</p>
        ) : (
          <>
            {/* CURRENT BILL */}
            {currentBill && (
              <div className="bill-card">
                <h2>🧾 Current Bill</h2>
                <span className="status unpaid">UNPAID</span>

                {currentBill.items.map((i, idx) => (
                  <div className="bill-row" key={idx}>
                    <span>{i.name || "Deleted Item"} × {i.quantity}</span>
                    <span>₹{i.subtotal}</span>
                  </div>
                ))}

                <hr />

                <div className="bill-row">
                  <span>Subtotal</span>
                  <span>₹{Number(currentBill.subtotal).toFixed(2)}</span>
                </div>

                <div className="bill-row">
                  <span>GST (5%)</span>
                  <span>₹{Number(currentBill.gst).toFixed(2)}</span>
                </div>

                <div className="bill-row">
                  <span>Service Charge (5%)</span>
                  <span>₹{Number(currentBill.service).toFixed(2)}</span>
                </div>

                <hr />

                <h3 className="bill-total">
                  Total: ₹{Number(currentBill.total).toFixed(2)}
                </h3>

                {!currentBill.paid && (
                  <>
                    <select
                      className="payment-select"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="Card">Card</option>
                    </select>

                    <button
                      className="pay-btn"
                      disabled={paying}
                      onClick={() => payBill(paymentMethod)}
                    >
                      {paying ? "Processing..." : "Pay Bill"}
                    </button>
                  </>
                )}
              </div>
            )}

            {/* PAID BILLS */}
            <h2 className="section-title">📜 Paid Bills</h2>

            {billHistory.length === 0 && (
              <p className="empty">No paid bills yet</p>
            )}

            {billHistory.map(b => (
               <div className="history-card" key={b.order_id}>
                <div>
                  <strong>Invoice #{b.session_id}</strong>
                  <p>Total: ₹{b.total}</p>
                  <small>
                    Paid on: {new Date(b.date).toLocaleString()}
                  </small>
                </div>

                <button onClick={() => openInvoice(b.session_id)}>
                  View / Print
                </button>
              </div>
            ))}

            {/* INVOICE MODAL */}
            {invoice && (
              <div className="invoice-overlay">
                <div className="invoice-box">
                  <h3 className="center">🍽️ EATROVA</h3>

                  <p className="center">
                    Invoice No: <strong>{invoice.invoice_number}</strong>
                  </p>

                  <p className="center small">
                    Date: {new Date(invoice.created_at || Date.now()).toLocaleString()}
                  </p>

                  <hr />

                  {invoice.items.map((i, idx) => (
                    <div className="bill-row" key={idx}>
                      <span>{i.name || "Deleted Item"} × {i.quantity}</span>
                      <span>₹{Number(i.subtotal).toFixed(2)}</span>
                    </div>
                  ))}

                  <hr />

                  <div className="bill-row">
                    <span>Subtotal</span>
                    <span>₹{Number(invoice.subtotal).toFixed(2)}</span>
                  </div>

                  <div className="bill-row">
                    <span>GST</span>
                    <span>₹{Number(invoice.gst).toFixed(2)}</span>
                  </div>

                  <div className="bill-row">
                    <span>Service Charge</span>
                    <span>₹{Number(invoice.service).toFixed(2)}</span>
                  </div>

                  <hr />

                  <div className="bill-row total">
                    <span>TOTAL</span>
                    <span>₹{Number(invoice.total).toFixed(2)}</span>
                  </div>

                  <p className="center small">
                    Paid via: <strong>{invoice.payment_method}</strong>
                  </p>

                  <hr />

                  <p className="center small">Thank you for dining with us ❤️</p>
                  <p className="center small">Visit Again — EATROVA Restaurant</p>

                  <div className="invoice-actions">
                    <button
                      onClick={() => {
                        printInvoice();
                        setTimeout(() => setInvoice(null), 500);
                      }}
                    >
                      🖨️ Print
                    </button>

                    <button
                      className="secondary"
                      onClick={() => setInvoice(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <ScrollToTopButton />
    </>
  );
}