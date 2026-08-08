const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbxvgQFSHwjY2hpTAXDf5ERJ4q28WL2VFUfaPgEpApSXrItec7n44wYARdhMWlooCyUQ/exec"; 
const ADMIN_PASSWORD = "1234"; // Yönetici giriş şifreniz (İstediğiniz gibi değiştirebilirsiniz)

document.addEventListener('DOMContentLoaded', () => {
    
    // Core Elements
    const body = document.body;
    const envelope = document.querySelector('.split-envelope');
    const openBtn = document.getElementById('open-btn');
    const envelopeWrapper = document.getElementById('envelope-wrapper');
    const mainContent = document.getElementById('main-content');
    const bgMusic = document.getElementById('bg-music');
    const musicToggle = document.getElementById('music-toggle');
    
    // Music start time constant (in seconds)
    const MUSIC_START_TIME = 47;
    
    // Music initialization flag
    let isMusicInitialized = false;
    function initializeMusic() {
        if (!isMusicInitialized && bgMusic) {
            try {
                bgMusic.currentTime = MUSIC_START_TIME;
                isMusicInitialized = true;
            } catch (e) {
                console.log('Müzik başlangıç süresi ayarlanamadı:', e);
            }
        }
    }
    
    // Lock scroll on load
    body.classList.add('lock-scroll');
    
    // 1. Envelope opening logic
    const openEnvelope = () => {
        if (envelope.classList.contains('open')) return;
        envelope.classList.add('open');
        document.body.classList.add('envelope-opened');
        
        // Hide wax seal immediately
        openBtn.style.opacity = '0';
        openBtn.style.pointerEvents = 'none';
        
        // Show main content immediately behind the envelope gates
        mainContent.classList.remove('hidden');
        
        // Fade the envelope wrapper's solid white background immediately
        envelopeWrapper.classList.add('fade-out-bg');
        
        // Music start (requires user interaction)
        tryPlayMusic();
        
        // Wait for gate swing animation to complete, then slide envelope up
        setTimeout(() => {
            envelopeWrapper.classList.add('fade-out');
            body.classList.remove('lock-scroll');
        }, 1600);
    };

    openBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openEnvelope();
    });
    openBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openEnvelope();
    });
    
    envelope.addEventListener('click', openEnvelope);
    
    // Add click/touch event for the envelope hint text to open it as well
    const envelopeHint = document.querySelector('.envelope-hint');
    if (envelopeHint) {
        envelopeHint.addEventListener('click', (e) => {
            e.stopPropagation();
            openEnvelope();
        });
        envelopeHint.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openEnvelope();
        });
    }
    
    // Try to play music automatically on load or button click
    function tryPlayMusic() {
        initializeMusic();
        bgMusic.play()
            .then(() => {
                // Safari safeguard: if currentTime didn't set, set it now
                if (bgMusic.currentTime < MUSIC_START_TIME - 1) {
                    try {
                        bgMusic.currentTime = MUSIC_START_TIME;
                    } catch(e) {}
                }
                musicToggle.classList.remove('paused');
            })
            .catch(error => {
                console.log('Otomatik oynatma tarayıcı tarafından engellendi, butonla başlatılacak:', error);
                musicToggle.classList.add('paused');
            });
    }
    
    // Music Player toggle controller
    musicToggle.addEventListener('click', () => {
        if (bgMusic.paused) {
            initializeMusic();
            bgMusic.play()
                .then(() => {
                    if (bgMusic.currentTime < MUSIC_START_TIME - 1) {
                        try {
                            bgMusic.currentTime = MUSIC_START_TIME;
                        } catch(e) {}
                    }
                });
            musicToggle.classList.remove('paused');
        } else {
            bgMusic.pause();
            musicToggle.classList.add('paused');
        }
    });

    // 2. Countdown Timer Logic (Target Date: 30.08.2026 19:00:00)
    const targetDate = new Date('2026-08-30T19:00:00').getTime();
    
    function updateCountdown() {
        const now = new Date().getTime();
        const difference = targetDate - now;
        
        if (difference <= 0) {
            document.getElementById('days').innerText = '00';
            document.getElementById('hours').innerText = '00';
            document.getElementById('minutes').innerText = '00';
            document.getElementById('seconds').innerText = '00';
            clearInterval(countdownInterval);
            return;
        }
        
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        document.getElementById('days').innerText = days.toString().padStart(2, '0');
        document.getElementById('hours').innerText = hours.toString().padStart(2, '0');
        document.getElementById('minutes').innerText = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').innerText = seconds.toString().padStart(2, '0');
    }
    
    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);



    // 4. Scroll Reveal Intersection Observer
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach(element => {
        revealObserver.observe(element);
    });

    // 5. Message Form Logic
    const rsvpForm = document.getElementById('rsvp-form');
    
    // Form submit listener
    rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nameVal = document.getElementById('rsvp-name').value.trim();
        const surnameVal = document.getElementById('rsvp-surname').value.trim();
        const phoneVal = document.getElementById('rsvp-phone').value.trim() || '-';
        const messageVal = document.getElementById('rsvp-message').value.trim();
        const timestamp = new Date().toLocaleString('tr-TR');
        
        if (!nameVal || !surnameVal || !messageVal) {
            alert('Lütfen gerekli alanları doldurunuz.');
            return;
        }
        
        // Message object creation
        const rsvpData = {
            fullName: `${nameVal} ${surnameVal}`,
            phone: phoneVal,
            message: messageVal,
            date: timestamp
        };
        
        // Save to LocalStorage
        let currentRSVPs = JSON.parse(localStorage.getItem('dugun_rsvps')) || [];
        currentRSVPs.push(rsvpData);
        localStorage.setItem('dugun_rsvps', JSON.stringify(currentRSVPs));
        
        // Google Sheets'e gönder (Eğer URL tanımlıysa)
        if (typeof GOOGLE_SHEETS_URL !== 'undefined' && GOOGLE_SHEETS_URL && GOOGLE_SHEETS_URL !== "") {
            fetch(GOOGLE_SHEETS_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(rsvpData)
            })
            .then(() => console.log('Google Sheets verisi başarıyla gönderildi.'))
            .catch(err => console.error('Google Sheets hatası:', err));
        }
        
        // Sweet success indicator
        showSuccessMessage(rsvpData.fullName);
        
        // Reset form
        rsvpForm.reset();
        
        // Update admin list
        loadRSVPs();
    });
    
    function showSuccessMessage(name) {
        // Create an elegant overlay popup for success
        const popup = document.createElement('div');
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%) scale(0.9)';
        popup.style.backgroundColor = '#FFFDFB';
        popup.style.border = '1px solid rgba(200, 149, 109, 0.35)';
        popup.style.borderRadius = '24px';
        popup.style.padding = '32px 24px';
        popup.style.textAlign = 'center';
        popup.style.boxShadow = '0 20px 50px rgba(61, 43, 43, 0.08)';
        popup.style.zIndex = '3000';
        popup.style.opacity = '0';
        popup.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        popup.style.maxWidth = '380px';
        popup.style.width = '85%';
        
        popup.innerHTML = `
            <div style="font-size: 3rem; color: #B76E79; margin-bottom: 12px;"><i class="fa-solid fa-heart-circle-check"></i></div>
            <h3 style="font-family: 'Tenor Sans', sans-serif; font-size: 1.25rem; color: #3D2B2B; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em;">Teşekkür Ederiz</h3>
            <p style="font-size: 0.82rem; color: rgba(61, 43, 43, 0.7); line-height: 1.6;">Sevgili <strong>${name}</strong>, tebrik mesajıınız başarıyla iletilmiştir. Güzel dilekleriniz için teşekkür ederiz!</p>
            <button id="success-close-btn" class="btn-primary" style="margin-top: 20px; padding: 8px 24px; font-size: 0.75rem;">Kapat</button>
        `;
        
        document.body.appendChild(popup);
        
        // Trigger reflow & show
        setTimeout(() => {
            popup.style.transform = 'translate(-50%, -50%) scale(1)';
            popup.style.opacity = '1';
        }, 50);
        
        const closePopup = () => {
            popup.style.transform = 'translate(-50%, -50%) scale(0.9)';
            popup.style.opacity = '0';
            setTimeout(() => {
                popup.remove();
            }, 400);
        };
        
        popup.querySelector('#success-close-btn').addEventListener('click', closePopup);
        
        // Auto-close after 5 seconds
        setTimeout(closePopup, 5000);
    }

    // 6. Password-Protected Admin Panel Modal Logic
    const adminFloatingBtn = document.getElementById('admin-floating-btn');
    const adminModal = document.getElementById('admin-modal');
    const passwordModal = document.getElementById('password-modal');
    const passwordForm = document.getElementById('password-form');
    const adminPassInput = document.getElementById('admin-pass-input');
    const closePassBtn = document.getElementById('close-pass-btn');
    const closeAdminBtn = document.getElementById('close-admin-btn');
    const exportCsvBtn = document.getElementById('export-csv-btn');
    const clearRsvpsBtn = document.getElementById('clear-rsvps-btn');
    const rsvpTableBody = document.getElementById('rsvp-table-body');
    
    // Open Password Modal on Gear Click
    if (adminFloatingBtn) {
        adminFloatingBtn.addEventListener('click', () => {
            if (passwordModal) {
                passwordModal.classList.remove('hidden');
                body.classList.add('lock-scroll');
                if (adminPassInput) {
                    adminPassInput.value = '';
                    adminPassInput.focus();
                }
            }
        });
    }

    // Password Form Submit Handler
    if (passwordForm) {
        passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const inputVal = adminPassInput ? adminPassInput.value.trim() : '';
            if (inputVal === ADMIN_PASSWORD) {
                if (passwordModal) passwordModal.classList.add('hidden');
                openAdminPanel();
                if (adminPassInput) adminPassInput.value = '';
            } else {
                showToastMessage('Hatalı Şifre!');
                if (adminPassInput) {
                    adminPassInput.value = '';
                    adminPassInput.focus();
                }
            }
        });
    }

    if (closePassBtn) {
        closePassBtn.addEventListener('click', closePasswordModal);
    }

    if (passwordModal) {
        passwordModal.addEventListener('click', (e) => {
            if (e.target === passwordModal) {
                closePasswordModal();
            }
        });
    }

    function closePasswordModal() {
        if (passwordModal) passwordModal.classList.add('hidden');
        if (adminModal.classList.contains('hidden')) {
            body.classList.remove('lock-scroll');
        }
    }
    
    closeAdminBtn.addEventListener('click', closeAdminPanel);
    
    // Close modal by clicking outer background
    adminModal.addEventListener('click', (e) => {
        if (e.target === adminModal) {
            closeAdminPanel();
        }
    });
    
    function openAdminPanel() {
        loadRSVPs();
        adminModal.classList.remove('hidden');
        body.classList.add('lock-scroll');
    }
    
    function closeAdminPanel() {
        adminModal.classList.add('hidden');
        body.classList.remove('lock-scroll');
    }
    
    function loadRSVPs() {
        let rsvps = JSON.parse(localStorage.getItem('dugun_rsvps')) || [];
        renderRSVPTable(rsvps);
        
        // Google Sheets tanımlıysa tüm misafirlerin gönderdiği ortak verileri çek
        if (typeof GOOGLE_SHEETS_URL !== 'undefined' && GOOGLE_SHEETS_URL && GOOGLE_SHEETS_URL !== "") {
            fetch(GOOGLE_SHEETS_URL)
                .then(res => res.json())
                .then(cloudData => {
                    if (Array.isArray(cloudData) && cloudData.length > 0) {
                        renderRSVPTable(cloudData);
                    }
                })
                .catch(err => console.log('Ortak veriler alınamadı:', err));
        }
    }

    function renderRSVPTable(dataList) {
        rsvpTableBody.innerHTML = '';
        if (!dataList || dataList.length === 0) {
            rsvpTableBody.innerHTML = '<tr><td colspan="4" class="text-center py-4">Henüz tebrik mesajıı gönderilmedi.</td></tr>';
            document.getElementById('stat-total-messages').innerText = 0;
            return;
        }
        
        // Sort by date (newest first)
        dataList.slice().reverse().forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight: 500;">${escapeHTML(item.fullName)}</td>
                <td>${escapeHTML(item.phone)}</td>
                <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHTML(item.message)}">${escapeHTML(item.message)}</td>
                <td>${escapeHTML(item.date)}</td>
            `;
            rsvpTableBody.appendChild(tr);
        });
        
        // Update stats DOM
        document.getElementById('stat-total-messages').innerText = dataList.length;
    }
    
    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }
    
    // Clear responses handler
    clearRsvpsBtn.addEventListener('click', () => {
        if (confirm('Tüm tebrik mesajılarını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
            localStorage.removeItem('dugun_rsvps');
            loadRSVPs();
        }
    });
    
    // CSV Export Handler with UTF-8 support for Turkish characters
    exportCsvBtn.addEventListener('click', () => {
        const rsvps = JSON.parse(localStorage.getItem('dugun_rsvps')) || [];
        if (rsvps.length === 0) {
            alert('İndirilecek veri bulunmuyor.');
            return;
        }
        
        // Headers definition
        let csvContent = '\uFEFF'; // UTF-8 BOM for Excel Turkish letters
        csvContent += 'Adı Soyadı,Telefon,Mesajı,Tarih\n';
        
        rsvps.forEach(item => {
            // Escape double quotes in CSV values
            const name = `"${item.fullName.replace(/"/g, '""')}"`;
            const phone = `"${item.phone.replace(/"/g, '""')}"`;
            const message = `"${item.message.replace(/"/g, '""')}"`;
            const date = `"${item.date}"`;
            
            csvContent += `${name},${phone},${message},${date}\n`;
        });
        
        // Trigger browser download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `Nida_Utkan_Dugun_Tebrik_Mesajlari.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
    
    // 7. Calendar Dropdown Toggle
    const calendarBtn = document.getElementById('calendar-btn');
    const calendarDropdown = document.getElementById('calendar-dropdown');
    
    if (calendarBtn && calendarDropdown) {
        calendarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            calendarDropdown.classList.toggle('hidden');
        });
        
        document.addEventListener('click', (e) => {
            if (!calendarBtn.contains(e.target) && !calendarDropdown.contains(e.target)) {
                calendarDropdown.classList.add('hidden');
            }
        });
    }

    // Apple Calendar (.ics) Generation
    const appleCalBtn = document.getElementById('apple-cal-btn');
    if (appleCalBtn && calendarDropdown) {
        appleCalBtn.addEventListener('click', () => {
            const icsContent = 
                "BEGIN:VCALENDAR\n" +
                "VERSION:2.0\n" +
                "BEGIN:VEVENT\n" +
                "CLASS:PUBLIC\n" +
                "DESCRIPTION:Sizleri de aramızda görmekten mutluluk duyarız.\\nAybala Düğün Salonu\\nSaat: 19:00 - 23:00\n" +
                "DTSTART:20260830T160000Z\n" +
                "DTEND:20260830T200000Z\n" +
                "LOCATION:Aybala Düğün Salonu\\, Km.\\, Yeni Mahallesi\\, Kayseri Yolu Caddesi No:3\\, 71800 Keskin / Kirikkale\n" +
                "SUMMARY:Nida & Utkan Düğün Töreni\n" +
                "END:VEVENT\n" +
                "END:VCALENDAR";
            
            const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'nida_utkan_dugun.ics');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            calendarDropdown.classList.add('hidden');
        });
    }

    // 8. Share Button Handler (Web Share API or Clipboard Copy Fallback)
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            const shareUrl = window.location.origin + window.location.pathname;
            if (navigator.share) {
                navigator.share({
                    title: 'Nida & Utkan Düğün Davetiyesi',
                    text: 'Nida Ceyhan & Utkan Altunbaş çiftinin 30.08.2026 tarihindeki düğün törenine davetlisiniz.',
                    url: shareUrl
                }).catch(error => console.log('Paylaşım iptal edildi veya hata oluştu:', error));
            } else {
                // Fallback: Copy to clipboard
                navigator.clipboard.writeText(shareUrl)
                    .then(() => {
                        showToastMessage('Davetiye linki kopyalandı!');
                    })
                    .catch(err => {
                        console.error('Kopyalama hatası:', err);
                        alert('Davetiye linki: ' + shareUrl);
                    });
            }
        });
    }
    
    // Helper function to show temporary Toast notifications
    function showToastMessage(text) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${text}`;
        document.body.appendChild(toast);
        
        // Trigger animations
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 500);
        }, 3000);
    }



    // 9. Photo Gallery Lightbox Viewer Logic
    const galleryGrid = document.querySelector('.gallery-grid');

    // Lightbox / Full size viewer
    function openFullSizePhoto(imgSrc) {
        const lightbox = document.createElement('div');
        lightbox.style.position = 'fixed';
        lightbox.style.top = '0';
        lightbox.style.left = '0';
        lightbox.style.width = '100vw';
        lightbox.style.height = '100vh';
        lightbox.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        lightbox.style.display = 'flex';
        lightbox.style.alignItems = 'center';
        lightbox.style.justifyContent = 'center';
        lightbox.style.zIndex = '9999';
        lightbox.style.cursor = 'zoom-out';
        lightbox.innerHTML = `
            <img src="${imgSrc}" style="max-width: 90%; max-height: 85%; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); object-fit: contain; transform: scale(0.9); transition: transform 0.3s ease;">
            <button style="position: absolute; top: 20px; right: 20px; background: none; border: none; color: #fff; font-size: 2.5rem; cursor: pointer; line-height: 1;">&times;</button>
        `;
        document.body.appendChild(lightbox);
        
        // Trigger entrance transition
        setTimeout(() => {
            const img = lightbox.querySelector('img');
            if (img) img.style.transform = 'scale(1)';
        }, 10);

        const closeLightbox = () => {
            const img = lightbox.querySelector('img');
            if (img) img.style.transform = 'scale(0.9)';
            lightbox.style.opacity = '0';
            lightbox.style.transition = 'opacity 0.25s ease';
            setTimeout(() => lightbox.remove(), 250);
        };

        lightbox.addEventListener('click', closeLightbox);
    }

    // Attach click events to the default 4 images for full-screen preview too!
    if (galleryGrid) {
        const defaultItems = galleryGrid.querySelectorAll('.gallery-item');
        defaultItems.forEach(item => {
            const img = item.querySelector('.gallery-img');
            if (img) {
                item.addEventListener('click', () => {
                    openFullSizePhoto(img.src);
                });
            }
        });
    }



    // No guest photo loading - gallery remains private to the couple!

});
