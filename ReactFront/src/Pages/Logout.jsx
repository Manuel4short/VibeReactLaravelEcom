import { usePopup } from "../Contexts/PopupContext"; // import at top

const { showPopup } = usePopup();

async function logout() {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    if (!res.ok) throw new Error("Logout failed");
    showPopup("Logged out successfully"); // ✅ add success popup here
  } catch (err) {
    console.error(err);
    // optionally show a message
    showPopup(err.message || "Logout failed", "error");
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user-info");
  }
}
