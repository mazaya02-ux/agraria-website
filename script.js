const SUPABASE_URL =
  "https://obgemrcgkdzqmxwpbnoy.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_uRrUUAqH9ULg7UPxscAYvQ_3rPe8A6x";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );
  function showBuyer() {

  document
    .getElementById("buyer-section")
    .classList.remove("hidden");

  document
    .getElementById("farmer-section")
    .classList.add("hidden");

  document
    .getElementById("buyer-section")
    .scrollIntoView({
      behavior: "smooth"
    });
}


function showFarmer() {

  document
    .getElementById("farmer-section")
    .classList.remove("hidden");

  document
    .getElementById("buyer-section")
    .classList.add("hidden");

  loadBuyerRequests();

  document
    .getElementById("farmer-section")
    .scrollIntoView({
      behavior: "smooth"
    });
}
document
  .getElementById("buyerForm")
  .addEventListener("submit", async function(event) {

    event.preventDefault();

    const buyerName =
      document.getElementById("buyerName").value;

    const phone =
      document.getElementById("phone").value;

    const location =
      document.getElementById("location").value;

    const commodity =
      document.getElementById("commodity").value;

    const quantity =
      document.getElementById("quantity").value;

    const quality =
      document.getElementById("quality").value;

    const neededDate =
      document.getElementById("neededDate").value;

    const price =
      document.getElementById("price").value;


    const { error } =
      await supabaseClient

        .from("buyer_requests")

        .insert({

          buyer_name: buyerName,

          phone: phone,

          location: location,

          commodity: commodity,

          quantity: quantity,

          quality: quality,

          needed_date: neededDate,

          price: price,

          status: "active",

          verified: false

        });


    if (error) {

      console.error(error);

      alert(
        "Permintaan gagal dikirim."
      );

      return;

    }


    alert(
      "Permintaan berhasil dikirim!"
    );


    document
      .getElementById("buyerForm")
      .reset();

});

async function loadBuyerRequests() {

  const board =
    document.getElementById(
      "requestBoard"
    );


  const { data, error } =
    await supabaseClient

      .from("buyer_requests")

      .select("*")

      .eq("status", "active")

      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (error) {

    board.innerHTML =
      "<p>Gagal memuat data.</p>";

    console.error(error);

    return;
  }


  if (!data.length) {

    board.innerHTML =
      "<p>Belum ada permintaan pembeli.</p>";

    return;
  }


  board.innerHTML = "";


  data.forEach(request => {

    const whatsappNumber =
      request.phone.replace(
        /^0/,
        "62"
      );


    const message =
      encodeURIComponent(
        `Halo, saya petani dari AGRARIA. Saya tertarik dengan permintaan ${request.commodity} sebanyak ${request.quantity} kg.`
      );


    const whatsappLink =
      `https://wa.me/${whatsappNumber}?text=${message}`;


    const card =
      document.createElement("div");

    card.className =
      "request-card";


    card.innerHTML = `

      <h3>
        🌾 ${request.commodity}
      </h3>

      <p>
        📦 <strong>${request.quantity} kg</strong>
      </p>

      <p>
        📍 ${request.location}
      </p>

      <p>
        ⭐ ${request.quality || "Sesuai kesepakatan"}
      </p>

      <p>
        📅 ${request.needed_date}
      </p>

      <p>
        💰 ${
          request.price
          ? "Rp " +
            Number(request.price)
              .toLocaleString("id-ID")
            + " / kg"
          : "Harga dapat dinegosiasikan"
        }
      </p>

      <p>
        👤 ${request.buyer_name}
      </p>

      ${
        request.verified
        ? `
          <p class="verified">
            ✓ Verified Buyer
          </p>
        `
        : ""
      }

      <a
        class="whatsapp"
        href="${whatsappLink}"
        target="_blank"
      >
        💬 Hubungi via WhatsApp
      </a>

    `;


    board.appendChild(card);

  });

}

supabaseClient

  .channel("buyer-request-realtime")

  .on(

    "postgres_changes",

    {
      event: "*",

      schema: "public",

      table: "buyer_requests"
    },

    payload => {

      loadBuyerRequests();

    }

  )

  .subscribe();
  window.addEventListener("DOMContentLoaded", () => {
  const hash = window.location.hash;

  if (hash === "#buyer") {
    showBuyer();
  }

  if (hash === "#farmer") {
    showFarmer();
  }
});