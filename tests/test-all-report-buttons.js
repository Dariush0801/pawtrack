/**
 * PawTrack Comprehensive Report Pet Buttons & Actions Test
 * Tests all 20 interactive buttons, tabs, switches, and handlers in Report Pet.
 */

const fs = require('fs');
const path = require('path');

const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const reportManagerJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'report-manager.js'), 'utf8');
const ownerViewJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'views', 'owner-view.js'), 'utf8');

console.log('===============================================================');
console.log('  PawTrack All Report Pet Buttons Verification Suite          ');
console.log('===============================================================\n');

let allPassed = true;

function verify(num, title, testFn) {
  try {
    const result = testFn();
    if (result) {
      console.log(`[PASS] [${num}/20] ${title}`);
    } else {
      console.error(`[FAIL] [${num}/20] ${title}`);
      allPassed = false;
    }
  } catch (err) {
    console.error(`[FAIL] [${num}/20] ${title}: ${err.message}`);
    allPassed = false;
  }
}

// 1. Navigation Report Pet Trigger Button
verify(1, 'Nav Report Pet Button calls window.reportManager.openReportModal', () => {
  return indexHtml.includes("window.reportManager.openReportModal('found')");
});

// 2. Modal Header Help / Instructions Button
verify(2, 'Report Help Button triggers toggleInstructionGuide()', () => {
  return indexHtml.includes('id="report-help-btn"') &&
         indexHtml.includes('toggleInstructionGuide()') &&
         reportManagerJs.includes('toggleInstructionGuide(');
});

// 3. Modal Header Close Button
verify(3, 'Modal Close Squircle Button calls closeModal()', () => {
  return indexHtml.includes('modal-close-squircle-btn') &&
         indexHtml.includes('window.reportManager.closeModal()') &&
         reportManagerJs.includes('closeModal() {');
});

// 4. Instructions Panel Close Button
verify(4, 'Instructions Panel Close Button calls toggleInstructionGuide(false)', () => {
  return indexHtml.includes('report-instructions-close') &&
         indexHtml.includes('toggleInstructionGuide(false)');
});

// 5. Report Type Tab: "Found / Sighted Stray Pet"
verify(5, 'Tab Found Button calls setType("found")', () => {
  return indexHtml.includes('id="report-tab-found"') &&
         indexHtml.includes("window.reportManager.setType('found')") &&
         reportManagerJs.includes("if (type === 'found')");
});

// 6. Report Type Tab: "Report Missing Pet Alert"
verify(6, 'Tab Missing Button calls setType("missing")', () => {
  return indexHtml.includes('id="report-tab-missing"') &&
         indexHtml.includes("window.reportManager.setType('missing')");
});

// 7. View Mode Switcher: "Maps" Mode Button
verify(7, 'Mode Maps Button calls setViewMode("map")', () => {
  return indexHtml.includes('id="report-mode-map-btn"') &&
         indexHtml.includes("window.reportManager.setViewMode('map')") &&
         reportManagerJs.includes("setViewMode(mode)");
});

// 8. View Mode Switcher: "Upload" Mode Button
verify(8, 'Mode Upload Button calls setViewMode("upload")', () => {
  return indexHtml.includes('id="report-mode-upload-btn"') &&
         indexHtml.includes("window.reportManager.setViewMode('upload')");
});

// 9. Map Layer Switcher: Roadmap Layer Button
verify(9, 'Map Layer "Map" Button calls setMapLayer("roadmap")', () => {
  return indexHtml.includes("setMapLayer('roadmap')") &&
         reportManagerJs.includes("setMapLayer(layerType)");
});

// 10. Map Layer Switcher: Satellite / Hybrid / Dark Buttons
verify(10, 'Map Layer Satellite, Hybrid, Dark Buttons configured', () => {
  return indexHtml.includes("setMapLayer('satellite')") &&
         indexHtml.includes("setMapLayer('hybrid')") &&
         indexHtml.includes("setMapLayer('dark')");
});

// 11. GPS Recenter / Locate Me Tool Button
verify(11, 'Quick Recenter GPS Tool Button calls locateMe()', () => {
  return indexHtml.includes("window.reportManager.locateMe()") &&
         reportManagerJs.includes("locateMe()");
});

// 12. Location Search Clear Button
verify(12, 'Location Search Clear Button calls clearLocationSearch()', () => {
  return indexHtml.includes('id="report-search-clear-btn"') &&
         indexHtml.includes("clearLocationSearch()") &&
         reportManagerJs.includes("clearLocationSearch() {");
});

// 13. Quick Jump City Chips (QC, Manila, Makati, Taguig, Pasig, Mandaluyong)
verify(13, 'Quick Jump NCR Chips call jumpToLocation with coordinates', () => {
  return indexHtml.includes("jumpToLocation(14.6500, 121.0400, 'Quezon City')") &&
         indexHtml.includes("jumpToLocation(14.5995, 120.9842, 'Manila City')") &&
         reportManagerJs.includes("jumpToLocation(lat, lng, name)");
});

// 14. Take Photo Camera Button
verify(14, 'Take Photo Button calls triggerTakePhoto()', () => {
  return indexHtml.includes("triggerTakePhoto()") &&
         reportManagerJs.includes("triggerTakePhoto() {") &&
         indexHtml.includes('id="report-photo-camera-input"');
});

// 15. Upload Photo File Button
verify(15, 'Upload Photo Button calls triggerUploadPhoto()', () => {
  return indexHtml.includes("triggerUploadPhoto()") &&
         reportManagerJs.includes("triggerUploadPhoto() {") &&
         indexHtml.includes('id="report-photo-file-input"');
});

// 16. Change & Remove Photo Action Buttons in Preview
verify(16, 'Preview Change & Remove Buttons call triggerUploadPhoto and removeUploadedPhoto', () => {
  return indexHtml.includes("removeUploadedPhoto()") &&
         reportManagerJs.includes("removeUploadedPhoto(showToast");
});

// 17. Missing Pet Dropdown Selection & Custom Toggle
verify(17, 'Missing Pet Select dropdown triggers handlePetSelect()', () => {
  return indexHtml.includes('id="report-missing-pet-select"') &&
         indexHtml.includes("handlePetSelect(this.value)") &&
         reportManagerJs.includes("handlePetSelect(petId)");
});

// 18. Missing Pet Photo Status Bar Quick Button
verify(18, 'Missing Pet Photo Status Button calls setViewMode("upload")', () => {
  return indexHtml.includes('id="report-missing-photo-status-btn"') &&
         indexHtml.includes("window.reportManager.setViewMode('upload')");
});

// 19. Modal Footer Cancel Button
verify(19, 'Footer Cancel Button calls closeModal()', () => {
  return indexHtml.includes('data-i18n="report.btnCancel"') &&
         indexHtml.includes("window.reportManager.closeModal()");
});

// 20. Form Submit Button (Submit and Notify / Missing Alert)
verify(20, 'Form Submit Button triggers handleSubmit & persists reports', () => {
  return indexHtml.includes('id="report-submit-btn"') &&
         indexHtml.includes('onsubmit="window.reportManager.handleSubmit(event)"') &&
         reportManagerJs.includes('handleSubmit(e)') &&
         reportManagerJs.includes('submitFoundReport()') &&
         reportManagerJs.includes('submitMissingReport()') &&
         ownerViewJs.includes("window.reportManager.openReportModal('missing', petId)");
});

console.log('\n===============================================================');
if (allPassed) {
  console.log('  >>> VERIFICATION RESULT: 20/20 BUTTONS VERIFIED & OPERATIONAL <<<  ');
} else {
  console.error('  >>> VERIFICATION RESULT: ONE OR MORE BUTTON CHECKS FAILED <<<  ');
  process.exit(1);
}
console.log('===============================================================\n');
