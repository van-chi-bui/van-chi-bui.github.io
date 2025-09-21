// --- Logic ẩn/hiện khi cuộn trang (áp dụng cho container) ---
const buttonGroup = document.getElementById('glass-button-group');

const showNav = getQueryParam('show_nav');

if (showNav != null) {
    setTimeout(function () {
        buttonGroup.classList.add('visible');
    }, 500)
} else {
    showNavWhenScroll();
}

function showNavWhenScroll() {
    window.addEventListener('scroll', function () {
        if (window.scrollY > 150) {
            buttonGroup.classList.add('visible');
        } else {
            buttonGroup.classList.remove('visible');
        }
    });
}

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
    });
});

const handleOpenCvOrPortfolioPages = document.querySelectorAll('.handleOpenCvOrPortfolioPage');

handleOpenCvOrPortfolioPages.forEach(button => {
    button.addEventListener('click', function (event) {
        // Ngăn hành vi mặc định của thẻ <a> (chuyển trang hoặc nhảy đến anchor)
        event.preventDefault();

        // xử lý chuyển trang
        handleOpenCvOrPortfolioPage(this.getAttribute('href'))
    });
});

function handleOpenCvOrPortfolioPage(uri) {
    if (uri === '/cv/portfolio/' && isTouchDevice()) {
        setTimeout(() => {
            window.open('https://chibvportfolio.my.canva.site/vanchibui/', '_blank');

            setTimeout(() => {
                location = '/cv/portfolio/?show_nav=1';
            }, 300)
        }, 300)
    } else if (uri === '/cv/portfolio/' && uri === location.pathname) {
        window.open('https://chibvportfolio.my.canva.site/vanchibui/', '_blank');
    } else if (uri !== location.pathname) {
        setTimeout(() => {
            location = uri
        }, 300)
    } else {
        location = uri
    }
}

/**
 * Kiểm tra xem thiết bị hiện tại có hỗ trợ màn hình cảm ứng hay không.
 * @returns {boolean} Trả về `true` nếu là thiết bị cảm ứng, ngược lại trả về `false`.
 */
function isTouchDevice() {
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
}

/**
 * Lấy giá trị của một tham số (query parameter) từ URL hiện tại.
 * @param {string} paramName Tên của tham số cần lấy.
 * @returns {string | null} Giá trị của tham số (dưới dạng chuỗi), hoặc null nếu không tìm thấy.
 */
function getQueryParam(paramName) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(paramName);
}