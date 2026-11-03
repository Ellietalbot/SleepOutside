
interface Alert {
  _id: string;
  title: string;
  type: "warning" | "info" | "promotion";
  status: "active" | "inactive";
}

export async function displayAlerts() {
  try {
    const response = await fetch(
      `${import.meta.env.PUBLIC_SERVER_URL.replace(/\/?$/, "/")}alerts`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch alerts");
    }

    const alerts: Alert[] = await response.json();

    // Only display active alerts
    const activeAlerts = alerts.filter(
      (alert) => alert.status === "active"
    );

    if (activeAlerts.length === 0) return;

    const main = document.querySelector("main");
    if (!main) return;

    const section = document.createElement("section");
    section.classList.add("alert-list");

    activeAlerts.forEach((alert) => {
      const p = document.createElement("p");
      p.textContent = alert.title;

      // Shared styling
      p.style.padding = "10px";
      p.style.margin = "20px";

      // Colors based on alert type
      if (alert.type === "warning") {
        p.style.backgroundColor = "#FFF3CD";
        p.style.color = "#664D03";
      } else if (alert.type === "info") {
        p.style.backgroundColor = "#D1ECF1";
        p.style.color = "#055160";
      } else if (alert.type === "promotion") {
        p.style.backgroundColor = "#D1E7DD";
        p.style.color = "#0F5132";
      }

      section.appendChild(p);
    });

    main.prepend(section);
  } catch (error) {
    console.error("Unable to display alerts:", error);
  }
}
