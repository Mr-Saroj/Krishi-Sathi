/**
 * Dashboard Layout Utilities
 */

export const SIDEBAR = {
  OPEN_MARGIN: "lg:ml-72",
  CLOSED_MARGIN: "lg:ml-0",
};

export const LAYOUT_GLOBAL_CSS = `
  * {
    box-sizing: border-box;
  }

  .material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }

  .spring {
    transition-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .shadow-soft {
    box-shadow: 0px 4px 20px rgba(0,0,0,0.03);
  }

  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: #e0e3e5;
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #cbd5e1;
  }
`;

export const getRootContainerClasses = () => {
  return "flex min-h-screen w-full min-w-0 overflow-hidden bg-background text-on-surface";
};

export const getContentMarginClasses = (sidebarOpen) => {
  return `
    relative flex w-0 min-w-0 flex-1 flex-col
    transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
    ${sidebarOpen ? SIDEBAR.OPEN_MARGIN : SIDEBAR.CLOSED_MARGIN}
  `;
};

export const getMainContentClasses = () => {
  return `
    box-border flex-1 w-full min-w-0 max-w-full
    overflow-x-hidden overflow-y-auto
    px-4 py-5
    sm:px-5 sm:py-6
    lg:px-6 lg:py-7
    xl:px-7
  `;
};