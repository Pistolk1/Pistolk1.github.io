// DriveLibrary.js

const DriveLibrary = (function () {
    let drive = { files: [], settings: {} };

    return {
        initialize: function (initialDrive) {
            drive = initialDrive;
        },
        getFiles: function () {
            return drive.files;
        },
        readFile: function (index) {
            if (index < 0 || index >= drive.files.length) {
                throw new Error("File index out of bounds");
            }
            return drive.files[index];
        },
        writeFile: function (file) {
            if (!file.name || !file.content) {
                throw new Error("Invalid file object");
            }
            drive.files.push(file);
        },
        deleteFile: function (index) {
            if (index < 0 || index >= drive.files.length) {
                throw new Error("File index out of bounds");
            }
            drive.files.splice(index, 1);
        },
        saveSettings: function (settings) {
            drive.settings = settings;
        },
        getSettings: function () {
            return drive.settings;
        },
        toJSON: function () {
            return JSON.stringify(drive);
        },
    };
})();
