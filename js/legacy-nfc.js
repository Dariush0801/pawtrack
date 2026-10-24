/**
 * Upgrades records saved before the RFID -> NFC rename.
 *
 * Old data used rfidTag / rfidTags / rfidPassVerified fields and tag codes like "RFID-882194".
 * migrateLegacyNfc() renames those fields and prefixes in place, at any depth, and returns its input,
 * so saved pets, cases, notifications and requests from older clients keep working.
 * Safe to run repeatedly: already-migrated data is left unchanged.
 *
 * Loaded by the browser (window.migrateLegacyNfc) and by the Node server (require).
 */
(function (root) {
  const FIELD_RENAMES = {
    rfidTag: 'nfcTag',
    rfidTags: 'nfcTags',
    rfidPassVerified: 'nfcPassVerified',
    rfidScanAdoption: 'nfcScanAdoption',
    rfidScannerBaudRate: 'nfcScannerBaudRate'
  };
  const CODE_FIELDS = ['nfcTag', 'code', 'tag'];

  function migrateLegacyNfc(value) {
    if (Array.isArray(value)) {
      value.forEach((item, i) => { value[i] = migrateLegacyNfc(item); });
      return value;
    }
    if (!value || typeof value !== 'object') return value;

    Object.keys(value).forEach((key) => {
      const migrated = migrateLegacyNfc(value[key]);
      const renamed = FIELD_RENAMES[key];
      if (renamed) {
        delete value[key];
        if (value[renamed] === undefined) value[renamed] = migrated;
      } else {
        value[key] = migrated;
      }
    });
    CODE_FIELDS.forEach((field) => {
      if (typeof value[field] === 'string') value[field] = value[field].replace(/^RFID-/i, 'NFC-');
    });
    return value;
  }

  // A tag code as a person or an old link would type it: trimmed, upper case, NFC- prefix
  function normalizeNfcCode(code) {
    return String(code == null ? '' : code).trim().toUpperCase().replace(/^RFID-/, 'NFC-');
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { migrateLegacyNfc, normalizeNfcCode };
  else { root.migrateLegacyNfc = migrateLegacyNfc; root.normalizeNfcCode = normalizeNfcCode; }
})(typeof window !== 'undefined' ? window : globalThis);
