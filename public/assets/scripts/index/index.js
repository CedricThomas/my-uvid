import { toaster } from "../toaster/toaster.js";

window.onload = () => {
    const button = document.getElementById("create-button");
    button.addEventListener("click", async () => {
        try {
            const response = await fetch("/create", {
                method: "POST",
            });
            if (!response.ok) {
                throw Error(response.statusText);
            }
            const body = await response.json();
            window.location.href = body.id;
        } catch (e) {
            toaster.error(e.message);
        }
    });
}