import { exec } from 'child_process';

console.log("🚀 Starting Auto-Push watcher!");
console.log("Any changes will be automatically committed and pushed to GitHub every 5 minutes.");

setInterval(() => {
  console.log(`[${new Date().toLocaleTimeString()}] Auto-pushing to GitHub...`);
  exec('npm run autopush', (error, stdout, stderr) => {
    if (error) {
       // If there's nothing to commit, git returns an error status. We can just ignore it or log it.
       if (!stdout.includes('nothing to commit')) {
         console.error(`Error auto-pushing: ${error.message}`);
       } else {
         console.log("Nothing to commit.");
       }
       return;
    }
    console.log(`Auto-push successful!`);
  });
}, 300000); // 5 minutes (300,000 ms)
