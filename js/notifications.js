/**
 * PawTrack Notification System & Facebook-Style Dropdown
 */

class NotificationManager {
  constructor() {
    this.activeCategory = 'others'; // 'others' | 'priority'
    this.initToastContainer();
  }

  isPriority(n) {
    if (!n) return false;
    if (n.category === 'priority' || n.isPriority === true) return true;
    if (n.type === 'impound_alert' || (n.title && n.title.toUpperCase().includes('IMPOUND'))) return true;
    if (n.type === 'missing' && n.title && n.title.toUpperCase().includes('EMERGENCY')) return true;
    return false;
  }

  setCategory(category) {
    this.activeCategory = (category === 'priority') ? 'priority' : 'others';
    this.renderNotifDropdown();
  }

  initToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    this.toastContainer = container;
  }

  showToast(message, type = 'info', duration = 3500) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;

    let icon = 'info';
    if (type === 'success') icon = 'check-circle';
    if (type === 'danger') icon = 'alert-triangle';
    if (type === 'warning') icon = 'alert-circle';

    toast.innerHTML = `
      <div style="font-size: 1.1rem; display:flex; align-items:center; flex-shrink:0;">
        <i data-lucide="${icon}"></i>
      </div>
      <div style="flex:1;">
        <div style="font-size:0.875rem; font-weight:500;">${message}</div>
      </div>
      <button style="color:var(--text-muted); font-size:1.1rem; line-height:1; padding:4px;" onclick="this.parentElement.remove()" aria-label="Close">&times;</button>
    `;

    this.toastContainer.appendChild(toast);
    if (window.lucide) window.lucide.createIcons({ root: toast });

    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
  }

  renderNotifDropdown() {
    const listElem = document.getElementById('notif-dropdown-list');
    const countBadge = document.getElementById('notif-dropdown-count');
    const bellBadge = document.getElementById('notif-count-badge');
    const priorityTabBtn = document.getElementById('notif-tab-priority');
    const othersTabBtn = document.getElementById('notif-tab-others');
    const priorityBadge = document.getElementById('notif-badge-priority');
    const othersBadge = document.getElementById('notif-badge-others');

    if (!listElem) return;

    const notifs = window.pawStore ? window.pawStore.getNotifications() : [];
    const unreadCount = notifs.filter(n => !n.read).length;

    // Filter Priority (Official Impound Alerts) vs Others (Good Samaritan matches, sightings, general)
    const priorityNotifs = notifs.filter(n => this.isPriority(n));
    const othersNotifs = notifs.filter(n => !this.isPriority(n));

    const priorityUnread = priorityNotifs.filter(n => !n.read).length;
    const othersUnread = othersNotifs.filter(n => !n.read).length;

    if (countBadge) {
      countBadge.textContent = unreadCount;
      countBadge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
    }
    if (bellBadge) {
      bellBadge.textContent = unreadCount;
      bellBadge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
    }

    // Update Category Tab active state & badges
    if (priorityTabBtn && othersTabBtn) {
      if (this.activeCategory === 'priority') {
        priorityTabBtn.classList.add('active');
        othersTabBtn.classList.remove('active');
      } else {
        othersTabBtn.classList.add('active');
        priorityTabBtn.classList.remove('active');
      }
    }

    if (priorityBadge) {
      priorityBadge.textContent = priorityUnread;
      priorityBadge.style.display = priorityUnread > 0 ? 'inline-block' : 'none';
      if (priorityUnread > 0) {
        priorityBadge.className = 'fb-notif-tab-badge badge-priority';
      }
    }

    if (othersBadge) {
      othersBadge.textContent = othersUnread;
      othersBadge.style.display = othersUnread > 0 ? 'inline-block' : 'none';
      if (othersUnread > 0) {
        othersBadge.className = 'fb-notif-tab-badge badge-others';
      }
    }

    const currentList = this.activeCategory === 'priority' ? priorityNotifs : othersNotifs;
    const t = window.t || ((k, fallback) => fallback || k);

    if (currentList.length === 0) {
      if (this.activeCategory === 'priority') {
        listElem.innerHTML = `
          <div style="text-align:center; padding: 2.2rem 1.2rem; color:var(--text-muted);">
            <div style="margin-bottom: 0.6rem; opacity: 0.6;">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#ea9d1e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto;">
                <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/>
                <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/>
                <circle cx="12" cy="12" r="2"/>
                <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/>
                <path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1"/>
              </svg>
            </div>
            <div style="font-weight:700; font-size: 0.92rem; color:var(--text-main);">${t('notif.noPriority', 'No Priority Alerts')}</div>
            <div style="font-size:0.75rem; margin-top:0.3rem; color:var(--text-muted); line-height:1.4;">${t('notif.noPriorityDesc', 'Official municipal shelter intake and impoundment notices will appear here.')}</div>
          </div>
        `;
      } else {
        listElem.innerHTML = `
          <div style="text-align:center; padding: 2.2rem 1.2rem; color:var(--text-muted);">
            <div style="margin-bottom: 0.6rem; opacity: 0.4;">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto;">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>
            <div style="font-weight:700; font-size: 0.92rem; color:var(--text-main);">${t('notif.noOthers', 'No Other Notifications')}</div>
            <div style="font-size:0.75rem; margin-top:0.3rem; color:var(--text-muted); line-height:1.4;">${t('notif.noOthersDesc', 'Good Samaritan finder reports, community sightings, and updates will appear here.')}</div>
          </div>
        `;
      }
    } else {
      listElem.innerHTML = currentList.map(n => {
        const isPriorityItem = this.isPriority(n);
        const isFoundMatch = n.type === 'pet_found_match' || (n.title && n.title.toUpperCase().includes('FOUND'));
        const isRead = Boolean(n.read);

        let cardClass = 'fb-notif-item';
        if (isRead) {
          cardClass += ' read-item';
        } else if (isFoundMatch) {
          cardClass += ' unread-match notif-match-card';
        } else {
          cardClass += ' unread-standard';
        }

        const iconLetter = isFoundMatch ? 'F' : n.type === 'impound_alert' ? 'S' : n.type === 'reunited' ? 'R' : 'A';
        const iconBg = isRead 
          ? 'rgba(255, 255, 255, 0.08)' 
          : isFoundMatch 
            ? 'rgba(34, 197, 94, 0.2)' 
            : isPriorityItem 
              ? 'rgba(234, 157, 30, 0.25)' 
              : 'rgba(234, 157, 30, 0.15)';
        const iconColor = isRead 
          ? 'var(--text-dim, #94a3b8)' 
          : isFoundMatch 
            ? '#22c55e' 
            : 'var(--primary)';
        const titleColor = isRead 
          ? 'var(--text-muted, #cbd5e1)' 
          : isFoundMatch 
            ? '#22c55e' 
            : 'var(--text-main)';
        const badgeBg = isFoundMatch ? '#22c55e' : 'var(--primary, #ea9d1e)';
        const badgeText = isFoundMatch ? t('notif.foundTag', 'FOUND') : t('notif.newTag', 'NEW');

        return `
          <div class="${cardClass}" onclick="window.notifManager.handleNotifClick('${n.id}')" title="${isRead ? 'Already read · Click to view details' : 'Unread · Click to view details'}">
            <span class="notif-avatar-icon" style="display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:50%; background:${iconBg}; color:${iconColor}; font-size:0.75rem; font-weight:800; flex-shrink:0; margin-top:2px;">
              ${iconLetter}
            </span>
            <div style="flex:1; min-width:0; overflow:hidden;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:6px;">
                <strong class="notif-title-text" style="font-size:0.82rem; color:${titleColor}; word-break:break-word; overflow-wrap:anywhere;">${n.title}</strong>
                ${!isRead 
                  ? `<span style="font-size:0.6rem; font-weight:700; background:${badgeBg}; color:#ffffff; border-radius:99px; padding:1px 6px; flex-shrink:0; letter-spacing:0.02em;">${badgeText}</span>` 
                  : `<span class="notif-read-check-icon" title="Read" style="font-size:0.65rem; color:var(--text-dim, #94a3b8); display:inline-flex; align-items:center; gap:2px; opacity:0.75;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></span>`}
              </div>
              <p class="notif-msg-text" style="font-size:0.76rem; color:${isRead ? 'var(--text-dim, #94a3b8)' : 'var(--text-muted)'}; margin:4px 0 6px; line-height:1.4; word-break:break-word; overflow-wrap:anywhere;">${n.message}</p>
              
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
                <span style="font-size:0.68rem; font-family:monospace; color:var(--text-dim);">${new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                ${n.rfidTag ? `
                  <span class="notif-rfid-pill" style="font-size:0.66rem; font-family:var(--font-mono); font-weight:700; color:${isRead ? 'var(--text-dim, #94a3b8)' : isFoundMatch ? '#22c55e' : 'var(--primary)'}; background:${isRead ? 'rgba(255,255,255,0.04)' : isFoundMatch ? 'rgba(34,197,94,0.12)' : 'rgba(234,157,30,0.12)'}; padding:1px 6px; border-radius:4px; border:1px solid ${isRead ? 'rgba(255,255,255,0.1)' : isFoundMatch ? 'rgba(34,197,94,0.3)' : 'rgba(234,157,30,0.3)'};">RFID: ${n.rfidTag}</span>
                ` : ''}
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  handleNotifClick(notifId) {
    if (window.pawStore) {
      window.pawStore.markNotificationRead(notifId);
    }
    const notifs = window.pawStore ? window.pawStore.getNotifications() : [];
    const notif = notifs.find(n => String(n.id) === String(notifId));
    if (!notif) return;

    if (!notif.read) {
      notif.read = true;
      localStorage.setItem('pawtrack_notifications', JSON.stringify(notifs));
    }
    this.renderNotifDropdown();
    if (window.pawApp && window.pawApp.updateNotifBadge) {
      window.pawApp.updateNotifBadge();
    }

    // Close notification dropdown panel so it doesn't obstruct the modal
    const notifDropdown = document.getElementById('notif-dropdown-panel');
    if (notifDropdown) notifDropdown.style.display = 'none';
    const userDropdown = document.getElementById('user-account-dropdown');
    if (userDropdown) userDropdown.style.display = 'none';

    if (notif.type === 'pet_found_match' || notif.finderPhone || (notif.title && notif.title.includes('FOUND YOUR PET'))) {
      this.showFinderInfo(notif);
    } else if (notif.type === 'impound_alert' && notif.impoundData) {
      this.showSmsSimulation(notif.impoundData);
    } else if (notif.coords) {
      window.location.hash = '#map';
    }
  }

  showFinderInfo(itemOrId) {
    let data = itemOrId;
    if (typeof itemOrId === 'string') {
      const notifs = window.pawStore ? window.pawStore.getNotifications() : [];
      data = notifs.find(n => String(n.id) === String(itemOrId));
      if (!data && window.pawStore) {
        const sightings = window.pawStore.getSightings() || [];
        data = sightings.find(s => String(s.id) === String(itemOrId));
      }
      if (!data && window.pawStore) {
        const cases = window.pawStore.getCases() || [];
        data = cases.find(c => String(c.id) === String(itemOrId) || String(c.petId) === String(itemOrId));
      }
    }
    if (!data) return;

    // Close notification dropdown panel and account dropdown
    const notifDropdown = document.getElementById('notif-dropdown-panel');
    if (notifDropdown) notifDropdown.style.display = 'none';
    const userDropdown = document.getElementById('user-account-dropdown');
    if (userDropdown) userDropdown.style.display = 'none';

    const modal = document.getElementById('finder-info-modal');
    if (!modal) return;

    // Mark notification read if matching
    const notifIdToMark = data.id || itemOrId;
    if (window.pawStore) {
      window.pawStore.markNotificationRead(notifIdToMark);
    }
    const notifs = window.pawStore ? window.pawStore.getNotifications() : [];
    const targetNotif = notifs.find(n => String(n.id) === String(notifIdToMark));
    if (targetNotif && !targetNotif.read) {
      targetNotif.read = true;
      localStorage.setItem('pawtrack_notifications', JSON.stringify(notifs));
    }
    this.renderNotifDropdown();

    // Look up pet info if available
    let pet = null;
    if (data.petId && window.pawStore) pet = window.pawStore.getPetById(data.petId);
    if (!pet && data.rfidTag && window.pawStore) pet = window.pawStore.getPetByRFID(data.rfidTag);
    if (!pet && data.title && window.pawStore) {
      const nameMatch = data.title.match(/"([^"]+)"/);
      if (nameMatch) {
        const pets = window.pawStore.getPets() || [];
        pet = pets.find(p => (p.name || '').toUpperCase() === nameMatch[1].toUpperCase());
      }
    }

    const petNameElem = document.getElementById('finder-pet-name');
    const petRfidElem = document.getElementById('finder-pet-rfid');
    const petPhotoElem = document.getElementById('finder-pet-photo');
    const sightingWrap = document.getElementById('finder-sighting-photo-wrap');
    const sightingImg = document.getElementById('finder-sighting-photo');
    const personNameElem = document.getElementById('finder-person-name');
    const personPhoneElem = document.getElementById('finder-person-phone');
    const callBtn = document.getElementById('finder-call-btn');
    const notesElem = document.getElementById('finder-notes-box');
    const locElem = document.getElementById('finder-location-name');
    const timeElem = document.getElementById('finder-timestamp');

    const displayName = pet ? pet.name : (data.petName || data.breed || 'Community Pet');
    const displayRfid = data.rfidTag || (pet ? pet.rfidTag : null);
    const photoSrc = (pet && pet.photoUrl) ? pet.photoUrl : (data.photoUrl || data.photo || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&q=80');
    const evidencePhoto = data.photoUrl || data.photo;
    
    let rawPhone = data.finderPhone || data.reporterPhone;
    if (!rawPhone && data.message) {
      const phoneMatch = data.message.match(/Contact:\s*(\+?[0-9\s-]+)/i);
      if (phoneMatch) rawPhone = phoneMatch[1].trim();
    }
    const phone = rawPhone || '+63 917 888 9999';
    const cleanPhone = phone.replace(/[^0-9+]/g, '');

    let rawNotes = data.finderNotes || data.comments || data.notes;
    if (!rawNotes && data.message) {
      const msgNotesMatch = data.message.match(/Notes:\s*"?([^"]+)"?/i);
      if (msgNotesMatch) {
        rawNotes = msgNotesMatch[1].trim();
      } else {
        rawNotes = data.message;
      }
    }
    let cleanNotes = (rawNotes || 'Pet is safe with community finder.').trim();
    if (cleanNotes.startsWith('"') && cleanNotes.endsWith('"')) {
      cleanNotes = cleanNotes.slice(1, -1).trim();
    }

    let loc = data.location;
    if (!loc && data.message) {
      const locMatch = data.message.match(/near\s+([^.]+)\./i);
      if (locMatch) loc = locMatch[1].trim();
    }
    if (!loc) loc = 'Metro Manila, Philippines';

    if (petNameElem) petNameElem.textContent = displayName;
    if (petRfidElem) petRfidElem.textContent = displayRfid ? `RFID: ${displayRfid}` : 'RFID: Not Detected';
    if (petPhotoElem) petPhotoElem.src = photoSrc;

    if (sightingWrap && sightingImg) {
      if (evidencePhoto) {
        sightingImg.src = evidencePhoto;
        sightingWrap.style.display = 'block';
      } else {
        sightingWrap.style.display = 'none';
      }
    }

    if (personNameElem) personNameElem.textContent = data.finderName || data.reporterName || 'Community Good Samaritan';
    if (personPhoneElem) personPhoneElem.textContent = phone;
    if (callBtn) callBtn.href = `tel:${cleanPhone}`;
    if (notesElem) notesElem.textContent = `"${cleanNotes}"`;
    if (locElem) locElem.textContent = loc;
    if (timeElem) timeElem.textContent = data.timestamp ? new Date(data.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Recently Reported';

    this.lastFinderCoords = data.coords || [14.6500, 121.0400];

    const bodyContainer = modal.querySelector('.finder-modal-body');
    if (bodyContainer) bodyContainer.scrollTop = 0;

    modal.classList.add('active');
  }

  jumpToFinderLocation() {
    this.closeModal('finder-info-modal');
    window.location.hash = '#map';
    if (this.lastFinderCoords && window.publicView) {
      setTimeout(() => {
        if (window.publicView && window.publicView.map) {
          window.publicView.map.flyTo(this.lastFinderCoords, 16, { duration: 0.8 });
        }
      }, 250);
    }
  }

  showSmsSimulation(data) {
    const modal = document.getElementById('sms-simulator-modal');
    if (!modal) return;

    const phoneElem = document.getElementById('sim-sms-phone');
    const timeElem = document.getElementById('sim-sms-time');
    const bodyElem = document.getElementById('sim-sms-body');

    if (phoneElem) phoneElem.innerText = data.ownerPhone || '+63 917 555 3829';
    if (timeElem) timeElem.innerText = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (bodyElem) {
      bodyElem.innerHTML = `
        <div style="font-weight:700; color:#ea9d1e; margin-bottom:6px; letter-spacing:0.02em;">OFFICIAL NOTICE: PET IMPOUNDMENT</div>
        Your registered pet <strong>"${data.petName}"</strong> (RFID: <code>${data.rfidTag}</code>) has been logged at <strong>${data.shelterName}</strong>.<br><br>
        <strong>Facility Address:</strong> ${data.shelterAddress}<br>
        <strong>Holding Bay:</strong> ${data.cageNumber || 'Bay 01'}<br>
        <strong>Claim Window:</strong> 72 Hours from intake.<br><br>
        Please present a Valid ID and Pet Vaccination Book upon claiming. Contact: ${data.shelterPhone || '+63 (2) 8988-4242'}.
      `;
    }

    modal.classList.add('active');
    if (window.lucide) window.lucide.createIcons({ root: modal });
  }

  showGmailPinSimulation(email) {
    this.showToast(`Verification PIN has been sent directly to your Gmail (${email || 'active account'}). Please check your primary inbox.`, 'info');
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      modal.style.display = 'flex';
      if (window.lucide) window.lucide.createIcons({ root: modal });
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
    }
  }
}

window.notifManager = new NotificationManager();
