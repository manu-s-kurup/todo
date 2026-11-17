# Deploying WorkLog on Linux (pm2 + nginx)

This guide sets up WorkLog on an Ubuntu 22.04 or 24.04 server. Debian works the same way.

```
Browser ──HTTPS──▶ nginx :443 (basic auth, TLS) ──▶ 127.0.0.1:3000 Node app (pm2) ──▶ PostgreSQL
```

Replace these placeholders throughout:

- `todo.example.com`: your domain. Its DNS **A record must point to the server's IP** before you run certbot.
- `STRONG_DB_PASSWORD`: a new password for the database user.

---

## 1. Install system packages

```bash
sudo apt update
sudo apt install -y git nginx postgresql apache2-utils certbot python3-certbot-nginx

# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# pm2 and log rotation
sudo npm install -g pm2
pm2 install pm2-logrotate
```

## 2. Create the database

```bash
sudo -u postgres psql <<'SQL'
CREATE USER worklog WITH PASSWORD 'STRONG_DB_PASSWORD';
CREATE DATABASE daily_todo OWNER worklog;
SQL
```

The app creates its tables automatically the first time it starts.

## 3. Get the code

```bash
sudo mkdir -p /var/www/worklog
sudo chown "$USER":"$USER" /var/www/worklog
git clone -b development https://github.com/manu-s-kurup/todo.git /var/www/worklog
cd /var/www/worklog
npm ci --omit=dev
```

If the repository is private, git asks for credentials. Use your GitHub username and a personal access token, or add a read-only deploy key to the repo.

## 4. Configure

```bash
cat > .env <<'EOF'
DATABASE_URL=postgres://worklog:STRONG_DB_PASSWORD@localhost:5432/daily_todo
PORT=3000
HOST=127.0.0.1
EOF
chmod 600 .env
```

Keep `HOST=127.0.0.1` so the app is reachable **only through nginx**.

## 5. Start with pm2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd        # copy and run the sudo command it prints, so the app starts on boot
curl http://127.0.0.1:3000/api/health   # → {"ok":true}
```

Useful commands:

| Command | What it does |
|---|---|
| `pm2 status` | Show process status |
| `pm2 logs worklog` | Follow the logs |
| `pm2 reload worklog` | Restart with no downtime |
| `pm2 monit` | Live CPU and memory view |

## 6. Configure nginx

```bash
# Login for the site. The app has no user accounts of its own, so this protects your data.
sudo htpasswd -c /etc/nginx/.htpasswd-worklog manu

sudo cp deploy/nginx/worklog.conf /etc/nginx/sites-available/worklog.conf
sudo sed -i 's/todo.example.com/YOUR.DOMAIN/g' /etc/nginx/sites-available/worklog.conf
sudo ln -s /etc/nginx/sites-available/worklog.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default     # optional: removes the nginx welcome page
sudo nginx -t && sudo systemctl reload nginx
```

## 7. Enable HTTPS

```bash
sudo certbot --nginx -d YOUR.DOMAIN --redirect
```

Certbot edits the nginx site to add TLS and an HTTP→HTTPS redirect. It also installs a timer that renews the certificate automatically. To check that renewal works:

```bash
sudo certbot renew --dry-run
```

## 8. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

Do **not** open port 3000 or 5432.

## 9. Back up the database daily

```bash
sudo mkdir -p /var/backups/worklog
sudo chown postgres:postgres /var/backups/worklog
echo '30 2 * * * postgres pg_dump -Fc daily_todo > /var/backups/worklog/daily_todo-$(date +\%F).dump && find /var/backups/worklog -name "*.dump" -mtime +14 -delete' \
  | sudo tee /etc/cron.d/worklog-backup
```

To restore a backup:

```bash
sudo -u postgres pg_restore --clean -d daily_todo /var/backups/worklog/<file>.dump
```

## Updating to a new version

```bash
cd /var/www/worklog
chmod +x deploy/update.sh    # first time only
./deploy/update.sh development
```

The script pulls the branch, runs `npm ci`, reloads pm2 and checks `/api/health`.

## Troubleshooting

| Symptom | What to check |
|---|---|
| 502 Bad Gateway | `pm2 status` and `pm2 logs worklog`. Is the app running on port 3000? |
| `Failed to initialise database` in the logs | Check `DATABASE_URL` in `.env`, then `sudo systemctl status postgresql`. |
| Certbot fails | Make sure the DNS A record points to this server and port 80 is open. |
| Browser asks for a password repeatedly | Recreate the user with `sudo htpasswd /etc/nginx/.htpasswd-worklog manu`. |
