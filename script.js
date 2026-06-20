document.addEventListener('DOMContentLoaded', () => {
    // 1. موازن أداء المؤشر المخصص (Custom Cursor)
    const cursor = document.getElementById('cursor');
    const dot = document.getElementById('cursor-dot');

    if (cursor && dot) {
        document.addEventListener('mousemove', (e) => {
            const { clientX: x, clientY: y } = e;
            
            // استخدام requestAnimationFrame أو translate3d للأداء العالي
            requestAnimationFrame(() => {
                cursor.style.left = `${x}px`;
                cursor.style.top = `${y}px`;
                dot.style.left = `${x}px`;
                dot.style.top = `${y}px`;
            });
        });
    }

    // 3. تأثيرات الظهور باستخدام IntersectionObserver (Scroll Reveal)
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in');
                // بمجرد ظهور العنصر، نتوقف عن مراقبته لتحسين الأداء
                revealObserver.unobserve(entry.target);
            }
        });
    }, revealOptions);

    document.querySelectorAll('.rv, .rv-l, .rv-r').forEach(el => {
        revealObserver.observe(el);
    });

    // 4. ضبط أبعاد الـ Hero Canvas عند تغيير حجم الشاشة
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // هنا يمكنك إعادة تشغيل أي رسوميات داخل الـ canvas إذا وجدت
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
    }

    // 5. معالجة حقول الـ Select للتأكد من بقاء الـ Label في الأعلى
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
        // التحقق عند التحميل الأولي (في حال كان هناك قيمة افتراضية)
        checkValue();
    });

    // إضافة تأثير "المغناطيس" البسيط للأزرار (اختياري لتحسين التجربة)
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

    // 6. Lightbox Gallery Logic
    const modal = document.getElementById('gallery-modal');
    const modalImg = document.getElementById('g-modal-img');
    const closeBtn = document.querySelector('.g-close');
    const prevBtn = document.getElementById('g-prev');
    const nextBtn = document.getElementById('g-next');
    const currentTxt = document.getElementById('g-current');
    const totalTxt = document.getElementById('g-total');

    let currentGallery = [];
    let currentIndex = 0;

    document.querySelectorAll('.p-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // إذا تم الضغط على الزر، نمنع المتصفح من الانتقال للرابط لفتح معرض الصور بدلاً من ذلك
            if (e.target.closest('.p-card-link-btn')) {
                e.preventDefault();
            }

            const galleryData = card.getAttribute('data-gallery');
            if (galleryData) {
                currentGallery = galleryData.split(',').map(s => s.trim());
                currentIndex = 0;
                openGallery();
            }
        });
    });

    function openGallery() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // منع السكرول
        updateModalImage();
    }

    function updateModalImage() {
        modalImg.src = currentGallery[currentIndex];
        currentTxt.innerText = currentIndex + 1;
        totalTxt.innerText = currentGallery.length;
        
        // إخفاء أزرار التنقل إذا كانت هناك صورة واحدة فقط
        const nav = document.querySelector('.g-nav');
        nav.style.display = currentGallery.length > 1 ? 'flex' : 'none';
    }

    nextBtn.onclick = () => {
        currentIndex = (currentIndex + 1) % currentGallery.length;
        updateModalImage();
    };

    prevBtn.onclick = () => {
        currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
        updateModalImage();
    };

    closeBtn.onclick = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    // إضافة دعم لوحة المفاتيح للتنقل بين الصور
    window.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('active')) return;
        if (e.key === 'ArrowRight') nextBtn.click();
        if (e.key === 'ArrowLeft') prevBtn.click();
        if (e.key === 'Escape') closeBtn.click();
    });
});

// وظيفة إرسال البيانات إلى واتساب
function sendMsg(btn) {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const service = document.getElementById('serviceSelect').value;
    const message = document.getElementById('message').value;

    // التحقق من ملء البيانات الأساسية
    if (!firstName || !email || !message) {
        alert("من فضلك أكمل البيانات المطلوبة (الاسم، الإيميل، والرسالة).");
        return;
    }

    // --- غير الرقم هنا ---
    // يجب أن يبدأ بكود الدولة (20 لمصر) ثم رقم الهاتف بدون أصفار في البداية أو علامة +
    const myPhoneNumber = "201203341339"; 
    
    const text = `طلب جديد من الموقع:\nالاسم: ${firstName} ${lastName}\nالإيميل: ${email}\nالخدمة: ${service || 'لم يتم تحديدها'}\nالرسالة: ${message}`;
    
    // استخدام encodeURIComponent لتشفير النص ومنع أخطاء الرابط
    const whatsappUrl = `https://wa.me/${myPhoneNumber}?text=${encodeURIComponent(text)}`;
    
    window.open(whatsappUrl, '_blank');
}