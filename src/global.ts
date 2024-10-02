declare global {
  interface Window {
    electron: {
      ipcRenderer: any;
      send: (channel: string, data?: any) => void;
      receive: (channel: string, func: (...args: any[]) => void) => void;
    };
  }
}

export {};