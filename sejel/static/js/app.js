// Mobile: open/close the sidebar drawer
function toggleSidebar() {
    document.body.classList.toggle('sb-open');
}

// Close the mobile drawer after navigating
function closeMobileNav() {
    document.body.classList.remove('sb-open');
}

// Desktop: collapse/expand (persisted)
function toggleCollapse() {
    const collapsed = document.body.classList.toggle('sb-collapsed');
    try { localStorage.setItem('sb-collapsed', collapsed ? '1' : '0'); } catch (e) {}
}

function switchStation(stationId) {
    window.location.href = '/?station=' + stationId;
}

document.addEventListener('DOMContentLoaded', function () {
    // restore collapsed state without a flash
    try {
        if (localStorage.getItem('sb-collapsed') === '1') {
            document.body.classList.add('sb-collapsed');
        }
    } catch (e) {}

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

document.body.addEventListener('htmx:afterSwap', function () {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});
