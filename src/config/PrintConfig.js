export const PrintConfig = {
    // URL of the local print server (running on the PC connected to the printer)
    // Example: 'http://192.168.1.100:8080/print'
    serverUrl: localStorage.getItem('la-trufa-print-server-url') || 'http://localhost:8080/print',

    // Toggle to enable/disable remote printing
    useRemoteServer: localStorage.getItem('la-trufa-use-remote-print') === 'true',

    // Save settings
    saveSettings: (url, useRemote) => {
        localStorage.setItem('la-trufa-print-server-url', url);
        localStorage.setItem('la-trufa-use-remote-print', useRemote);
    }
};
