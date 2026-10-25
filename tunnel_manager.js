const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const URL_FILE = path.join(__dirname, 'tunnel_url.txt');
const SSH_PATH = 'C:\\Windows\\sysnative\\OpenSSH\\ssh.exe';

function startTunnel() {
  console.log('[Tunnel Manager] Initiating persistent SSH tunnel via localhost.run...');
  
  const args = [
    '-o', 'StrictHostKeyChecking=no',
    '-o', 'ServerAliveInterval=10',
    '-o', 'ServerAliveCountMax=120',
    '-o', 'ExitOnForwardFailure=yes',
    '-R', '80:localhost:3000',
    'nokey@localhost.run'
  ];

  const proc = spawn(SSH_PATH, args);

  function handleData(buf) {
    const text = buf.toString();
    console.log('[Tunnel]', text.trim());
    // Look for URL like https://xxxxx.lhr.life
    const match = text.match(/https:\/\/[a-zA-Z0-9\-\.]+\.lhr\.life/);
    if (match) {
      const url = match[0];
      console.log('====================================================');
      console.log('🚀 LIVE CLASSROOM ACCESS URL:', url);
      console.log('====================================================');
      fs.writeFileSync(URL_FILE, url, 'utf8');
    }
  }

  proc.stdout.on('data', handleData);
  proc.stderr.on('data', handleData);

  proc.on('error', (err) => {
    console.error('[Tunnel Manager] Error:', err);
  });

  proc.on('close', (code) => {
    console.log(`[Tunnel Manager] Disconnected (code: ${code}). Reconnecting in 3 seconds...`);
    setTimeout(startTunnel, 3000);
  });
}

startTunnel();
