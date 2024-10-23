document.addEventListener('DOMContentLoaded', function() {
    const mapPoints = document.querySelectorAll('.map-point');
    
    mapPoints.forEach(point => {
        point.addEventListener('mouseenter', function() {
            const info = this.querySelector('.point-info');
            const rect = this.getBoundingClientRect();
            const container = document.querySelector('.map-container').getBoundingClientRect();
            
            if (rect.left + info.offsetWidth > container.right) {
                info.style.right = '20px';
                info.style.left = 'auto';
            } else {
                info.style.left = '20px';
                info.style.right = 'auto';
            }
            
            if (rect.top + info.offsetHeight > container.bottom) {
                info.style.bottom = '20px';
                info.style.top = 'auto';
            } else {
                info.style.top = '20px';
                info.style.bottom = 'auto';
            }
        });
    });
});
