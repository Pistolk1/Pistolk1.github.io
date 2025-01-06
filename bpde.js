let drive = { files: [], settings: {} };
let selectedFileIndex = [];

document.getElementById('fileUpload').addEventListener('change', handleFileUpload);
document.getElementById('loadDrive').addEventListener('change', loadDrive);
document.getElementById('saveFileBtn').addEventListener('click', saveToDrive);
document.getElementById('app-launcher').addEventListener('click', openFileExplorer);
document.getElementById('saveTextFileBtn').addEventListener('click', saveTextFile);
document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
document.getElementById('backgroundColor').addEventListener('input', updateBackgroundColor);
document.getElementById('backgroundImage').addEventListener('change', handleBackgroundImageUpload);
document.getElementById('darkMode').addEventListener('change', toggleDarkMode);
document.getElementById('openSettingsBtn').addEventListener('click', openSettings);

loadSettings();

// Enable dragging of windows
function makeDraggable(element) {
    let offsetX, offsetY;

    element.onmousedown = function(e) {
        offsetX = e.clientX - element.getBoundingClientRect().left;
        offsetY = e.clientY - element.getBoundingClientRect().top;

        document.onmousemove = function(e) {
            element.style.left = e.clientX - offsetX + 'px';
            element.style.top = e.clientY - offsetY + 'px';
        };

        document.onmouseup = function() {
            document.onmousemove = null;
            document.onmouseup = null;
        };
    };
}

// Make all window headers draggable
document.querySelectorAll('.window-header').forEach(header => {
    makeDraggable(header.parentElement); // Pass the whole window element
});

function initResize(event) {
    const windowElement = event.target.closest('.window');
    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = parseInt(window.getComputedStyle(windowElement).width);
    const startHeight = parseInt(window.getComputedStyle(windowElement).height);

    document.onmousemove = function(e) {
        const newWidth = startWidth + e.clientX - startX;
        const newHeight = startHeight + e.clientY - startY;
        windowElement.style.width = newWidth + 'px';
        windowElement.style.height = newHeight + 'px';
    };

    document.onmouseup = function() {
        document.onmousemove = null;
        document.onmouseup = null;
    };

    event.preventDefault();
}

function handleFileUpload(event) {
    const files = event.target.files;
    for (let file of files) {
        const reader = new FileReader();
        reader.onload = function(e) {
            drive.files.push({ name: file.name, type: file.type === 'text/html' ? 'html' : 'text', content: e.target.result });
            displayFiles();
            updateDashboard();
        };
        reader.readAsText(file);
    }
}

function loadDrive(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        drive = JSON.parse(e.target.result);
        displayFiles();
        updateDashboard();
        loadSettings();
    };
    reader.readAsText(file);
}

function saveToDrive() {
    const json = JSON.stringify(drive);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'drive.json';
    a.click();
}

function openFileExplorer() {
    document.getElementById('file-explorer').style.display = 'block';
    displayFiles();
}

function displayFiles() {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';
    drive.files.forEach((file, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<input type="checkbox" class="file-checkbox" value="${index}" onchange="updateSelectedFiles()"> ${file.name}`;
        fileList.appendChild(li);
    });
}

function updateSelectedFiles() {
    selectedFileIndex = Array.from(document.querySelectorAll('.file-checkbox:checked')).map(checkbox => parseInt(checkbox.value));
}

function openFile(file) {
    if (file.type === 'text') {
        openTextEditor(file);
    } else if (file.type === 'html') {
        openProgramWindow(file);
    }
}

function openTextEditor(file) {
    document.getElementById('text-editor').value = file.content;
    document.getElementById('text-editor-window').style.display = 'block';
}

function saveTextFile() {
    const textContent = document.getElementById('text-editor').value;
    drive.files.push({ name: 'New Text File.txt', type: 'text', content: textContent });
    displayFiles();
    closeWindow('text-editor-window');
}

function openProgramWindow(file) {
    const blob = new Blob([file.content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    document.getElementById('program-frame').src = url;
    document.getElementById('program-window').style.display = 'block';

    // Expose the drive object to the program
    const script = `
        window.drive = {
            files: ${JSON.stringify(drive.files)},
            settings: ${JSON.stringify(drive.settings)},
            readFile: function(index) {
                return this.files[index];
            },
            writeFile: function(file) {
                this.files.push(file);
            },
            deleteFile: function(index) {
                this.files.splice(index, 1);
            },
            saveSettings: function() {
                // Save settings logic here
            }
        };
    `;
    document.getElementById('program-frame').contentWindow.eval(script);
}

function closeWindow(windowId) {
    document.getElementById(windowId).style.display = 'none';
}

function renameSelectedFiles() {
    selectedFileIndex.forEach(index => {
        const newName = prompt("Enter new name:", drive.files[index].name);
        if (newName) {
            drive.files[index].name = newName;
        }
    });
    displayFiles();
    updateDashboard();
}

function deleteSelectedFiles() {
    const deleteOption = confirm("Are you sure you want to delete the selected files?");
    if (deleteOption) {
        selectedFileIndex.forEach(index => {
            drive.files.splice(index, 1);
        });
        selectedFileIndex = [];
        displayFiles();
        updateDashboard();
    }
}

function downloadSelectedFiles() {
    selectedFileIndex.forEach(index => {
        const file = drive.files[index];
        const blob = new Blob([file.content], { type: file.type === 'html' ? 'text/html' : 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
    });
}

function saveSettings() {
    const bgColor = document.getElementById('backgroundColor').value;
    const darkMode = document.getElementById('darkMode').checked;
    drive.settings.backgroundColor = bgColor;
    drive.settings.darkMode = darkMode;
    saveToDrive();
    applySettings();
}

function loadSettings() {
    if (drive.settings.backgroundColor) {
        document.getElementById('backgroundColor').value = drive.settings.backgroundColor;
    }
    if (drive.settings.darkMode) {
        document.getElementById('darkMode').checked = drive.settings.darkMode;
    }
    if (drive.settings.backgroundImage) {
        document.body.style.backgroundImage = `url(${drive.settings.backgroundImage})`;
    }
    applySettings();
}

function applySettings() {
    const bgColor = drive.settings.backgroundColor || '#ffffff';
    document.body.style.backgroundColor = bgColor;
    const darkMode = drive.settings.darkMode;
    if (darkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

function handleBackgroundImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageUrl = e.target.result;
            drive.settings.backgroundImage = imageUrl; // Save background image to drive settings
            document.body.style.backgroundImage = `url(${imageUrl})`;
        };
        reader.readAsDataURL(file);
    }
}

function updateBackgroundColor() {
    const color = document.getElementById('backgroundColor').value;
    document.body.style.backgroundColor = color;
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

function openSettings() {
    document.getElementById('settings-window').style.display = 'block';
}

function updateDashboard() {
    const dashboard = document.getElementById('dashboard');
    dashboard.innerHTML = '';
    drive.files.filter(file => file.type === 'html').forEach(file => {
        const item = document.createElement('div');
        item.classList.add('dashboard-item');
        const faviconUrl = getFavicon(file.content);
        item.innerHTML = `<img src="${faviconUrl}" alt="icon"><br>${file.name}`;
        item.addEventListener('click', () => openFile(file));
        dashboard.appendChild(item);
    });
}

function getFavicon(htmlContent) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const link = doc.querySelector("link[rel*='icon']");
    return link ? link.href : 'favicon.ico';
}