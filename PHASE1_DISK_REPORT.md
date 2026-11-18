# Phase 1 — Read-only disk investigation (sejel VPS)

**Date:** 2026-11-14  
**Scope:** Read-only investigation only. No files removed, no destructive actions taken.  
**Context:** `/` is 39G total, 34G used, 4.7G available (88%). Sejel backups are ~125M total but disk pressure is driven by other consumers.

## Commands & raw output

### 1) `du -xh / --max-depth=2 2>/dev/null | sort -rh | head -30`
```text
34G	/
9.0G	/var
8.6G	/var/lib
6.3G	/home
5.7G	/root
5.2G	/usr
5.0G	/home/frappe
2.6G	/root/.vscode-server
2.4G	/usr/lib
1.6G	/opt
1.3G	/usr/local
1.3G	/home/ibrahim
1.2G	/root/.local
941M	/opt/tiles
658M	/usr/bin
651M	/opt/geo-services
637M	/root/.shokunin
512M	/root/projects
445M	/root/.config
402M	/usr/share
281M	/usr/src
158M	/root/.duckdb
154M	/var/cache
147M	/var/backups
140M	/var/log
131M	/root/.cache
111M	/boot
104M	/usr/sbin
95M	/usr/include
84M	/usr/libexec
```

### 2) `docker system df -v` (Docker installed)
```text
Images space usage:

REPOSITORY                  TAG         IMAGE ID       CREATED        SIZE      SHARED SIZE   UNIQUE SIZE   CONTAINERS
postgres                    16-alpine   cf78e76683b9   3 months ago   420MB     9.073MB       410.6MB       1
ghcr.io/plankanban/planka   latest      125f45330853   3 months ago   591MB     9.073MB       581.6MB       1
postgres                    15          6acdbbbcb182   3 months ago   633MB     0B            632.8MB       1
mediagis/nominatim          4.4         b772911424d3   2 years ago    1.62GB    0B            1.616GB       1
osrm/osrm-backend           latest      af5d4a83fb90   5 years ago    151MB     0B            150.8MB       1

Containers space usage:

CONTAINER ID   IMAGE                              COMMAND                  LOCAL VOLUMES   SIZE      CREATED        STATUS                  NAMES
27c704dec1be   ghcr.io/plankanban/planka:latest   "docker-entrypoint.s…"   1               8.66MB    2 months ago   Up 2 months (healthy)   planka-planka-1
c3e098321a5c   postgres:16-alpine                 "docker-entrypoint.s…"   1               20.5kB    2 months ago   Up 2 months (healthy)   planka-postgres-1
43957b641a83   osrm/osrm-backend                  "osrm-routed --algor…"   0               8.19kB    3 months ago   Up 10 days              osrm
41bd81882311   mediagis/nominatim:4.4             "/app/start.sh"          1               2.78GB    3 months ago   Up 3 months             nominatim
2b42fc39afc7   postgres:15                        "docker-entrypoint.s…"   1               20.5kB    3 months ago   Up 3 months             nominatim-db

Local Volumes space usage:

VOLUME NAME        LINKS     SIZE
nominatim-pgdata   1         48MB
nominatim-data     1         0B
planka_data        1         0B
planka_db-data     1         50.43MB

Build cache usage: 0B

CACHE ID   CACHE TYPE   SIZE      CREATED   LAST USED   USAGE     SHARED
```

**`docker ps -s --no-trunc`**
```text
CONTAINER ID                                                       IMAGE                              COMMAND                                                CREATED        STATUS                  PORTS                                NAMES                             SIZE
27c704dec1be443b0194f0df7fa8e3322067c9a3fca7532c12bc2651e397f4d6   ghcr.io/plankanban/planka:latest   "docker-entrypoint.sh ./start.sh"                      2 months ago   Up 2 months (healthy)   127.0.0.1:1337->1337/tcp             planka-planka-1                   8.66MB (virtual 464MB)
c3e098321a5c1e7b1214e303a28ebcf18714851bcf245b05329f9485174d7aee   postgres:16-alpine                 "docker-entrypoint.sh postgres"                        2 months ago   Up 2 months (healthy)   5432/tcp                             planka-postgres-1                 20.5kB (virtual 303MB)
43957b641a8332b143dd06d3594b529064f27857a4f019c7ffc44bdae9742fe0   osrm/osrm-backend                  "osrm-routed --algorithm ch /data/libya-latest.osrm"   3 months ago   Up 10 days              127.0.0.1:5000->5000/tcp             osrm                              8.19kB (virtual 111MB)
41bd8188231143defda07afb2c1fea2ef5bb1224a30ac91ef4108346f5262124   mediagis/nominatim:4.4             "/app/start.sh"                                        3 months ago   Up 3 months             5432/tcp, 127.0.0.1:8080->8080/tcp   nominatim                         2.78GB (virtual 3.99GB)
2b42fc39afc77f5fe27b24ab20d30c3359df58ef9ee98219ce96ab18c03c1906   postgres:15                        "docker-entrypoint.sh postgres"                        3 months ago   Up 3 months             127.0.0.1:5433->5432/tcp             nominatim-db,nominatim/database   20.5kB (virtual 469MB)
```

### 3) `journalctl --disk-usage` / `du -sh /var/log /var/cache/apt /var/lib/docker /home /root /tmp`
```text
Archived and active journals take up 88.0M in the file system.
---
140M	/var/log
137M	/var/cache/apt
5.1G	/var/lib/docker
6.3G	/home
5.7G	/root
14M	/tmp
```

### 4) Containerd / Docker / swap / key file breakdowns

**`du -sh /var/lib/docker/*`**
```text
5.0G	/var/lib/docker/rootfs
95M	/var/lib/docker/volumes
2.0M	/var/lib/docker/containers
404K	/var/lib/docker/buildkit
84K	/var/lib/docker/network
8.0K	/var/lib/docker/tmp
8.0K	/var/lib/docker/plugins
4.0K	/var/lib/docker/swarm
4.0K	/var/lib/docker/runtimes
4.0K	/var/lib/docker/engine-id
```

**`du -sh /var/lib/containerd/*`**
```text
5.0G	/var/lib/containerd/io.containerd.snapshotter.v1.overlayfs
816M	/var/lib/containerd/io.containerd.content.v1.content
1.8M	/var/lib/containerd/io.containerd.metadata.v1.bolt
28K	/var/lib/containerd/io.containerd.runtime.v2.task
8.0K	/var/lib/containerd/io.containerd.snapshotter.v1.native
8.0K	/var/lib/containerd/io.containerd.grpc.v1.introspection
4.0K	/var/lib/containerd/tmpmounts
4.0K	/var/lib/containerd/io.containerd.snapshotter.v1.erofs
4.0K	/var/lib/containerd/io.containerd.snapshotter.v1.btrfs
4.0K	/var/lib/containerd/io.containerd.snapshotter.v1.blockfile
4.0K	/var/lib/containerd/io.containerd.sandbox.controller.v1.shim
```

**`du -sh /var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots`**
```text
5.0G	/var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots
```

**Swap**
```text
ls -lh /swapfile /swapfile2
-rw------- 1 root root 2.0G Jul  1 08:12 /swapfile
-rw------- 1 root root 4.0G Aug 19 08:53 /swapfile2

swapon --show
NAME       TYPE SIZE USED PRIO
/swapfile  file   2G 1.1G   -2
/swapfile2 file   4G   0B   -3
```

**Specific large files (`ls -lh`)**
```text
-rwxr-xr-x 1 ibrahim ibrahim 224M Oct 30 20:10 /home/ibrahim/.gemini/bin/agy
-rw------- 1 ibrahim ibrahim 325M Nov  7 03:57 /home/ibrahim/.local/share/opencode/opencode.db
-rwxr-xr-x 1 root    root    269M Nov 14 04:53 /root/.local/bin/agy
-rwxr-xr-x 1 root    root    267M Nov 12 08:51 /root/.local/bin/agy.1794632003877903228.old
-rw------- 1 root    root    612M Nov 14 06:02 /root/.local/share/opencode/opencode.db
-rw-r--r-x 1 root    root    315M Nov  3 02:43 /root/.shokunin/memory/chroma_db/b173a015-e7a1-42ad-b8e6-c1ae40bcd9d9/data_level0.bin
-rw-r--r-x 1 root    root    265M Nov 14 06:12 /root/.shokunin/memory/chroma_db/chroma.sqlite3
-r--r--r-- 1 root    root    383M Aug  5 06:55 /var/lib/containerd/io.containerd.content.v1.content/blobs/sha256/49591c29dd2581d518aec207f22ff96f64160ad2c97637a0617c68e351b9ac1d
```

**Large files on root fs (>200M, `find / -xdev -type f -size +200M`)**
```text
/swapfile
/home/ibrahim/.gemini/bin/agy
/home/ibrahim/.local/share/opencode/opencode.db
/home/ibrahim/.local/share/claude/versions/2.1.303
/opt/tiles/data/sources/natural_earth_vector.sqlite.zip
/usr/lib/node_modules/@opencode/cli/node_modules/@opencode/cli-linux-x64-baseline-musl/bin/opencode
/usr/lib/node_modules/@opencode/cli/node_modules/@opencode/cli-linux-x64-baseline/bin/opencode
/usr/lib/node_modules/@opencode/cli/node_modules/@opencode/cli-linux-x64/bin/opencode
/usr/lib/node_modules/@opencode/cli/node_modules/@opencode/cli-linux-x64-musl/bin/opencode
/usr/lib/node_modules/@opencode/cli/bin/opencode.exe
/var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/32/fs/var/lib/postgresql/14/main/base/16386/19422
/var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/32/fs/var/lib/postgresql/14/main/base/16386/19429
/var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/32/fs/var/lib/postgresql/14/main/base/16386/19427
/var/lib/containerd/io.containerd.content.v1.content/blobs/sha256/49591c29dd2581d518aec207f22ff96f64160ad2c97637a0617c68e351b9ac1d
/swapfile2
/root/.shokunin/memory/chroma_db/chroma.sqlite3
/root/.shokunin/memory/chroma_db/b173a015-e7a1-42ad-b8e6-c1ae40bcd9d9/data_level0.bin
/root/.local/share/opencode/opencode.db
/root/.local/bin/agy
/root/.local/bin/agy.1794632003877903228.old
```

### 5) Benches / IDE caches / snaps / apt / logs / core dumps / node_modules

**`/home/frappe` benches**
```text
du -sh /home/frappe/*
2.0G	/home/frappe/diwan-base
1.6G	/home/frappe/erpnext-base
1.3G	/home/frappe/bench
1.5M	/home/frappe/panel
160K	/home/frappe/diwan-p0-tenancy-2026-11-08.bundle
8.0K	/home/frappe/logs
8.0K	/home/frappe/diwan.erpnext.local
...

Breakdown:
572M	/home/frappe/erpnext-base/env
1.4G	/home/frappe/erpnext-base/apps
49M	/home/frappe/erpnext-base/sites
571M	/home/frappe/diwan-base/env
1.4G	/home/frappe/diwan-base/apps
37M	/home/frappe/diwan-base/sites
703M	/home/frappe/bench/env
517M	/home/frappe/bench/apps
23M	/home/frappe/bench/sites
6.2M	/home/frappe/bench/logs

/home/frappe/bench/archived: 780K
```

**IDE/tool caches & related**
```text
/root/.vscode-server:
2.0G	/root/.vscode-server/cli
465M	/root/.vscode-server/extensions
151M	/root/.vscode-server/data
32M	/root/.vscode-server/code-4fe60c8b1cdac1c4c174f2fb180d0d758272d713

/home/ibrahim/.antigravity-ide-server 221M
/home/ibrahim/.local/share/claude     273M
/home/frappe/erpnext-base/apps/hrms/frontend/node_modules 549M
```

**Snaps / apt / journal**
```text
1.6G	/snap
Name    Version        Rev    Tracking       Publisher    Notes
core20  20260410       2866   latest/stable  canonical**  base,disabled
core20  20260901       2922   latest/stable  canonical**  base
core22  20260410       2437   latest/stable  canonical**  base,disabled
core22  20260824       2955   latest/stable  canonical**  base
lxd     5.0.9-ea18dad  40575  5.0/stable/…   canonical**  -
snapd   2.77.1         28254  latest/stable  canonical**  snapd,disabled
snapd   2.78           28332  latest/stable  canonical**  snapd

APT cache: 40K  /var/cache/apt/archives
Journal:   88.0M archived/active in file system
```

**Checks (logs/cores/dumps/backup dirs)**
```text
Large log files in /var/log (>50M): none found
Core dump files (*.core/core*): none found as files (matches were code dirs named "core")
/var/backups/sejel: 122M (db: 9 dumps ~1.3M each + pre_restore_20261003_0921.dump 1.0M; files: 30-day tar.gz retention)
/home/frappe/bench/sites/sejel.local/private/backups: 3.3M (4 recent backup sets)
```

## Ranked table — major consumers

| Rank | Path | Size (evidence) | What it is | Safe to remove? | Risk / notes |
|---|---|---:|---|---|---|
| 1 | `/var/lib/containerd` (overlayfs snapshots ~5.0G, content ~816M) & `/var/lib/docker` (rootfs ~5.0G reported) | ~5.8G attributed to containerd dirs; Docker/containerd store for running containers | Container images/layers + writable layers for **nominatim** (2.78GB writable, `mediagis/nominatim:4.4` 1.62GB, Up 3 months), osrm, planka, postgres containers | **Needs my decision** | Removing/pruning can stop or break geo/planka services and delete container data/layers. Only safe via deliberate `docker` cleanup of unused images/containers/volumes/build cache you confirm are unneeded; do **not** prune blindly while services are in use. |
| 2 | `/swapfile2` | 4.0G (USED 0B, prio -3) | Secondary swap file, currently unused (`swapon --show`) | **Needs my decision** | Frees ~4G if removed, but reduces total swap capacity (swapfile 2G remains, 1.1G used now). Must `swapoff` before removal and update `/etc/fstab` if referenced; removing needed swap can cause OOM under memory pressure. |
| 3 | `/root/.vscode-server` (cli 2.0G, extensions 465M, data 151M, code-* 32M) | ~2.6G | VS Code Remote server binaries/extensions/cache for root sessions | **Needs my decision** (often yes for old/unused versions) | Deleting active server files can break current/future remote VS Code sessions until reinstalled; may remove extensions/settings caches. Verify no active root VS Code session and which subdirs (old CLI hashes) are unused. |
| 4 | Frappe benches: `/home/frappe/diwan-base` 2.0G, `/home/frappe/erpnext-base` 1.6G, `/home/frappe/bench` 1.3G | ~4.9G total | App code, Python envs, node_modules (e.g. hrms frontend node_modules 549M), sites data/logs | **No (generally)** / selective **needs my decision** | `erpnext-base` and `bench` host active Frappe sites (sejel runs from `/home/frappe/bench`, site `sejel.local`); `diwan-base` appears separate. Deleting envs/apps/sites breaks services. Possible selective cleanup (old build artifacts/caches/node_modules if reproducible) requires knowing what’s unused — **needs decision**. |
| 5 | `/snap` (disabled revisions: core20 rev 2866, core22 rev 2437, snapd rev 28254) | 1.6G total | Snap packages; multiple revisions kept | **Needs my decision** (likely yes for disabled old revisions) | `snap remove <name> --revision=<rev>` for disabled revisions usually safe and can reclaim space, but verify revisions not in use/needed for rollback. |
| 6 | `/root/.local/share/opencode/opencode.db` (612M), `/home/ibrahim/.local/share/opencode/opencode.db` (325M) | 937M combined | OpenCode local databases (root and ibrahim) | **Needs my decision** | App/user data; deleting loses local history/state for those users. |
| 7 | `/root/.shokunin/memory/chroma_db` (chroma.sqlite3 265M, data_level0.bin 315M) | ~580M | Shokunin memory/Chroma vector DB | **No** (likely needed) unless you confirm disposable | Removing breaks stored memory/context for that tooling. |
| 8 | `/root/.local/bin/agy` (269M) + `/root/.local/bin/agy.1794632003877903228.old` (267M), `/home/ibrahim/.gemini/bin/agy` (224M) | 760M combined | `agy` binaries (current + old/duplicate copies) | **Needs my decision** (old `.old` copy likely removable) | `/root/.local/bin/agy.1794632003877903228.old` appears to be a previous version — plausible to remove if not needed; confirm active binary/path usage before deleting current copies. |
| 9 | `/opt/tiles` (941M, incl. natural_earth_vector.sqlite.zip >200M) | 941M | Tile/geo source data | **Needs my decision** | May be required by geo services (OSRM/Nominatim/tiles stack). Removing can break map/routing features. |
| 10 | `/var/backups/sejel` 122M, `sites/sejel.local/private/backups` 3.3M | ~125M | Sejel DB/file/bench backups (subject to retention scripts) | **No** (until Phase 4 verified & you approve Phase 5) | Backups to protect/upload first; do not prune per ground rules. |
| 11 | `/var/log` 140M (journals 88M) | 140M | System/app logs, journald | **Needs my decision** (small gain) | `journalctl --vacuum-*` can free some space but removes logs; check retention/compliance needs. |
| 12 | `/var/cache/apt/archives` 40K | 40K | APT package cache | **Yes** (low risk) but minimal gain | `apt-get clean` generally safe; frees very little here. |

**Notable negatives/checks:** no large `/var/log` files >50M found; no core dump files found; `/home/frappe/bench/archived` only 780K; no obvious stale multi-GB DB dumps outside known backup locations.

## Phase 1 status
- **Read-only investigation complete** with raw evidence above. **No files removed, no destructive actions taken.**
- Biggest real consumers are **Docker/containerd (~5–6G, driven by nominatim writable layer/images/layers)** and **unused swapfile2 (4G)**; secondary gains possible from IDE caches, old snap revisions, and old/duplicate binaries — all **need your explicit decision**.

## Blocked / waiting for your approval & input (per task ground rules)

1. **Phase 1 cleanup approvals (if any):** for each item you want removed, reply with explicit approval. Before any destructive action I will list the exact command(s), exact targets, and estimated space freed, and ask again before executing.
2. **Phase 2+ cannot start yet (placeholders unresolved):** provide the actual offsite target details to proceed in order:
   - **Provider/endpoint/bucket:** `[PROVIDER, e.g. Backblaze B2] / endpoint [ENDPOINT] / bucket [BUCKET]`
   - **Credentials:** will you place them in `/root/.config/sejel-backup/env` yourself (preferred), or should I provide exact variable/instruction templates for you to fill? (I will not print secrets.)
   - **Healthcheck:** `[HEALTHCHECKS URL, or "skip for now"]`
