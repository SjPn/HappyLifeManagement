export const NOTIFICATIONS_REFRESH_EVENT = "notifications:refresh";

export function requestNotificationRefresh() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(NOTIFICATIONS_REFRESH_EVENT));
  }
}
