#!/bin/sh
set -e

# Default runtime user/group IDs. Override these to match the host owner of the
# bind-mounted config/ directory so the gateway can both read and write it.
PUID=${PUID:-1000}
PGID=${PGID:-1000}

# If running as root, ensure the data directories are owned by the runtime user
# and then drop privileges. This makes bind-mounted host volumes writable
# without forcing the host owner to match the image's build-time UID.
if [ "$(id -u)" = "0" ]; then
	if ! getent group umans-gateway >/dev/null 2>&1; then
		addgroup -g "$PGID" umans-gateway
	fi
	if ! getent passwd umans-gateway >/dev/null 2>&1; then
		adduser -u "$PUID" -G umans-gateway -D -H -s /sbin/nologin umans-gateway
	fi
	chown -R "${PUID}:${PGID}" /data
	exec su-exec umans-gateway /usr/local/bin/umans-gateway "$@"
fi

exec /usr/local/bin/umans-gateway "$@"
