/**
 * PawTrack Internationalization (i18n) Module
 * Supports Bilingual English and Simple Filipino (Tagalog)
 */

(function () {
  const STORAGE_KEY = 'pawtrack_language';

  const translations = {
    en: {
      // Navigation
      'nav.brandSub': 'RFID RECOVERY',
      'nav.owner': 'Pet Owner Portal',
      'nav.shelter': 'Shelter Terminal',
      'nav.map': 'Incident Map',
      'nav.cases': 'Cases & Analytics',
      'nav.impounded': 'Impounded',
      'nav.hardware': 'Hardware Specs',
      'nav.login': 'Log In',
      'nav.notifTitle': 'Notifications',
      'nav.markAllRead': 'Mark all read',
      'notif.title': 'Notifications',
      'notif.markAllRead': 'Mark all read',
      'notif.priority': 'Priority',
      'notif.others': 'Others',
      'notif.noPriority': 'No Priority Alerts',
      'notif.noPriorityDesc': 'Official municipal shelter intake and impoundment notices will appear here.',
      'notif.noOthers': 'No Other Notifications',
      'notif.noOthersDesc': 'Good Samaritan finder reports, community sightings, and updates will appear here.',
      'notif.foundTag': 'FOUND',
      'notif.newTag': 'NEW',
      'nav.themeTitle': 'Toggle Dark/Light Theme',
      'nav.langTitle': 'Palitan ang Wika / Switch Language (English / Filipino)',

      // Owner Portal
      'owner.title': 'Pet Owner Portal',
      'owner.subtitle': 'Monitor registered pets, manage RFID tags, and receive immediate impoundment notifications.',
      'owner.guideBtnTitle': 'Owner System Guide: What to do Before, During & After',
      'owner.regBtn': 'Register Pet with RFID',
      'owner.regBtnShort': '+ Register Pet',
      'owner.heroProtectedTitle': 'PawTrack Protection Active',
      'owner.heroProtectedDesc': 'All registered pets are currently safe at home or monitored under the NCR Municipal RFID grid.',
      'owner.heroSheltersConnected': '3 Municipal Shelters Connected',
      'owner.heroImpoundTitle': 'OFFICIAL IMPOUNDMENT NOTICE',
      'owner.heroImpoundSubtitle': 'Your pet was scanned and recorded at',
      'owner.heroClaimWindow': 'Mandatory Claim Window',
      'owner.heroClaimDeadline': 'Claim Deadline:',
      'owner.heroDailyFee': 'Daily Pound Care Fee:',
      'owner.heroHoldingCell': 'Holding Cell / Batch:',
      'owner.heroRedeemBtn': 'Redeem & Claim Pet',
      'owner.heroDirectionsBtn': 'Get Shelter Directions',
      'owner.heroDismissBtn': 'Dismiss Notice',
      'owner.statTotalPets': 'Total Registered Pets',
      'owner.statActiveRfid': 'Active RFID Transponders',
      'owner.statActiveAlerts': 'Active Alerts / In Recovery',
      'owner.statSafePets': 'Safe / Reunited',
      'owner.registeredHeading': 'Registered Pets',
      'owner.noPetsTitle': 'No Registered Pets Yet',
      'owner.noPetsDesc': 'Register your pet with an RFID collar tag and microchip to enable municipal protection and real-time impoundment alerts.',
      'owner.statusSafe': 'Safe',
      'owner.statusLost': 'Missing / Lost',
      'owner.statusImpounded': 'Impounded',
      'owner.statusReunited': 'Reunited',
      'owner.btnReportLost': 'Report Lost',
      'owner.btnDigitalPass': 'Digital Pass',
      'owner.btnMarkSafe': 'Mark Safe',
      'owner.btnClaimPet': 'Claim Pet',
      'owner.btnPending': 'Pending',
      'owner.statusPending': 'Found (Pending)',
      'owner.founderFoundAlert': 'Founder Located Your Pet',
      'owner.viewFinderInfoTitle': 'View Founder Contact & Sighting Details',
      'owner.viewFullPhoto': 'View Full Photo',
      'owner.rescueContact': 'Rescue Contact:',
      'owner.lastSeen': 'Last seen:',
      'owner.unregisteredHeading': 'Unregistered Pets',
      'owner.unregisteredSub': 'Community stray sightings and public missing reports submitted through Report Pet.',
      'owner.btnFoundPet': 'Found',
      'owner.btnMissingPet': 'Missing',
      'owner.filterAll': 'All',
      'owner.filterFound': 'Found',
      'owner.filterMissing': 'Missing',
      'owner.statusFoundSighting': 'Found / Sighted',
      'owner.statusReportedMissing': 'Reported Missing',

      // Owner Guide Modal
      'guide.modalTitle': 'PawTrack Owner System Guide',
      'guide.modalSubtitle': 'Complete step-by-step instructions: What to do Before, During, and After.',
      'guide.tabAll': 'All Phases',
      'guide.tabBefore': '1. BEFORE (Protection)',
      'guide.tabDuring': '2. DURING (Impounded)',
      'guide.tabAfter': '3. AFTER (Reunion)',
      'guide.closeBtn': 'Close Guide',
      'guide.regBtn': 'Register Pet Now',
      'guide.networkText': 'PawTrack NCR Municipal Network',
      
      'guide.phase1Badge': 'PHASE 1',
      'guide.phase1Head': 'BEFORE: Preventive Protection & Registration',
      'guide.phase1Desc': 'Steps every pet owner must complete to secure their pet on the municipal RFID grid before emergencies happen.',
      'guide.phase1Step1Title': 'Register Pet & Attach RFID Tag / Link Microchip',
      'guide.phase1Step1Text': 'Add your dog or cat into the PawTrack registry with full details: breed, age, distinct color markings, medical notes, and a clear front-facing photo. Link an implanted 134.2 kHz ISO microchip or attach a PawTrack RFID collar transponder.',
      'guide.phase1Step1Tip': 'Why it matters: Unregistered pets without RFID transponders cannot be automatically identified by municipal scanning grids.',
      'guide.phase1Step2Title': 'Set Emergency Guardian Contact (Confidential)',
      'guide.phase1Step2Text': 'Provide your active Philippine mobile number (+63 9XX XXX XXXX) and primary address in your Guardian Profile.',
      'guide.phase1Step2Tip': 'Privacy Guard: Your phone number is strictly encrypted and hidden from public visitors. It is solely accessed by authorized shelter officers when scanning your pet\'s tag.',
      'guide.phase1Step3Title': 'Save / Print Your Pet\'s Digital RFID Pass',
      'guide.phase1Step3Text': 'Tap "Digital Pass" on your registered pet card. Save the digital pass badge with QR code and microchip UID to your smartphone or keep a printed physical copy with your pet\'s vaccination booklet.',
      'guide.phase1Step4Title': 'Keep Portal Notifications & SMS Active',
      'guide.phase1Step4Text': 'Ensure notifications are turned ON in Portal Settings. This enables PawTrack to dispatch instant automated SMS alerts the moment a field officer scans your pet.',

      'guide.phase2Badge': 'PHASE 2',
      'guide.phase2Head': 'DURING: When Pet is Missing or Impounded',
      'guide.phase2Desc': 'Crucial real-time actions when your pet is lost or scanned into a municipal animal care facility.',
      'guide.phase2Step1Title': 'Trigger "Report Lost" Amber Alert Immediately',
      'guide.phase2Step1Text': 'If your pet escapes or is lost, immediately tap "Report Lost" on your pet\'s card. Fill in the last seen barangay/location and date. This immediately broadcasts an amber alert on the Public Incident Map and alerts local animal welfare groups.',
      'guide.phase2Step2Title': 'Shelter Scan & Instant Automated SMS Notification',
      'guide.phase2Step2Text': 'When animal control or pound officers rescue and scan your pet\'s RFID tag, PawTrack instantly triggers an SMS and portal alert with:',
      'guide.phase2Step2Item1': 'Facility Name (e.g. Quezon City Animal Care Facility) & GPS Address',
      'guide.phase2Step2Item2': 'Official Intake Timestamp and Holding Cell ID',
      'guide.phase2Step2Item3': 'Shelter Hotline & Officer in Charge contact',
      'guide.phase2Step3Title': 'Monitor the 72-Hour Legal Window Countdown',
      'guide.phase2Step3Text': 'Philippine municipal rabies and animal welfare ordinances enforce a strict 72-hour mandatory redemption period. PawTrack displays an active countdown timer on your dashboard so you never miss the legal claiming window.',
      'guide.phase2Step4Title': 'Gather the 4 Mandatory Claiming Documents',
      'guide.doc1Title': '1. Government ID',
      'guide.doc1Sub': 'UMID / Driver\'s / Passport / PhilSys',
      'guide.doc2Title': '2. Vaccination Book',
      'guide.doc2Sub': 'Updated Anti-Rabies Card',
      'guide.doc3Title': '3. PawTrack Digital Pass',
      'guide.doc3Sub': 'QR Code or RFID Tag UID',
      'guide.doc4Title': '4. Redemption Fee',
      'guide.doc4Sub': 'Official Receipt (OR) from Pound',

      'guide.phase3Badge': 'PHASE 3',
      'guide.phase3Head': 'AFTER: Safe Claiming, Reunion & Follow-up',
      'guide.phase3Desc': 'Steps to redeem your pet safely, finalize official records, and prevent future incidents.',
      'guide.phase3Step1Title': 'Present Credentials at Shelter Intake Window',
      'guide.phase3Step1Text': 'Visit the designated pound during operating hours. Present your Government ID, Pet Vaccination Book, and show your PawTrack Digital Pass QR on your phone to the intake officer.',
      'guide.phase3Step2Title': 'Shelter Verification & Release Authorization',
      'guide.phase3Step2Text': 'The shelter officer scans and verifies your credentials against the system intake log, records your Official Receipt (OR) payment, and issues release clearance.',
      'guide.phase3Step3Title': 'Real-Time Status Reversion to "Reunited / Safe"',
      'guide.phase3Step3Text': 'The moment release is authorized, PawTrack automatically resolves the impoundment case, lifts public alerts on the map, and reverts your pet\'s badge to Safe / Reunited with an official timestamped audit record.',
      'guide.phase3Step4Title': 'Post-Reunion Health Check & Collar Inspection',
      'guide.phase3Step4Text': 'Inspect your pet\'s RFID collar tag for secure fit and wear. Update any recent veterinary treatments, vaccinations, or address changes in the portal to keep your pet continuously protected.',

      // Shelter Terminal
      'shelter.title': 'Municipal Animal Care & Intake Terminal',
      'shelter.subtitle': 'RFID collar transponder scanning, verified shelter intake, and automated owner alerts.',
      'shelter.scannerTitle': 'Live RFID Transponder Intake Scanner',
      'shelter.scannerSub': 'Hold an RFID collar tag to the scanner or select a test tag to view registry data and trigger notifications.',
      'shelter.scanBtn': 'Simulate RFID Tag Scan',
      'shelter.impoundedHeading': 'Active Impounded Pets',
      'shelter.holdingActive': 'Holding Period Active',
      'shelter.processIntake': 'Process Intake',
      'shelter.releasePet': 'Authorize Release',

      // Incident Map
      'map.title': 'Community Pet Incident & Stray Sighting Radar',
      'map.subtitle': 'Real-time geospatial map tracking missing pets, shelter impoundments, and citizen stray reports.',
      'map.filterAll': 'All Incidents',
      'map.filterLost': 'Missing Pets',
      'map.filterImpounded': 'Impounded',
      'map.filterSightings': 'Community Sightings',
      'map.filterReunited': 'Reunited',
      'map.reportStrayBtn': 'Report Found Stray Pet',

      // Cases View
      'cases.title': 'Pet Recovery Cases & Analytics Dashboard',
      'cases.subtitle': 'Real-time incident case lifecycle tracker, municipal hotspot analytics, and animal control decision support.',
      'cases.reportSightingBtn': 'Report Community Sighting',
      'cases.statMissing': 'Active Missing',
      'cases.statSighted': 'Community Sightings',
      'cases.statImpounded': 'Facility Impounds',
      'cases.statReunited': 'Safely Reunited',
      'cases.statRecoveryRate': 'Reunification Rate',
      'cases.hotspotTitle': 'Municipal Incident Hotspots (Decision Support)',
      'cases.hotspotBadge': 'Recorded Location Grid',
      'cases.hotspotSubtitle': 'Barangays and zones with concentrated stray sightings or missing pet incidents requiring animal control patrol deployment.',
      'cases.incidents': 'Incidents',
      'cases.avgResolution': 'Avg. Case Resolution:',
      'cases.rfidAdoption': 'RFID Transponder Adoption:',
      'cases.patrolReady': 'Municipal Patrol Teams Ready',
      'cases.activeResponse': 'Active Response Units:',
      'cases.ledgerTitle': 'Pet Recovery Case Files',
      'cases.ledgerSubtitle': 'Chronological audit trail, sighting evidence photos, and recovery lifecycle stages.',
      'cases.filterAll': 'All',
      'cases.filterMissing': 'Missing',
      'cases.filterSighted': 'Sighted',
      'cases.filterImpounded': 'Impounded',
      'cases.filterReunited': 'Reunited',
      'cases.emptyTitle': 'No Cases in this Status Category',
      'cases.emptyDesc': 'All registered recovery cases are updated in real-time across owner and municipal nodes.',
      'cases.latestActivity': 'Latest Activity',
      'cases.auditLogs': 'Audit Log',
      'cases.openDossierBtn': 'Open Dossier',
      'cases.dossierModalTitle': 'Recovery Case Dossier & Audit Log',
      'cases.dossierRfidUid': 'RFID UID:',
      'cases.dossierGuardianContact': 'Guardian Contact:',
      'cases.dossierTimelineTitle': 'Case Audit Trail & Recovery Stepper',
      'cases.dossierCloseBtn': 'Close Case Dossier',
      'cases.dossierActiveMissing': 'ACTIVE MISSING',
      'cases.dossierSighted': 'SIGHTING VERIFIED',
      'cases.dossierImpounded': 'IN SHELTER HOLDING',
      'cases.dossierReunited': 'SAFELY REUNITED',

      // Impounded View
      'impounded.title': 'Municipal Impound & 72-Hour Holding Bay',
      'impounded.subtitle': 'Real-time municipal animal shelter holding ledger, legal countdown monitor, and pet redemption gateway.',
      'impounded.terminalBtn': 'Shelter Intake Terminal',
      'impounded.statActiveTitle': 'Active Impounded Animals',
      'impounded.statActive': 'Animals in Holding Bay',
      'impounded.statClaimedTitle': 'Successfully Redeemed',
      'impounded.statClaimed': 'Reunited via RFID Verification',
      'impounded.statSheltersTitle': 'Connected Municipal Pounds',
      'impounded.statShelters': 'NCR Municipal Shelters Active',
      'impounded.facilitiesTitle': 'NCR Municipal Pound Facilities',
      'impounded.facilitiesSubtitle': 'Official LGU animal welfare & holding centers',
      'impounded.petSingular': 'Pet',
      'impounded.petPlural': 'Pets',
      'impounded.phoneLabel': 'Phone:',
      'impounded.hoursLabel': 'Hours:',
      'impounded.capacityLabel': 'Capacity:',
      'impounded.kennels': 'Kennels',
      'impounded.holdingWindow': 'Day Holding Window',
      'impounded.searchPlaceholder': 'Search by pet name, RFID UID, or shelter...',
      'impounded.filterAllFacilities': 'All Facilities',
      'impounded.emptyTitle': 'No Impounded Animals in Selected Facility',
      'impounded.emptyDesc': 'All registered pets are currently safe at home or monitored under the municipal RFID grid.',
      'impounded.badgeImpounded': 'IMPOUNDED',
      'impounded.defaultBreed': 'Companion Pet',
      'impounded.holdingWindowHeader': '72-Hour Legal Holding Window:',
      'impounded.hoursRemaining': 'Hours Remaining',
      'impounded.detailFacility': 'Facility:',
      'impounded.detailHoldingBay': 'Holding Bay:',
      'impounded.detailKennel': 'Kennel #',
      'impounded.detailOfficer': 'Intake Officer:',
      'impounded.detailDailyFee': 'Daily Pound Fee:',
      'impounded.dailyFeeRate': 'PHP 500 / day',
      'impounded.btnRedeemClaim': 'Redeem & Claim',
      'impounded.btnViewMap': 'View Facility on Map',

      // Hardware Specs (Universal Smartphone NFC & RFID)
      'hardware.title': 'Universal NFC & RFID Collar Tag Specifications',
      'hardware.subtitle': 'Review the standardized smartphone NFC collar tag, reader architecture, and municipal pet recovery integration.',
      'hardware.previewHeading': 'Standardized Collar Tag Prototype',
      'hardware.scanNfcBtn': 'Simulate Phone NFC Tap (Report Pet)',
      'hardware.scanHardwareBtn': 'Simulate Phone NFC Tap (Report Pet)',
      'hardware.nfcPhoneTitle': 'Smartphone NFC Instant Sighting',
      'hardware.nfcPhoneDesc': 'Standardized single-mold design with integrated NTAG213 NFC chip. Anyone finding the pet can simply tap their NFC-enabled smartphone against the tag to open the pet profile and report dialog instantly.',
      'hardware.archTitle': 'Hardware & Reader Architecture',
      'hardware.card1Title': '1. Dual-Frequency (13.56 MHz NFC + 134.2 kHz RFID)',
      'hardware.card1Desc': 'Encapsulated inside a sealed waterproof enclosure. Features high-frequency NTAG213 NFC for citizen phone taps and 134.2 kHz FDX-B for municipal scanner reads.',
      'hardware.card2Title': '2. Smartphone NFC Tap-to-Report (No App Needed)',
      'hardware.card2Desc': 'Works natively on Apple iOS and Android smartphones. Tapping the collar tag launches the PawTrack web portal and opens the report dialog with one touch.',
      'hardware.card3Title': '3. Standardized Impact-Resistant Enclosure',
      'hardware.card3Desc': 'Unified single-design casing fabricated with durable weather-sealed PETG, reinforced steel eyelet for collar attachment, and IP67 water resistance.',
      'hardware.card4Title': '4. Recorded Checkpoint Detection (No Battery or GPS Needed)',
      'hardware.card4Desc': 'Passively powered by the interrogating NFC/RFID field. Eliminates heavy batteries and satellite fees while ensuring instant identification during recovery.',
      'hardware.audioVerify': 'Acoustic Hardware Verification',
      'hardware.testBeeperBtn': 'Test Reader Audio Beeper',
      'hardware.tagClickTitle': 'Tap or click to simulate phone NFC collar scan',
      'hardware.scanCollarBtn': 'Simulate Phone NFC Tap',

      // Modals
      'modal.regTitle': 'Register Pet with RFID',
      'modal.regPetName': 'Pet Name *',
      'modal.regPetNamePh': 'e.g. Buddy',
      'modal.regSpecies': 'Species *',
      'modal.speciesDog': 'Dog',
      'modal.speciesCat': 'Cat',
      'modal.speciesOther': 'Other',
      'modal.regBreed': 'Breed *',
      'modal.regBreedPh': 'e.g. Labrador / Shorthair',
      'modal.regGender': 'Gender',
      'modal.genderMale': 'Male',
      'modal.genderFemale': 'Female',
      'modal.regColor': 'Color & Markings',
      'modal.regColorPh': 'e.g. Golden brown with white chest patch',
      'modal.regPhoto': 'Upload Photo',
      'modal.regPhotoPrompt': 'Click to upload pet photo or drag & drop',
      'modal.regPhotoSub': 'PNG, JPG, WEBP up to 8MB',
      'modal.regGuardianTitle': 'Guardian Emergency Rescue Contact',
      'modal.regAdminBadge': 'Admin & Pound Officers Only',
      'modal.regOwnerName': 'Guardian Full Name *',
      'modal.regOwnerPhone': 'Guardian Contact Number *',
      'modal.regOwnerAddress': 'Emergency Rescue City / Address',
      'modal.regPrivacyNote': 'Your contact number is kept confidential from other public users and is only used by municipal shelter officers to contact you when your pet is scanned.',
      'modal.regMedical': 'Medical / Vaccination / Microchip Details',
      'modal.regMedicalPh': 'Vaccine records, allergies, microchip number...',
      'modal.cancel': 'Cancel',
      'modal.saveReg': 'Save & Issue Digital Tag',

      'modal.lostTitle': 'Report Pet as Missing',
      'modal.lostLocation': 'Recorded Last Seen Location / Barangay *',
      'modal.lostLocationPh': 'e.g. Near Scout Gandia & Tomas Morato, QC',
      'modal.lostDate': 'Date & Time Last Seen',
      'modal.lostNotes': 'Additional Distinct Features & Behavior',
      'modal.lostNotesPh': 'Wearing RFID collar tag, responds to name...',
      'modal.broadcastBtn': 'Broadcast Missing Alert',

      'modal.foundTitle': 'Report Found Stray Pet',
      'modal.foundSpecies': 'Species *',
      'modal.foundBreed': 'Estimated Breed',
      'modal.foundLocation': 'Recorded Location Where Found / Spotted *',
      'modal.foundLocationPh': 'Street, Barangay, Subdivision, or City landmark',
      'modal.foundRfid': 'RFID Tag Detected (if collar has tag)',
      'modal.foundPhone': 'Finder Contact Phone',
      'modal.submitReport': 'Submit Report',

      // Report Pet Modal & Navigation
      'nav.report': 'Report Pet',
      'nav.reportTitle': 'Report Missing or Found Pet',
      'report.modalTitleFound': 'Found this pet?',
      'report.modalTitleMissing': 'Report Pet as Missing',
      'report.helpBtnTitle': 'How to report instructions & step-by-step guide',
      'report.guideFoundTitle': 'How to Report a Found Pet (Step-by-Step)',
      'report.guideMissingTitle': 'How to Broadcast a Missing Pet Alert (Step-by-Step)',
      'report.step1FoundTitle': 'Pin Sighting Location',
      'report.step1FoundDesc': 'Tap or drag the map pin to mark where you saw or secured the stray pet.',
      'report.step2FoundTitle': 'Take or Upload Photo',
      'report.step2FoundDesc': 'Switch to "Upload" to attach a clear picture for AI image matching.',
      'report.step3FoundTitle': 'Check RFID Collar Tag',
      'report.step3FoundDesc': 'If the pet has a collar or 134.2 kHz RFID tag, type the number to alert the owner.',
      'report.step4FoundTitle': 'Submit & Notify Guardian',
      'report.step4FoundDesc': 'Click "Submit and Notify" — the owner and municipal shelters receive instant alerts.',
      'report.step1MissingTitle': 'Select Registered Pet',
      'report.step1MissingDesc': 'Choose your registered pet from the list or enter pet name and description.',
      'report.step2MissingTitle': 'Pin Last Seen Location',
      'report.step2MissingDesc': 'Mark the exact street, barangay, or park where your pet was last seen.',
      'report.step3MissingTitle': 'Set Contact Phone',
      'report.step3MissingDesc': 'Provide your active mobile number so finders and animal pound officers can call you.',
      'report.step4MissingTitle': 'Broadcast Emergency Alert',
      'report.step4MissingDesc': 'Click "Broadcast Missing Alert" to post on the live Incident Map and notify all patrols.',
      'report.modalSubFound': 'Drop a pin at the spot where you found the pet, add a quick note if you\'d like, and notify the owner.',
      'report.modalSubMissing': 'Drop a pin where the pet was last seen, add details, and broadcast an emergency alert to shelters and public map.',
      'report.tabFound': 'Found / Sighted Stray Pet',
      'report.tabMissing': 'Report Missing Pet Alert',
      'report.modeMaps': 'Maps',
      'report.modeUpload': 'Upload',
      'report.photoHeader': 'Pet Photo:',
      'report.pinnedLoc': 'Pinned Location:',
      'report.mapHelper': 'Tap or drag pin to mark exact location',
      'report.searchLocPh': 'Search city, barangay, or landmark to jump...',
      'report.quickJump': 'Quick Jump:',
      'report.takePhoto': 'Take photo',
      'report.uploadPhoto': 'Upload photo',
      'report.dropPhotoText': 'Take a live photo or upload from device',
      'report.dropPhotoSub': 'High-resolution pet photo powers visual identification and AI community matching',
      'report.photoReady': 'Photo Attached',
      'report.retakePhoto': 'Change Photo',
      'report.removePhoto': 'Remove',
      'report.species': 'Animal Species *',
      'report.speciesDog': 'Dog',
      'report.speciesCat': 'Cat',
      'report.speciesOther': 'Other Pet',
      'report.breed': 'Breed / Appearance',
      'report.breedPh': 'e.g. Golden Retriever mix',
      'report.locationLandmark': 'Location Landmark / Street *',
      'report.locationLandmarkPh': 'e.g. Commonwealth Ave near Park Entrance',
      'report.rfidTag': 'Collar RFID Tag (if visible)',
      'report.rfidTagPh': 'e.g. 982.000109283',
      'report.finderPhone': 'Your Phone (Optional)',
      'report.finderPhonePh': '+63 9XX XXX XXXX',
      'report.messageOptional': 'Message (optional)',
      'report.messagePh': 'Your pet is safe with me near the park entrance.',
      'report.selectPet': 'Select Registered Pet *',
      'report.selectPetPh': '-- Select Registered Pet --',
      'report.otherPet': '+ Other / Unregistered Pet',
      'report.petNameDesc': 'Pet Name & Description *',
      'report.petNameDescPh': 'e.g. Brownie (Tricolor Beagle mix)',
      'report.lastSeenLoc': 'Last Seen Location *',
      'report.lastSeenLocPh': 'e.g. Barangay Commonwealth',
      'report.lastSeenDateTime': 'Last Seen Date & Time',
      'report.ownerPhone': 'Emergency Contact Phone *',
      'report.circumstances': 'Distinct Markings & Circumstances',
      'report.circumstancesPh': 'e.g. Wearing red collar with bell. Escaped during evening walk near park gate.',
      'report.btnSubmitFound': 'Submit and Notify',
      'report.btnMissingAlert': 'Missing Alert',
      'report.btnCancel': 'Cancel',

      // Good Samaritan Finder Modal
      'finder.modalTitle': 'Good Samaritan Located Your Pet',
      'finder.modalSub': 'Direct contact and sighting evidence provided by community finder.',
      'finder.contactHeading': 'Finder Contact Details',
      'finder.callBtn': 'Call Finder',
      'finder.viewMap': 'View on Map',

      // Footer
      'footer.copy': 'PawTrack System — Pet Recovery & Impoundment Notification System with RFID Technology.',
      'footer.status': 'NCR Municipal Transponder Grid Active',

      // Toast feedback
      'toast.langSwitched': 'Language switched to English.'
    },

    fil: {
      // Navigation
      'nav.brandSub': 'PAGHAHANAP NG ALAGA',
      'nav.owner': 'May-ari ng Alaga',
      'nav.shelter': 'Pound Terminal',
      'nav.map': 'Mapa ng mga Alaga',
      'nav.cases': 'Mga Kaso at Ulat',
      'nav.impounded': 'Impounded',
      'nav.hardware': 'RFID Specs',
      'nav.login': 'Mag-log In',
      'nav.notifTitle': 'Mga Abiso',
      'nav.markAllRead': 'Basahin lahat',
      'notif.title': 'Mga Abiso',
      'notif.markAllRead': 'Basahin lahat',
      'notif.priority': 'Priority',
      'notif.others': 'Iba Pa',
      'notif.noPriority': 'Walang Priority Alerts',
      'notif.noPriorityDesc': 'Ang mga opisyal na abiso mula sa shelter at pound ay lalabas dito.',
      'notif.noOthers': 'Walang Ibang Abiso',
      'notif.noOthersDesc': 'Ang mga ulat ng nakapulot, sightings, at balita ay lalabas dito.',
      'notif.foundTag': 'NAKITA',
      'notif.newTag': 'BAGO',
      'nav.themeTitle': 'Palitan ang Tema (Madilim / Maliwanag)',
      'nav.langTitle': 'Palitan ang Wika / Switch Language (English / Filipino)',

      // Owner Portal
      'owner.title': 'Portal ng May-ari ng Alaga',
      'owner.subtitle': 'Subaybayan ang iyong mga alaga, pamahalaan ang RFID tags, at makatanggap agad ng abiso kapag nasa pound.',
      'owner.guideBtnTitle': 'Gabay para sa May-ari: Bago, Habang, at Pagkatapos',
      'owner.regBtn': 'Magrehistro ng Alaga gamit ang RFID',
      'owner.regBtnShort': '+ Magrehistro ng Alaga',
      'owner.heroProtectedTitle': 'Aktibo ang Proteksyon ng PawTrack',
      'owner.heroProtectedDesc': 'Lahat ng iyong rehistradong alaga ay ligtas sa bahay at nakakonekta sa NCR Municipal RFID network.',
      'owner.heroSheltersConnected': '3 Silungan / Pound ang Nakakonekta',
      'owner.heroImpoundTitle': 'OPISYAL NA ABISO MULA SA POUND',
      'owner.heroImpoundSubtitle': 'Ang iyong alaga ay na-scan at nasa',
      'owner.heroClaimWindow': 'Natitirang Oras para Kunin',
      'owner.heroClaimDeadline': 'Huling Araw ng Pagtubos:',
      'owner.heroDailyFee': 'Bayad sa Pag-aalaga bawat Araw:',
      'owner.heroHoldingCell': 'Holding Cell / Kulungan:',
      'owner.heroRedeemBtn': 'Kunin / Tubusin ang Alaga',
      'owner.heroDirectionsBtn': 'Direksyon papunta sa Pound',
      'owner.heroDismissBtn': 'Isara ang Abiso',
      'owner.statTotalPets': 'Kabuuang Rehistradong Alaga',
      'owner.statActiveRfid': 'May Aktibong RFID Tag',
      'owner.statActiveAlerts': 'Nawawala / Nasa Pound',
      'owner.statSafePets': 'Ligtas / Nasa Bahay Na',
      'owner.registeredHeading': 'Mga Rehistradong Alaga',
      'owner.noPetsTitle': 'Wala Pang Rehistradong Alaga',
      'owner.noPetsDesc': 'Irehistro ang iyong alaga gamit ang RFID tag at microchip para protektado sila at agad kang maabisuhan kapag natagpuan.',
      'owner.statusSafe': 'Ligtas sa Bahay',
      'owner.statusLost': 'Nawawala / Missing',
      'owner.statusImpounded': 'Nasa Pound',
      'owner.statusReunited': 'Nasa Bahay Na',
      'owner.btnReportLost': 'I-report na Nawawala',
      'owner.btnDigitalPass': 'Digital RFID Pass',
      'owner.btnMarkSafe': 'Ligtas Na sa Bahay',
      'owner.btnClaimPet': 'Kunin sa Pound',
      'owner.btnPending': 'Pending',
      'owner.statusPending': 'Nakita (Pending)',
      'owner.founderFoundAlert': 'Nahanap ng Nakapulot ang Iyong Alaga',
      'owner.viewFinderInfoTitle': 'Tingnan ang Impormasyon ng Nakapulot at Detalye',
      'owner.viewFullPhoto': 'Tingnan ang Buong Litrato',
      'owner.rescueContact': 'Numero ng May-ari:',
      'owner.lastSeen': 'Huling nakita:',
      'owner.unregisteredHeading': 'Mga Hindi Rehistradong Alaga',
      'owner.unregisteredSub': 'Mga ulat ng napulot o nakitang gala at nawawalang alaga mula sa Report Pet.',
      'owner.btnFoundPet': 'Found',
      'owner.btnMissingPet': 'Missing',
      'owner.filterAll': 'Lahat',
      'owner.filterFound': 'Nakita',
      'owner.filterMissing': 'Nawawala',
      'owner.statusFoundSighting': 'Nakita sa Komunidad',
      'owner.statusReportedMissing': 'Naiulat na Nawawala',

      // Owner Guide Modal
      'guide.modalTitle': 'Gabay para sa May-ari ng Alaga',
      'guide.modalSubtitle': 'Madaling hakbang: Ano ang dapat gawin Bago, Habang, at Pagkatapos.',
      'guide.tabAll': 'Lahat',
      'guide.tabBefore': '1. BAGO (Proteksyon)',
      'guide.tabDuring': '2. HABANG (Nawawala)',
      'guide.tabAfter': '3. PAGKATAPOS (Pagkuha)',
      'guide.closeBtn': 'Isara ang Gabay',
      'guide.regBtn': 'Magrehistro ng Alaga Ngayon',
      'guide.networkText': 'PawTrack NCR Municipal Network',

      'guide.phase1Badge': 'HAKBANG 1',
      'guide.phase1Head': 'BAGO: Paghahanda at Pagpaparehistro',
      'guide.phase1Desc': 'Mga simpleng hakbang para masiguradong ligtas at rehistrado ang alaga bago pa man mawala.',
      'guide.phase1Step1Title': 'Irehistro ang Alaga at Ikabit ang RFID Tag / Microchip',
      'guide.phase1Step1Text': 'Ilista ang iyong aso o pusa: pangalan, lahi, edad, kulay, litrato, at ikabit ang RFID tag sa collar o i-link ang microchip.',
      'guide.phase1Step1Tip': 'Bakit mahalaga: Ang alagang walang RFID tag ay hindi agad makikilala ng animal control kapag napulot sa kalye.',
      'guide.phase1Step2Title': 'Ilagay ang Tamang Contact Number (Ligtas at Pribado)',
      'guide.phase1Step2Text': 'Siguraduhing tama ang iyong cellphone number (+63 9XX XXX XXXX) at tirahan para agad kang matawagan.',
      'guide.phase1Step2Tip': 'Proteksyon sa Privacy: Pribado ang iyong numero at tanging mga opisyal ng pound ang makakakita nito kapag na-scan ang alaga.',
      'guide.phase1Step3Title': 'I-save o I-print ang Digital RFID Pass',
      'guide.phase1Step3Text': 'Pindutin ang "Digital Pass" sa card ng alaga. I-screenshot o i-print ang QR code para may hawak kang patunay ng pagmamay-ari kahit saan.',
      'guide.phase1Step4Title': 'Panatilihing Naka-on ang Text at Notifications',
      'guide.phase1Step4Text': 'I-on ang notifications para makatanggap agad ng libreng text alert sa oras na ma-scan ang alaga sa pound.',

      'guide.phase2Badge': 'HAKBANG 2',
      'guide.phase2Head': 'HABANG: Kapag Nawawala o Nasa Pound ang Alaga',
      'guide.phase2Desc': 'Mga dapat gawin kapag nakawala ang alaga o dinala sa silungan ng munisipyo.',
      'guide.phase2Step1Title': 'I-report Agad na Nawawala',
      'guide.phase2Step1Text': 'Kapag nawala ang alaga, pindutin agad ang "I-report na Nawawala" at ilagay kung saang barangay huling nakita para lumabas ang alerto sa mapa.',
      'guide.phase2Step2Title': 'Awtomatikong Text kapag Na-scan sa Pound',
      'guide.phase2Step2Text': 'Kapag na-scan ng pound officer ang RFID tag, makakatanggap ka agad ng text kasama ang:',
      'guide.phase2Step2Item1': 'Pangalan ng Pound (hal. Quezon City Animal Care) at Eksaktong Address',
      'guide.phase2Step2Item2': 'Oras ng Pagdating at Numero ng Kulungan / Cell',
      'guide.phase2Step2Item3': 'Numero ng Telepono ng Pound at Pangalan ng Opisyal',
      'guide.phase2Step3Title': 'Bantayan ang 72-Hour (3 Araw) na Palugit',
      'guide.phase2Step3Text': 'Ayon sa batas ng lungsod, may 72 oras o 3 araw para tubusin ang alaga bago ito ipamigay o i-adopt. May live timer sa dashboard para hindi mahuli.',
      'guide.phase2Step4Title': 'Ihanda ang 4 na Kailangang Dokumento',
      'guide.doc1Title': '1. Valid Government ID',
      'guide.doc1Sub': 'Driver\'s / UMID / Passport / National ID',
      'guide.doc2Title': '2. Bakuna Card / Booklet',
      'guide.doc2Sub': 'Pinakabagong Anti-Rabies Card',
      'guide.doc3Title': '3. PawTrack Digital Pass',
      'guide.doc3Sub': 'QR Code sa Cellphone o Tag UID',
      'guide.doc4Title': '4. Bayad sa Pag-claim',
      'guide.doc4Sub': 'Official Receipt (OR) mula sa Pound',

      'guide.phase3Badge': 'HAKBANG 3',
      'guide.phase3Head': 'PAGKATAPOS: Ligtas na Pagtubos at Pag-uwi ng Alaga',
      'guide.phase3Desc': 'Mga hakbang sa pagkuha ng alaga sa pound at paano maiiwasang mawala muli.',
      'guide.phase3Step1Title': 'Pumunta sa Pound at Ipakita ang Dokumento',
      'guide.phase3Step1Text': 'Pumunta sa tamang oras sa pound. Ipakita sa opisyal ang iyong Valid ID, Bakuna Booklet, at Digital Pass sa iyong cellphone.',
      'guide.phase3Step2Title': 'Beripikasyon at Pag-apruba sa Pag-release',
      'guide.phase3Step2Text': 'Iche-check ng opisyal ang records sa system, ililista ang resibo ng bayad, at papayagan ang pag-uwi ng alaga.',
      'guide.phase3Step3Title': 'Awtomatikong Magiging "Ligtas / Reunited"',
      'guide.phase3Step3Text': 'Pagka-release, kusa nang mawawala ang nawawalang alerto sa mapa at magiging "Ligtas / Reunited" ang estado ng alaga.',
      'guide.phase3Step4Title': 'I-check ang RFID Collar at Kalusugan ng Alaga',
      'guide.phase3Step4Text': 'Suriin kung mahigpit at maayos pa ang RFID collar tag. I-update ang bakuna o address kung may pagbabago para tuloy-tuloy ang proteksyon.',

      // Shelter Terminal
      'shelter.title': 'Terminal ng Municipal Animal Care at Intake',
      'shelter.subtitle': 'Pag-scan ng RFID collar tag, opisyal na intake sa pound, at awtomatikong alerto sa may-ari.',
      'shelter.scannerTitle': 'Live Scanner ng RFID Collar at Microchip',
      'shelter.scannerSub': 'Itapat ang RFID tag o pumili ng test tag para makita ang datos ng alaga at magpadala ng alerto.',
      'shelter.scanBtn': 'Subukan ang Pag-scan ng Tag',
      'shelter.impoundedHeading': 'Mga Alagang Kasalukuyang Nasa Pound',
      'shelter.holdingActive': 'Kasalukuyang Nasa Holding Period',
      'shelter.processIntake': 'I-proseso ang Intake',
      'shelter.releasePet': 'Pahintulutan ang Pag-release',

      // Incident Map
      'map.title': 'Radar ng mga Nawawala at Nakitang Alaga sa Komunidad',
      'map.subtitle': 'Real-time na mapa para sa mga nawawalang alaga, nasa pound, at ulat ng mga nakitang gala.',
      'map.filterAll': 'Lahat',
      'map.filterLost': 'Nawawala',
      'map.filterImpounded': 'Nasa Pound',
      'map.filterSightings': 'May Nakakita',
      'map.filterReunited': 'Nabalik Na',
      'map.reportStrayBtn': '+ Mag-report ng Nakitang Alaga',

      // Cases View (Filipino)
      'cases.title': 'Mga Kaso ng Nawawalang Alaga at Ulat ng Datos',
      'cases.subtitle': 'Subaybayan ang kalagayan ng bawat nawawalang alaga, mga lugar na madalas may insidente, at tulong sa pagpapasya ng animal control.',
      'cases.reportSightingBtn': 'Iulat ang Nakitang Alaga',
      'cases.statMissing': 'Nawawala Ngayon',
      'cases.statSighted': 'Nakitang Alaga',
      'cases.statImpounded': 'Nasa Pound / Kulungan',
      'cases.statReunited': 'Ligtas na Nakauwi',
      'cases.statRecoveryRate': 'Porsyento ng Pagkakauli',
      'cases.hotspotTitle': 'Mga Lugar na Madalas May Nawawalang Alaga',
      'cases.hotspotBadge': 'Talaan ng mga Lugar',
      'cases.hotspotSubtitle': 'Mga barangay at lugar kung saan madalas may nakikitang pagala-gala o nawawalang alaga na kailangan ng ronda ng animal control.',
      'cases.incidents': 'Kaso',
      'cases.avgResolution': 'Karaniwang Tagal ng Pagresolba:',
      'cases.rfidAdoption': 'Paggamit ng RFID Tag:',
      'cases.patrolReady': 'Ronda ng Munisipyo: Handa at Aktibo',
      'cases.activeResponse': 'Mga Rumespondeng Grupo:',
      'cases.ledgerTitle': 'Talaan ng mga Kaso ng Alaga',
      'cases.ledgerSubtitle': 'Kasaysayan ng insidente, mga ebidensya ng pagkakita, at hakbang sa paghahanap.',
      'cases.filterAll': 'Lahat',
      'cases.filterMissing': 'Nawawala',
      'cases.filterSighted': 'Nakita',
      'cases.filterImpounded': 'Nasa Pound',
      'cases.filterReunited': 'Nasa Bahay Na',
      'cases.emptyTitle': 'Walang Kaso sa Kategoryang Ito',
      'cases.emptyDesc': 'Lahat ng rehistradong kaso ay awtomatikong ina-update sa buong sistema.',
      'cases.latestActivity': 'Huling Aktibidad',
      'cases.auditLogs': 'Talaan ng Kasaysayan',
      'cases.openDossierBtn': 'Buksan ang Talaan',
      'cases.dossierModalTitle': 'Buong Talaan at Ebidensya ng Kaso',
      'cases.dossierRfidUid': 'RFID Numero:',
      'cases.dossierGuardianContact': 'May-ari / Kontak:',
      'cases.dossierTimelineTitle': 'Kasaysayan at Pagsubaybay sa Alaga',
      'cases.dossierCloseBtn': 'Isara ang Talaan',
      'cases.dossierActiveMissing': 'KASALUKUYANG NAWAWALA',
      'cases.dossierSighted': 'NAKITA SA KOMUNIDAD',
      'cases.dossierImpounded': 'NASA POUND / SILUNGAN',
      'cases.dossierReunited': 'LIGTAS NA NAKAUWI',

      // Impounded View (Filipino)
      'impounded.title': 'Pasilidad ng Munisipyo para sa mga Nahuling Hayop (72-Oras na Holding Bay)',
      'impounded.subtitle': 'Real-time na talaan ng mga impounded na alaga sa pasilidad ng munisipyo, monitor ng ligal na countdown, at proseso ng pagtubos.',
      'impounded.terminalBtn': 'Terminal sa Pagtanggap ng Shelter',
      'impounded.statActiveTitle': 'Mga Aktibong Nahuling Alaga',
      'impounded.statActive': 'Mga Alagang Nasa Holding Bay',
      'impounded.statClaimedTitle': 'Matagumpay na Natubos',
      'impounded.statClaimed': 'Matagumpay na Natubos sa RFID',
      'impounded.statSheltersTitle': 'Konektadong Pound ng Munisipyo',
      'impounded.statShelters': 'Mga Aktibong Pound sa NCR',
      'impounded.facilitiesTitle': 'Mga Pasilidad ng Pound sa NCR',
      'impounded.facilitiesSubtitle': 'Opisyal na animal welfare at holding centers ng LGU',
      'impounded.petSingular': 'Alaga',
      'impounded.petPlural': 'Alaga',
      'impounded.phoneLabel': 'Telepono:',
      'impounded.hoursLabel': 'Oras:',
      'impounded.capacityLabel': 'Kapasidad:',
      'impounded.kennels': 'Kulungan',
      'impounded.holdingWindow': 'Araw na Holding Window',
      'impounded.searchPlaceholder': 'Maghanap gamit ang pangalan ng alaga, RFID UID, o shelter...',
      'impounded.filterAllFacilities': 'Lahat ng Pasilidad',
      'impounded.emptyTitle': 'Walang Impounded na Alaga sa Napiling Pasilidad',
      'impounded.emptyDesc': 'Lahat ng rehistradong alaga ay kasalukuyang ligtas sa tahanan o nababantayan sa ilalim ng RFID grid ng munisipyo.',
      'impounded.badgeImpounded': 'IMPOUNDED',
      'impounded.defaultBreed': 'Kasambahay na Alaga',
      'impounded.holdingWindowHeader': '72-Oras na Ligal na Holding Window:',
      'impounded.hoursRemaining': 'Oras ang Natitira',
      'impounded.detailFacility': 'Pasilidad:',
      'impounded.detailHoldingBay': 'Lalagyan / Bay:',
      'impounded.detailKennel': 'Kulungan #',
      'impounded.detailOfficer': 'Opisyal sa Pagtanggap:',
      'impounded.detailDailyFee': 'Arawang Bayad sa Pound:',
      'impounded.dailyFeeRate': 'PHP 500 / araw',
      'impounded.btnRedeemClaim': 'Tubusin at Kunin',
      'impounded.btnViewMap': 'Tingnan ang Pasilidad sa Mapa',

      // Hardware Specs (Universal Smartphone NFC & RFID - Filipino)
      'hardware.title': 'Impormasyon sa Universal NFC at RFID Collar Tag',
      'hardware.subtitle': 'Alamin ang tungkol sa standardized na NFC collar tag para sa smartphone, RFID system, at paano ito tumutulong sa pagbawi ng alaga.',
      'hardware.previewHeading': 'Anyo ng Standard Collar Tag',
      'hardware.scanNfcBtn': 'I-tap ang NFC ng Telepono (Mag-ulat)',
      'hardware.scanHardwareBtn': 'I-tap ang NFC ng Telepono (Mag-ulat)',
      'hardware.nfcPhoneTitle': 'Mabilisang Pag-scan Gamit ang NFC ng Telepono',
      'hardware.nfcPhoneDesc': 'Iisang standardized na disenyo na may NTAG213 NFC chip. Kahit sino na makakita sa alaga ay kailangan lang itapat ang kanilang cellphone na may NFC para agad bumukas ang profile at ulat.',
      'hardware.archTitle': 'Paano Gumagana ang NFC at RFID System',
      'hardware.card1Title': '1. Dual-Frequency (13.56 MHz NFC + 134.2 kHz RFID)',
      'hardware.card1Desc': 'Waterproof na enclosure na may NFC para sa smartphone ng kahit sinong makakakita at 134.2 kHz RFID para sa mga opisyal na scanner ng pound.',
      'hardware.card2Title': '2. Smartphone NFC Tap-to-Report (Walang Kailangang App)',
      'hardware.card2Desc': 'Gumagana agad sa iOS at Android na mga smartphone. Pagkatapat ng telepono sa tag, kusa itong magbubukas ng recovery link at report modal.',
      'hardware.card3Title': '3. Standardized at Matibay na Lagayan sa Kwelyo',
      'hardware.card3Desc': 'Iisang matibay na disenyo na hindi pinapasok ng tubig (IP67 waterproof) at may bakal na ring para hindi matanggal sa kwelyo ng alaga.',
      'hardware.card4Title': '4. Pagtukoy sa Lokasyon (Walang Baterya o GPS)',
      'hardware.card4Desc': 'Walang mabigat na baterya o buwanang bayad. Kumukuha ito ng kuryente mula sa signal ng telepono o scanner kapag itinapat.',
      'hardware.audioVerify': 'Pagsubok sa Tunog ng Scanner',
      'hardware.testBeeperBtn': 'Subukan ang Tunog ng Beeper',
      'hardware.tagClickTitle': 'Pindutin para subukan ang phone NFC scan',
      'hardware.scanCollarBtn': 'Subukan ang NFC Tap',

      // Modals
      'modal.regTitle': 'Magrehistro ng Alaga gamit ang RFID',
      'modal.regPetName': 'Pangalan ng Alaga *',
      'modal.regPetNamePh': 'hal. Bantay / Muning',
      'modal.regSpecies': 'Uri ng Hayop *',
      'modal.speciesDog': 'Aso',
      'modal.speciesCat': 'Pusa',
      'modal.speciesOther': 'Iba pa',
      'modal.regBreed': 'Lahi / Breed *',
      'modal.regBreedPh': 'hal. Aspin / Labrador / Puspin',
      'modal.regGender': 'Kasarian',
      'modal.genderMale': 'Lalaki',
      'modal.genderFemale': 'Babae',
      'modal.regColor': 'Kulay at Palatandaan',
      'modal.regColorPh': 'hal. Kulay kayumanggi na may puti sa dibdib',
      'modal.regPhoto': 'Mag-upload ng Litrato',
      'modal.regPhotoPrompt': 'Pindutin para mag-upload ng litrato ng alaga o i-drag dito',
      'modal.regPhotoSub': 'PNG, JPG, WEBP hanggang 8MB',
      'modal.regGuardianTitle': 'Emergency Rescue Contact ng May-ari',
      'modal.regAdminBadge': 'Para sa Pound Officers Lamang',
      'modal.regOwnerName': 'Buong Pangalan ng May-ari *',
      'modal.regOwnerPhone': 'Cellphone Number ng May-ari *',
      'modal.regOwnerAddress': 'Lungsod / Barangay / Tirahan',
      'modal.regPrivacyNote': 'Pribado ang iyong numero at tanging mga opisyal ng pound ang gagamit nito kapag na-scan ang iyong alaga.',
      'modal.regMedical': 'Bakuna, Microchip, at Medikal na Detalye',
      'modal.regMedicalPh': 'Mga bakuna, allergy, numero ng microchip...',
      'modal.cancel': 'Kanselahin',
      'modal.saveReg': 'I-save at Gumawa ng Digital Tag',

      'modal.lostTitle': 'I-report ang Nawawalang Alaga',
      'modal.lostLocation': 'Lugar kung Saan Huling Nakita / Barangay *',
      'modal.lostLocationPh': 'hal. Malapit sa Barangay Hall o Kanto',
      'modal.lostDate': 'Petsa at Oras kung Kailan Huling Nakita',
      'modal.lostNotes': 'Iba pang Palatandaan at Ugali ng Alaga',
      'modal.lostNotesPh': 'May suot na collar tag, sumasagot kapag tinatawag...',
      'modal.broadcastBtn': 'I-post ang Nawawalang Alerto',

      'modal.foundTitle': 'I-report ang Nakitang Alaga sa Kalye',
      'modal.foundSpecies': 'Uri ng Hayop *',
      'modal.foundBreed': 'Tantyang Lahi / Breed',
      'modal.foundLocation': 'Lugar kung Saan Nakita o Natagpuan *',
      'modal.foundLocationPh': 'Kalye, Barangay, Subdivision, o Landmark',
      'modal.foundRfid': 'Numero ng RFID Tag (kung may suot na tag)',
      'modal.foundPhone': 'Cellphone Number ng Nakakita',
      'modal.submitReport': 'Ipasa ang Ulat',

      // Report Pet Modal & Navigation
      'nav.report': 'Report Pet',
      'nav.reportTitle': 'I-ulat ang Nawawala o Nakitang Alaga',
      'report.modalTitleFound': 'Nakita mo ba ang alagang ito?',
      'report.modalTitleMissing': 'I-ulat ang Nawawalang Alaga',
      'report.helpBtnTitle': 'Mga Hakbang at Gabay sa Pag-uulat',
      'report.guideFoundTitle': 'Paano Mag-ulat ng Nakitang Alaga (Hakbang-hakbang)',
      'report.guideMissingTitle': 'Paano Mag-ulat ng Nawawalang Alaga (Hakbang-hakbang)',
      'report.step1FoundTitle': 'I-pin ang Lokasyon',
      'report.step1FoundDesc': 'Pindutin o i-drag ang pin sa mapa kung saan nakita o natagpuan ang alaga.',
      'report.step2FoundTitle': 'Litrato ng Alaga',
      'report.step2FoundDesc': 'Lumipat sa "Upload" para maglagay ng litrato para sa visual at AI matching.',
      'report.step3FoundTitle': 'Tingnan ang RFID Tag',
      'report.step3FoundDesc': 'Kung may RFID tag sa kwelyo, ilagay ang numero para maabisuhan agad ang may-ari.',
      'report.step4FoundTitle': 'Ipasa at Abisuhan',
      'report.step4FoundDesc': 'Pindutin ang "Submit and Notify" para maabisuhan ang may-ari at municipal shelters.',
      'report.step1MissingTitle': 'Piliin ang Alaga',
      'report.step1MissingDesc': 'Piliin ang iyong rehistradong alaga o ilagay ang pangalan at itsura.',
      'report.step2MissingTitle': 'I-pin kung Saan Huling Nakita',
      'report.step2MissingDesc': 'Itakda sa mapa kung saan huling nakita o tumakas ang iyong alaga.',
      'report.step3MissingTitle': 'Kontak na Numero',
      'report.step3MissingDesc': 'Ilagay ang iyong aktibong cellphone number para matawagan ka agad ng nakakita.',
      'report.step4MissingTitle': 'I-broadcast ang Alerto',
      'report.step4MissingDesc': 'Pindutin ang "Broadcast" para ma-post sa live mapa at maabisuhan ang mga patrol.',
      'report.modalSubFound': 'I-pin ang eksaktong lokasyon kung saan nakita ang alaga, mag-iwan ng maikling mensahe, at abisuhan ang may-ari.',
      'report.modalSubMissing': 'I-pin kung saan huling nakita ang alaga, maglagay ng detalye, at mag-broadcast ng alerto sa mga pound at mapa.',
      'report.tabFound': 'Nakitang Alaga sa Kalye',
      'report.tabMissing': 'I-ulat ang Nawawalang Alaga',
      'report.modeMaps': 'Mapa',
      'report.modeUpload': 'I-upload',
      'report.photoHeader': 'Litrato ng Alaga:',
      'report.pinnedLoc': 'Napiling Lokasyon:',
      'report.mapHelper': 'Pindutin o i-drag ang pin para itakda ang lokasyon',
      'report.searchLocPh': 'Maghanap ng lungsod, barangay, o landmark...',
      'report.quickJump': 'Mabilisang Pili:',
      'report.takePhoto': 'Kumuha ng litrato',
      'report.uploadPhoto': 'Mag-upload ng litrato',
      'report.dropPhotoText': 'Kumuha ng litrato o mag-upload mula sa device',
      'report.dropPhotoSub': 'Nakatutulong ang malinaw na litrato sa visual at AI matching ng komunidad',
      'report.photoReady': 'Nakalakip ang Litrato',
      'report.retakePhoto': 'Palitan ang Litrato',
      'report.removePhoto': 'Alisin',
      'report.species': 'Uri ng Hayop *',
      'report.speciesDog': 'Aso',
      'report.speciesCat': 'Pusa',
      'report.speciesOther': 'Iba pang Alaga',
      'report.breed': 'Lahi / Anyo',
      'report.breedPh': 'hal. Aspin / Golden Retriever mix',
      'report.locationLandmark': 'Lugar o Landmark kung Saan Nakita *',
      'report.locationLandmarkPh': 'hal. Commonwealth Ave malapit sa Park Entrance',
      'report.rfidTag': 'RFID Tag sa Collar (kung mayroon)',
      'report.rfidTagPh': 'hal. 982.000109283',
      'report.finderPhone': 'Iyong Cellphone (Opsyonal)',
      'report.finderPhonePh': '+63 9XX XXX XXXX',
      'report.messageOptional': 'Mensahe (opsyonal)',
      'report.messagePh': 'Ligtas ang alaga mo sa akin malapit sa park entrance.',
      'report.selectPet': 'Pumili ng Rehistradong Alaga *',
      'report.selectPetPh': '-- Pumili ng Rehistradong Alaga --',
      'report.otherPet': '+ Iba / Hindi Rehistradong Alaga',
      'report.petNameDesc': 'Pangalan at Katangian ng Alaga *',
      'report.petNameDescPh': 'hal. Brownie (Tricolor Beagle mix)',
      'report.lastSeenLoc': 'Huling Nakitang Lugar *',
      'report.lastSeenLocPh': 'hal. Barangay Commonwealth',
      'report.lastSeenDateTime': 'Petsa at Oras kung Kailan Huling Nakita',
      'report.ownerPhone': 'Cellphone Number ng May-ari *',
      'report.circumstances': 'Palatandaan at Sitwasyon ng Pagkawala',
      'report.circumstancesPh': 'hal. May suot na pulang collar na may kuliling. Nakawala habang naglalakad sa gabi.',
      'report.btnSubmitFound': 'Submit and Notify',
      'report.btnMissingAlert': 'Missing Alert',
      'report.btnCancel': 'Kanselahin',

      // Good Samaritan Finder Modal
      'finder.modalTitle': 'Natagpuan ng Magandang-loob ang Iyong Alaga',
      'finder.modalSub': 'Direktang contact at patunay ng pagkakatagpo mula sa nakapulot.',
      'finder.contactHeading': 'Impormasyon ng Nakapulot',
      'finder.callBtn': 'Tawagan ang Nakapulot',
      'finder.viewMap': 'Tingnan sa Mapa',

      // Footer
      'footer.copy': 'PawTrack System — Sistema sa Paghahanap at Pag-abiso sa Nawawalang Alaga gamit ang RFID Technology.',
      'footer.status': 'Aktibo ang NCR Municipal Transponder Network',

      // Toast feedback
      'toast.langSwitched': 'Pinalitan ang wika sa Filipino.'
    }
  };

  class I18nManager {
    constructor() {
      this.currentLang = localStorage.getItem(STORAGE_KEY) || 'en';
      if (!translations[this.currentLang]) {
        this.currentLang = 'en';
      }
    }

    getLang() {
      return this.currentLang;
    }

    setLang(lang, showToastNotification = true) {
      if (!translations[lang]) return;
      this.currentLang = lang;
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.setAttribute('lang', lang);

      this.updateToggleUI();
      this.applyDOMTranslations();

      if (window.pawApp && typeof window.pawApp.renderCurrentView === 'function') {
        window.pawApp.renderCurrentView();
      }

      if (showToastNotification && window.notifManager) {
        const msg = this.t('toast.langSwitched', lang === 'fil' ? 'Pinalitan ang wika sa Filipino.' : 'Language switched to English.');
        window.notifManager.showToast(msg, 'info', 2500);
      }
    }

    toggleLanguage() {
      const next = this.currentLang === 'en' ? 'fil' : 'en';
      this.setLang(next, true);
    }

    t(key, fallback = '') {
      const dict = translations[this.currentLang] || translations.en;
      if (dict && dict[key]) {
        return dict[key];
      }
      const fallbackDict = translations.en;
      if (fallbackDict && fallbackDict[key]) {
        return fallbackDict[key];
      }
      return fallback || key;
    }

    updateToggleUI() {
      const codeIndicator = document.getElementById('lang-current-code');
      const toggleBtn = document.getElementById('lang-toggle-btn');

      if (codeIndicator) {
        codeIndicator.textContent = this.currentLang === 'en' ? 'EN' : 'FIL';
      }

      if (toggleBtn) {
        toggleBtn.setAttribute('title', this.t('nav.langTitle', 'Palitan ang Wika / Switch Language (English / Filipino)'));
      }
    }

    applyDOMTranslations() {
      // 1. Text elements with data-i18n
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const trans = this.t(key);
        if (trans) el.textContent = trans;
      });

      // 2. HTML elements with data-i18n-html
      document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        const trans = this.t(key);
        if (trans) el.innerHTML = trans;
      });

      // 3. Placeholders with data-i18n-placeholder
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        const trans = this.t(key);
        if (trans) el.setAttribute('placeholder', trans);
      });

      // 4. Titles with data-i18n-title
      document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        const trans = this.t(key);
        if (trans) el.setAttribute('title', trans);
      });

      // 5. Aria labels with data-i18n-aria
      document.querySelectorAll('[data-i18n-aria]').forEach(el => {
        const key = el.getAttribute('data-i18n-aria');
        const trans = this.t(key);
        if (trans) el.setAttribute('aria-label', trans);
      });

      if (window.lucide) {
        window.lucide.createIcons();
      }
    }
  }

  window.pawI18n = new I18nManager();
  window.t = (key, fallback) => window.pawI18n.t(key, fallback);
})();
