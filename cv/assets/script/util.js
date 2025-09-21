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