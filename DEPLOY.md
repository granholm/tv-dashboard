# Deploying to Raspberry Pi

This guide assumes you have a Raspberry Pi with Raspberry Pi OS (formerly Raspbian) installed and connected to your network.

## 1. Install Node.js
If you haven't already, install Node.js (Version 18+ recommended):

```bash
# Update package list
sudo apt update

# Install Node.js (using NodeSource setup script for latest LTS)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## 2. Clone the Repository
Open a terminal on your Pi and clone the code:

```bash
git clone https://github.com/granholm/tv-dashboard.git
cd tv-dashboard
```

## 3. Install Dependencies & Build
Install all libraries and build the frontend:

```bash
# Install backend and frontend dependencies
npm install
npm install --prefix client

# Build the frontend for production
npm run build --prefix client
```

## 4. Configuration
Set up your environment variables:

```bash
cp .env.example .env
nano .env
```
- Edit `HA_BASE_URL` and `HA_ACCESS_TOKEN`.
- Set `MOCK_MODE=false`.
- Save and exit (`Ctrl+X`, `Y`, `Enter`).

## 5. (Optional) Set Static IP or Hostname
Make sure your Pi has a static IP or a known hostname (e.g., `raspberrypi.local`) so you can access it easily.

## 6. Run the Application
You can start the server manually to test:

```bash
node server.js
```
Now access it from your browser at: `http://<YOUR_PI_IP>:3000`

## 7. Run on Startup (Using PM2)
To keep the dashboard running even after a reboot, use PM2:

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the dashboard
pm2 start server.js --name tv-dashboard

# Freeze the process list for auto-resurrection
pm2 save

# Generate and run the startup script
pm2 startup
# (Copy and paste the command output by the above line)
```

## 8. Display on TV (Kiosk Mode)
If the Pi is connected directly to the TV, you can auto-launch Chromium in Kiosk mode:

1.  Edit the autostart file:
    ```bash
    sudo nano /etc/xdg/lxsession/LXDE-pi/autostart
    ```
2.  Add this line to the end:
    ```bash
    @chromium-browser --kiosk --noerrdialogs --disable-infobars --check-for-update-interval=31536000 http://localhost:3000
    ```
