document.addEventListener("DOMContentLoaded", () => {
  const langSelect = document.getElementById("lang");
  const accessMessage = document.getElementById("accessMessage");
  const payBtn = document.getElementById("payBtn");

  const isPremium = localStorage.getItem("premiumAccess") === "true";

  langSelect.addEventListener("change", () => {
    const selected = langSelect.value;

    if (["js", "c"].includes(selected)) {
      accessMessage.textContent = `✅ You can execute ${selected.toUpperCase()} code for free.`;
      payBtn.style.display = "none";
    } else if (isPremium) {
      accessMessage.textContent = `✅ You have access to ${selected.toUpperCase()} as a premium user.`;
      payBtn.style.display = "none";
    } else {
      accessMessage.textContent = `🔒 ${selected.toUpperCase()} is a premium language. Please unlock to use.`;
      payBtn.style.display = "inline-block";
    }
  });

  payBtn.onclick = async () => {
    try {
      const res = await fetch("http://localhost:5001/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ amount: 99 }) // ₹99 for premium access
      });

      const data = await res.json();

      const options = {
        key: data.key_id,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Code Executor",
        description: "Premium Language Access",
        order_id: data.order.id,
        handler: function (response) {
          // verify signature
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
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              alert("✅ Payment successful! Premium unlocked.");
              localStorage.setItem("premiumAccess", "true");
              langSelect.dispatchEvent(new Event("change")); // refresh access
            } else {
              alert("❌ Payment verification failed.");
            }
          });
        },
        prefill: {
          name: "Student",
          email: "you@example.com",
          contact: "9000090000"
        },
        theme: {
          color: "#3399cc"
        }
      };

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  };

  // Trigger default check
  langSelect.dispatchEvent(new Event("change"));
});
