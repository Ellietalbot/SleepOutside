import { checkAuth, logout, userStore } from "../js/auth.svelte.ts";
import { displayAlerts } from "../js/alerts.ts";

checkAuth()
displayAlerts();