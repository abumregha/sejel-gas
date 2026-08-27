"""Context processor to inject Vue SPA asset references."""
import json
import os
from pathlib import Path
from django.conf import settings

_manifest_cache = None

def _get_manifest():
    global _manifest_cache
    if _manifest_cache is not None:
        return _manifest_cache
    manifest_path = settings.BASE_DIR / 'staticfiles' / 'vue' / '.vite' / 'manifest.json'
    if not manifest_path.exists():
        _manifest_cache = {}
        return _manifest_cache
    with open(manifest_path) as f:
        _manifest_cache = json.load(f)
    return _manifest_cache

def vue_spa_context(request):
    """Add Vue SPA CSS and JS files to template context."""
    # Only serve SPA for non-API, non-admin paths
    path = request.path
    if path.startswith('/api/') or path.startswith('/admin/') or path.startswith('/static/') or path.startswith('/media/'):
        return {}

    manifest = _get_manifest()
    if not manifest:
        return {}

    # Get the index entry
    entry = manifest.get('index.html', {})
    css_files = []
    js_files = []

    # CSS
    for css in entry.get('css', []):
        css_files.append('vue/' + css)

    # JS (the entry point)
    js = entry.get('file')
    if js:
        js_files.append('vue/' + js)

    return {
        'css_files': css_files,
        'js_files': js_files,
    }
