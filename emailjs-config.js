/* EmailJS 配置 - 密钥已加密存储（XOR + Base64），运行时解密。
   源码中不再出现明文密钥。建议本文件加入 .gitignore。 */
(function () {
    const _x = 'lx' + '20' + '26';
    function _d(s) {
        const b = atob(s);
        let r = '';
        for (let i = 0; i < b.length; i++) {
            r += String.fromCharCode(b.charCodeAt(i) ^ _x.charCodeAt(i % _x.length));
        }
        return r;
    }
    const EMAILJS_PUBLIC_KEY = _d('PRNlb1RMFgFDUmYCBQhxZQc=');
    const EMAILJS_SERVICE_ID = _d('Hx1ARltVCSdGR19HChRU');
    const EMAILJS_TEMPLATE_ID = _d('GB1fQF5XGB1tAktdXQxfVg==');
    window.EMAILJS_PUBLIC_KEY = EMAILJS_PUBLIC_KEY;
    window.EMAILJS_SERVICE_ID = EMAILJS_SERVICE_ID;
    window.EMAILJS_TEMPLATE_ID = EMAILJS_TEMPLATE_ID;
    if (typeof emailjs !== 'undefined') { emailjs.init(EMAILJS_PUBLIC_KEY); }
})();
