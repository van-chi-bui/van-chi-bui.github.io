// --- Logic ẩn/hiện khi cuộn trang (áp dụng cho container) ---
const buttonGroup = document.getElementById('glass-button-group');

window.addEventListener('scroll', function () {
    if (window.scrollY > 150) {
        buttonGroup.classList.add('visible');
    } else {
        buttonGroup.classList.remove('visible');
    }
});

// --- Logic xử lý chuyển đổi tab active khi click ---
const tabButtons = document.querySelectorAll('#glass-button-group a');

// Lặp qua từng nút và gán sự kiện click
tabButtons.forEach(button => {
    button.addEventListener('click', function (event) {
        // Ngăn hành vi mặc định của thẻ <a> (chuyển trang hoặc nhảy đến anchor)
        event.preventDefault();

        // 1. Gỡ bỏ class 'active' khỏi tất cả các nút
        tabButtons.forEach(btn => btn.classList.remove('active'));

        // 2. Thêm class 'active' vào chính nút vừa được click
        this.classList.add('active');

        // xử lý chuyển trang
        if (isTouchDevice()) {
            if (this.getAttribute('href') === '/cv/portfolio/') {
                setTimeout(() => {
                    window.open('https://chibvportfolio.my.canva.site/vanchibui/', '_blank');
                }, 300)
            }
        }
        if (this.getAttribute('href') !== location.pathname) {
            setTimeout(() => {
                location = this.getAttribute('href')
            }, 300)
        } else if (this.getAttribute('href') === location.pathname) {
            if (this.getAttribute('href') === '/cv/portfolio/') {
                window.open('https://chibvportfolio.my.canva.site/vanchibui/', '_blank');
            }
        }
    });
});

/**
 * Kiểm tra xem thiết bị hiện tại có hỗ trợ màn hình cảm ứng hay không.
 * @returns {boolean} Trả về `true` nếu là thiết bị cảm ứng, ngược lại trả về `false`.
 */
function isTouchDevice() {
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
}
