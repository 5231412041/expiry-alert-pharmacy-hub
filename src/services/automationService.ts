
// This service simulates what would normally be done on a backend server
// In a real-world application, this would be a server-side cron job or scheduled task

let automationInterval: number | null = null;

export function startAutomatedNotifications(callback: () => Promise<void>, interval: string, time: string): void {
  // Clear any existing interval
  if (automationInterval !== null) {
    window.clearInterval(automationInterval);
    automationInterval = null;
  }
  
  // Parse the scheduled time
  const [hours, minutes] = time.split(':').map(Number);
  
  // Function to check if it's time to run
  const checkAndRunIfTime = () => {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);
    
    // Get the time difference in milliseconds
    const timeDiff = Math.abs(now.getTime() - scheduledTime.getTime());
    
    // If within a 5-minute window of the scheduled time, run the task
    if (timeDiff <= 5 * 60 * 1000) {
      // Check if we already ran today
      const lastRun = localStorage.getItem('lastAutomatedNotificationRun');
      const today = new Date().toDateString();
      
      if (lastRun !== today) {
        // Run the callback function
        callback()
          .then(() => {
            console.log('Automated notifications sent successfully');
            localStorage.setItem('lastAutomatedNotificationRun', today);
          })
          .catch(error => {
            console.error('Error sending automated notifications:', error);
          });
      }
    }
  };
  
  // Set up the interval to check every minute
  automationInterval = window.setInterval(checkAndRunIfTime, 60 * 1000);
  
  // Run once when starting to check if it's already time
  checkAndRunIfTime();
  
  console.log(`Automation scheduled to run at ${time} ${interval}`);
}

export function stopAutomatedNotifications(): void {
  if (automationInterval !== null) {
    window.clearInterval(automationInterval);
    automationInterval = null;
    console.log('Automated notifications stopped');
  }
}

// Check for saved automation settings and resume if enabled
export function checkAndResumeAutomation(callback: () => Promise<void>): void {
  const enabled = localStorage.getItem('automationEnabled') === 'true';
  const interval = localStorage.getItem('automationInterval') || 'daily';
  const time = localStorage.getItem('automationTime') || '09:00';
  
  if (enabled) {
    startAutomatedNotifications(callback, interval, time);
  }
}
