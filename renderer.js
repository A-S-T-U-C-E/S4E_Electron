const remote = require('@electron/remote');
const win = remote.getCurrentWindow();

document.onreadystatechange = (event) => {
    if (document.readyState == "complete") {
        handleWindowControls();
    }
};
window.onbeforeunload = (event) => {
    win.removeAllListeners();
}
function handleWindowControls() {
    document.getElementById('btn_fake_min').addEventListener("click", event => {
        win.minimize();
    });
    document.getElementById('btn_fake_max').addEventListener("click", event => {
        win.maximize();
    });
    document.getElementById('btn_fake_restore').addEventListener("click", event => {
        win.unmaximize();
    });
    document.getElementById('btn_fake_close').addEventListener("click", event => {
        win.close();
    });
    // Toggle maximise/restore buttons when maximisation/unmaximisation occurs
    toggleMaxRestoreButtons();
    win.on('maximize', toggleMaxRestoreButtons);
    win.on('unmaximize', toggleMaxRestoreButtons);

    function toggleMaxRestoreButtons() {
        if (win.isMaximized()) {
            document.getElementById('btn_fake_max').style.display = "none";
            document.getElementById('btn_fake_restore').style.display = "inline";
        } else {
            document.getElementById('btn_fake_max').style.display = "inline";
            document.getElementById('btn_fake_restore').style.display = "none";
        }
    }
}