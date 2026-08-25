function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    sidebar.classList.toggle('-translate-x-full');
    if (overlay) {
        overlay.remove();
    } else {
        const div = document.createElement('div');
        div.className = 'sidebar-overlay';
        div.onclick = toggleSidebar;
        document.body.appendChild(div);
    }
}

function switchStation(stationId) {
    window.location.href = '/?station=' + stationId;
}

document.addEventListener('DOMContentLoaded', function() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

document.body.addEventListener('htmx:afterSwap', function() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});
