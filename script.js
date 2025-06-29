document.addEventListener("DOMContentLoaded", () => {
  const payBtn = document.getElementById("payBtn");

  payBtn.onclick = async function () {
    try {
      const res = await fetch("http://localhost:5001/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ amount: 500 })
      });

      const data = await res.json();

      const options = {
        key: data.key_id, 
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Test Shop",
        description: "Demo Payment",
        order_id: data.order.id,
        handler: function (response) {
          fetch("http://localhost:5001/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            })
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.success) {
                alert("Payment Verified!");
              } else {
                alert("Verification Failed!");
              }
            });
        },
        prefill: {
          name: "Student",
          email: "student@example.com",
          contact: "9000090000"
        },
        theme: {
          color: "#3399cc"
        }
      };

      const razorpay = new Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment init failed:", error);
    }
  };
});
