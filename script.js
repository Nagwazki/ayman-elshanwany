document.addEventListener('DOMContentLoaded', () => {
    // 1. موازن أداء المؤشر المخصص (Custom Cursor)
    const cursor = document.getElementById('cursor');
    const dot = document.getElementById('cursor-dot');

    if (cursor && dot) {
        document.addEventListener('mousemove', (e) => {
            const { clientX: x, clientY: y } = e;
            
            requestAnimationFrame(() => {
                cursor.style.left = `${x}px`;
                cursor.style.top = `${y}px`;
                dot.style.left = `${x}px`;
                dot.style.top = `${y}px`;
            });
        });
    }

    // 2. تأثيرات الظهور باستخدام IntersectionObserver (Scroll Reveal)
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in');
                revealObserver.unobserve(entry.target);
            }
        });
    }, revealOptions);

    document.querySelectorAll('.rv, .rv-l, .rv-r').forEach(el => {
        revealObserver.observe(el);
    });

    // Scrollspy: تمييز السيكشن الحالي في الناف بار عند السكرول
    const navSections = document.querySelectorAll("section[id]");
    const navItems = document.querySelectorAll(".nav-center a");

    function handleScrollspy() {
        const scrollPos = window.pageYOffset || document.documentElement.scrollTop;
        let activeId = "";

        navSections.forEach(sec => {
            const top = sec.offsetTop - 180;
            const height = sec.offsetHeight;
            if (scrollPos >= top && scrollPos < top + height) {
                activeId = sec.getAttribute("id");
            }
        });

        if ((window.innerHeight + scrollPos) >= document.documentElement.scrollHeight - 80) {
            activeId = "contact";
        }

        if (activeId) {
            navItems.forEach(item => {
                if (item.getAttribute("href") === "#" + activeId) {
                    item.classList.add("active");
                } else {
                    item.classList.remove("active");
                }
            });
        }
    }

    window.addEventListener("scroll", handleScrollspy, { passive: true });
    handleScrollspy();

    navItems.forEach(item => {
        item.addEventListener("click", function () {
            navItems.forEach(i => i.classList.remove("active"));
            this.classList.add("active");
        });
    });

    // 3. ضبط أبعاد الـ Hero Canvas عند تغيير حجم الشاشة
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
    }

    // 4. معالجة حقول الـ Select للتأكد من بقاء الـ Label في الأعلى
    const selects = document.querySelectorAll('.fg select');
    selects.forEach(select => {
        const checkValue = () => {
            if (select.value !== "") {
                select.classList.add('has-value');
            } else {
                select.classList.remove('has-value');
            }
        };

        select.addEventListener('change', checkValue);
        checkValue();
    });

    // 5. إضافة تأثير "المغناطيس" للأزرار
    const buttons = document.querySelectorAll('.btn-nav, .btn-primary, .btn-ghost');
    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) * 0.2;
            const y = (e.clientY - rect.top - rect.height / 2) * 0.2;
            btn.style.transform = `translate(${x}px, ${y}px) scale(1.04)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });

    // 6. Lightbox Gallery Logic (معرض الصور المنبثق)
    const modal = document.getElementById('gallery-modal');
    const modalImg = document.getElementById('g-modal-img');
    const closeBtn = document.querySelector('.g-close');
    const prevBtn = document.getElementById('g-prev');
    const nextBtn = document.getElementById('g-next');
    const currentTxt = document.getElementById('g-current');
    const totalTxt = document.getElementById('g-total');

    let currentGallery = [];
    let currentIndex = 0;

    // دالة فتح معرض الصور لأي كارت (القديم أو المضاف حديثاً)
    function attachCardClickEvent(card) {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.p-card-link-btn')) {
                e.preventDefault();
            }

            const galleryData = card.getAttribute('data-gallery');
            if (galleryData && modal) {
                try {
                    // إذا كانت البيانات مصفوفة JSON
                    const parsed = JSON.parse(galleryData);
                    if (Array.isArray(parsed)) {
                        currentGallery = parsed;
                    } else {
                        currentGallery = [galleryData];
                    }
                } catch {
                    // إذا كانت روابط قديمة مفصولة بفاصلة
                    if (galleryData.startsWith('data:image')) {
                        currentGallery = [galleryData];
                    } else {
                        currentGallery = galleryData.split(',').map(s => s.trim());
                    }
                }

                // إصلاح أي مسارات ناقصة
                currentGallery = currentGallery.map(imgSrc => {
                    if (imgSrc && !imgSrc.startsWith('http') && !imgSrc.startsWith('data:') && !imgSrc.startsWith('photo/')) {
                        return 'photo/' + imgSrc;
                    }
                    return imgSrc;
                });

                currentIndex = 0;
                openGallery();
            }
        });
    }

    // تشغيل المعرض على الكروت الموجودة في الصفحة
    document.querySelectorAll('.p-card').forEach(card => {
        attachCardClickEvent(card);
    });

    function openGallery() {
        if (!modal) return;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        updateModalImage();
    }

    function updateModalImage() {
        if (!modalImg || currentGallery.length === 0) return;
        modalImg.src = currentGallery[currentIndex];
        if (currentTxt) currentTxt.innerText = currentIndex + 1;
        if (totalTxt) totalTxt.innerText = currentGallery.length;
        
        const nav = document.querySelector('.g-nav');
        if (nav) {
            nav.style.display = currentGallery.length > 1 ? 'flex' : 'none';
        }
    }

    if (nextBtn) {
        nextBtn.onclick = () => {
            currentIndex = (currentIndex + 1) % currentGallery.length;
            updateModalImage();
        };
    }

    if (prevBtn) {
        prevBtn.onclick = () => {
            currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
            updateModalImage();
        };
    }

    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        };
    }

    window.addEventListener('keydown', (e) => {
        if (!modal || !modal.classList.contains('active')) return;
        if (e.key === 'ArrowRight' && nextBtn) nextBtn.click();
        if (e.key === 'ArrowLeft' && prevBtn) prevBtn.click();
        if (e.key === 'Escape' && closeBtn) closeBtn.click();
    });

    // ========================================================
    // 7. منطق الرابط السري وعرض المشاريع المرفوعة من LocalStorage
    // ========================================================
    const secretAddBtn = document.getElementById('secret-add-btn');
    const projectsContainer = document.getElementById('projects-container');

    // أ) فحص الرابط السري: ?admin=secret لإظهار زر الإضافة
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'secret') {
        if (secretAddBtn) {
            secretAddBtn.style.display = 'inline-flex';
        }
    }

    // ب) دالة بناء كارت المشروع وإضافته في شبكة الأعمال
    function renderProjectCard(project) {
        if (!projectsContainer) return;

        const card = document.createElement('div');
        card.classList.add('p-card');
        card.style.gridColumn = 'span 6';

        // ضبط مسار الصورة سواء كانت Base64 أو مسار محلي أو رابط
        let coverImg = project.cover || project.image || 'photo/1.jpg';
        if (!coverImg.startsWith('http') && !coverImg.startsWith('data:') && !coverImg.startsWith('photo/')) {
            coverImg = 'photo/' + coverImg;
        }

        // تجهيز مصفوفة الصور لمعرض الصور المنبثق
        let galleryData = project.gallery;
        if (!galleryData) {
            galleryData = [coverImg];
        } else if (typeof galleryData === 'string') {
            try {
                galleryData = JSON.parse(galleryData);
            } catch {
                if (!galleryData.startsWith('data:image')) {
                    galleryData = galleryData.split(',').map(s => s.trim());
                } else {
                    galleryData = [galleryData];
                }
            }
        }
        card.setAttribute('data-gallery', JSON.stringify(galleryData));

        card.innerHTML = `
            <div class="p-card-grid">
              <img src="${coverImg}" class="p-card-bg" alt="${project.title || 'مشروع جديد'}" onerror="this.src='photo/1.jpg'" />
            </div>
            <span class="p-card-label">${project.title || 'مشروع جديد'}</span>
            <div class="p-card-info">
              <div class="p-card-tag">${project.tag || "photoshop"}</div>
              <div class="p-card-info-bottom">
                <div class="p-card-title">${project.title || 'مشروع جديد'}</div>
                <a href="#" class="p-card-link-btn"><i class="fa-solid fa-arrow-right"></i></a>
              </div>
            </div>
        `;

        // ربط الكارت الجديد بمعرض الصور
        attachCardClickEvent(card);

        // وضع الكارت الجديد في أول المشاريع
        projectsContainer.prepend(card);
    }

    // ج) جلب المشاريع المخزنة في المتصفح وعرضها فور فتح الصفحة
    function loadSavedProjects() {
        try {
            const raw = localStorage.getItem('axora_projects');
            if (!raw) return;
            const parsed = JSON.parse(raw);
            const saved = Array.isArray(parsed) ? parsed : [parsed];
            saved.slice().reverse().forEach(proj => {
                if (proj && typeof proj === 'object') {
                    renderProjectCard(proj);
                }
            });
        } catch (err) {
            console.error('خطأ في استرجاع المشاريع المحفوظة:', err);
        }
    }

    // تشغيل جلب المشاريع
    loadSavedProjects();

}); // نهاية الـ DOMContentLoaded


// ==========================================
// وظيفة إرسال البيانات إلى واتساب
// ==========================================
function sendMsg(btn) {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const service = document.getElementById('serviceSelect').value;
    const message = document.getElementById('message').value;

    if (!firstName || !email || !message) {
        alert("من فضلك أكمل البيانات المطلوبة (الاسم، الإيميل، والرسالة).");
        return;
    }

    const myPhoneNumber = "201203341339"; 
    
    const text = `طلب جديد من الموقع:\nالاسم: ${firstName} ${lastName}\nالإيميل: ${email}\nالخدمة: ${service || 'لم يتم تحديدها'}\nالرسالة: ${message}`;
    
    const whatsappUrl = `https://wa.me/${myPhoneNumber}?text=${encodeURIComponent(text)}`;
    
    window.open(whatsappUrl, '_blank');
}
