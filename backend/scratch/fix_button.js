const fs = require('fs');
const p = 'c:/Users/DELL/Downloads/fivem/digital_store/frontend/app/admin/page.js';
let c = fs.readFileSync(p, 'utf8');

const oldButtonPart = 'title="Send Notification">';
const newButtonPart = 'title="Send Notification">\n                                                   <button onClick={() => fetchUserHistory(u)} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors" title="Activity Portfolio">\n                                                       <Activity size={16}/>\n                                                   </button>';

if (c.includes(oldButtonPart)) {
    c = c.split(oldButtonPart).join(newButtonPart);
    fs.writeFileSync(p, c);
    console.log("Activity button inserted successfully.");
} else {
    console.error("Could not find the target button part.");
}
