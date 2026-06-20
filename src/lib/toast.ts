/**
 * Global Toast Dispatcher
 * Allows dispatching notifications from anywhere in the codebase (React or stateless helper files).
 */

export function toastSuccess(message: string) {
  window.dispatchEvent(
    new CustomEvent('app_toast', {
      detail: { message, type: 'success' },
    })
  );
}

export function toastError(message: string) {
  window.dispatchEvent(
    new CustomEvent('app_toast', {
      detail: { message, type: 'error' },
    })
  );
}
