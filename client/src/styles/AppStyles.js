export const appStyles = `
  .sidebar-open {
    transform: translateX(0);
    opacity: 1;
  }
  .sidebar-closed {
    transform: translateX(100%);
    opacity: 0;
    pointer-events: none;
  }
  .quick-actions-open {
    transform: translateX(0);
    opacity: 1;
  }
  .quick-actions-closed {
    transform: translateX(100%);
    opacity: 0;
    pointer-events: none;
  }
  .smooth-button {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .smooth-button:hover {
    transform: translateY(-1px);
  }
  @keyframes float {
    0%,
    100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
  }
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap");
` 