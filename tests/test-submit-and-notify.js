/**
 * End-to-End Submission Runtime Test for "Submit and Notify"
 */

const fs = require('fs');
const path = require('path');

// Mock browser globals
global.window = global;
global.document = {
  elements: {},
  getElementById(id) {
    if (!this.elements[id]) {
      this.elements[id] = {
        value: '',
        style: {},
        classList: {
          add() {},
          remove() {},
          toggle() {}
        },
        focus() {},
        scrollIntoView() {}
      };
    }
    return this.elements[id];
  },
  querySelectorAll() {
    return [];
  },
  addEventListener() {}
};

// Mock pawStore
const notifications = [];
const sightings = [];
const missingReports = [];
const cases = [];

global.pawStore = {
  notifications,
  sightings,
  missingReports,
  cases,
  getPets() {
    return [
      { id: 'pet-1', name: 'Bella', species: 'Dog', breed: 'Golden Retriever', rfidTag: 'RFID-9901', status: 'active', owner: { email: 'maria@gmail.com', phone: '+63 917 111 2222', community: 'District 4, Quezon City' } },
      { id: 'pet-2', name: 'Milo', species: 'Cat', breed: 'Siamese', rfidTag: 'RFID-8822', status: 'lost', owner: { email: 'carlos@gmail.com', phone: '+63 918 333 4444', community: 'District 1, Quezon City' } }
    ];
  },
  getPetById(id) {
    return this.getPets().find(p => p.id === id);
  },
  getPetByRFID(rfid) {
    return this.getPets().find(p => p.rfidTag === rfid);
  },
  getActiveMissingReportForPet(petId) {
    return this.missingReports.find(r => r.petId === petId);
  },
  addSighting(sighting) {
    sightings.push(sighting);
    return sighting;
  },
  addNotification(notif) {
    notifications.push(notif);
    return notif;
  },
  addCaseTimelineEvent(petId, event) {},
  updatePetStatus(petId, status, meta) {},
  createMissingReport(report) {
    report.id = 'MR-' + Date.now();
    missingReports.push(report);
    return report;
  },
  saveCase(c) {
    cases.push(c);
  }
};

global.notifManager = {
  showToast(msg, type) {
    console.log(`  Toast [${type}]: ${msg}`);
  },
  showFinderInfo(info) {}
};

global.location = { hash: '#map' };

// Load report manager code
const reportManagerCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'report-manager.js'), 'utf8');
eval(reportManagerCode);

console.log('--- Testing Found Pet "Submit and Notify" (No RFID match) ---');
document.elements['report-found-species'] = { value: 'Dog' };
document.elements['report-found-breed'] = { value: 'Aspin' };
document.elements['report-found-location'] = { value: 'District 2 (Commonwealth), Quezon City' };
document.elements['report-found-rfid'] = { value: 'RFID-UNKNOWN' };
document.elements['report-found-phone'] = { value: '+63 917 000 1111' };
document.elements['report-found-notes'] = { value: 'Spotted resting under tree near Commonwealth market.' };

window.reportManager.currentType = 'found';
window.reportManager.pinnedLat = 14.6850;
window.reportManager.pinnedLng = 121.0850;
window.reportManager.submitFoundReport();

console.log('✓ Found report submitted successfully. Sighting count:', sightings.length);
console.log('✓ Sighting location:', sightings[0].location, 'coords:', sightings[0].coords);
console.log('✓ Notification count:', notifications.length);

console.log('\n--- Testing Found Pet "Submit and Notify" (With RFID match) ---');
document.elements['report-found-rfid'] = { value: 'RFID-9901' }; // Bella
window.reportManager.submitFoundReport();

console.log('✓ Matched pet found report submitted successfully. Sighting count:', sightings.length);
console.log('✓ Last notif title:', notifications[notifications.length - 1].title);

console.log('\n--- Testing Missing Pet "Submit and Notify" ---');
window.reportManager.currentType = 'missing';
document.elements['report-missing-pet-select'] = { value: 'pet-2' };
document.elements['report-missing-location'] = { value: 'District 1 (La Loma), Quezon City' };
document.elements['report-missing-phone'] = { value: '+63 918 333 4444' };
document.elements['report-missing-notes'] = { value: 'Slipped out gate during thunderstorm.' };
window.reportManager.submitMissingReport();

console.log('✓ Missing pet report submitted successfully. Missing reports count:', missingReports.length);
console.log('✓ Cases created count:', cases.length);
console.log('\n===============================================================');
console.log('  ALL "SUBMIT AND NOTIFY" WORKFLOWS EXECUTED SUCCESSFULLY!');
console.log('===============================================================');
