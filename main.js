// main.js - الملف الرئيسي للتطبيق

class AIDetector {
    constructor() {
        this.currentBalance = 5;
        this.maxDailyBalance = 5;
        this.textInput = document.getElementById('textInput');
        this.analyzeBtn = document.getElementById('analyzeBtn');
        this.resultsCard = document.getElementById('resultsCard');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.dailyLimitMessage = document.getElementById('dailyLimitMessage');
        this.upgradeBtn = document.getElementById('upgradeBtn');
        
        this.initialize();
        this.setupEventListeners();
        this.loadBalance();
        this.updateStats();
        this.generateParticles();
    }
    
    initialize() {
        // تهيئة AOS
        AOS.init({
            once: true,
            mirror: false,
            duration: 800
        });
        
        // تحديث عداد الكلمات
        this.updateCounts();
        
        // تحميل التاريخ
        this.loadHistory();
    }
    
    setupEventListeners() {
        // زر التحليل
        this.analyzeBtn.addEventListener('click', () => this.analyze());
        
        // أزرار النص
        document.getElementById('pasteBtn').addEventListener('click', () => this.pasteText());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearText());
        document.getElementById('exampleBtn').addEventListener('click', () => this.loadExample());
        
        // تغيير التبويبات
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.currentTarget.dataset.tab));
        });
        
        // رفع الملفات
        this.setupFileUpload();
        
        // جلب من رابط
        document.getElementById('fetchBtn').addEventListener('click', () => this.fetchFromUrl());
        
        // أزرار النتائج
        document.getElementById('copyResult').addEventListener('click', () => this.copyResult());
        document.getElementById('newAnalysis').addEventListener('click', () => this.newAnalysis());
        document.getElementById('shareResults').addEventListener('click', () => this.shareResults());
        
        // زر الترقية
        this.upgradeBtn.addEventListener('click', () => this.showUpgradeMessage());
        
        // زر المحاولة غداً
        document.getElementById('tryAgainBtn').addEventListener('click', () => this.closeLimitMessage());
        
        // إدخال النص
        this.textInput.addEventListener('input', () => this.updateCounts());
    }
    
    setupFileUpload() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const removeFile = document.getElementById('removeFile');
        
        uploadArea.addEventListener('click', () => fileInput.click());
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file) this.processFile(file);
        });
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) this.processFile(file);
        });
        
        removeFile.addEventListener('click', () => {
            fileInput.value = '';
            document.getElementById('uploadArea').style.display = 'block';
            document.getElementById('filePreview').style.display = 'none';
        });
    }
    
    async processFile(file) {
        if (!file.type.startsWith('text/') && !file.name.endsWith('.txt')) {
            this.showToast('نوع الملف غير مدعوم', 'error');
            return;
        }
        
        if (file.size > 10 * 1024 * 1024) {
            this.showToast('حجم الملف كبير جداً (الحد الأقصى 10MB)', 'error');
            return;
        }
        
        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('filePreview').style.display = 'flex';
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileSize').textContent = this.formatFileSize(file.size);
        
        const text = await this.readFile(file);
        localStorage.setItem('uploadedText', text);
        this.showToast('تم رفع الملف بنجاح', 'success');
    }
    
    readFile(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsText(file);
        });
    }
    
    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
    
    async fetchFromUrl() {
        const url = document.getElementById('urlInput').value;
        if (!url) {
            this.showToast('الرجاء إدخال رابط', 'error');
            return;
        }
        
        this.showLoading(true);
        
        try {
            await new Promise(r => setTimeout(r, 1000));
            const dummyText = 'هذا نص تجريبي تم جلبه من الرابط. في النسخة الحقيقية، سيتم جلب المحتوى الفعلي من الرابط.';
            localStorage.setItem('urlText', dummyText);
            
            const preview = document.getElementById('urlPreview');
            preview.style.display = 'block';
            preview.innerHTML = `
                <p>${dummyText.substring(0, 100)}...</p>
                <button class="use-text" onclick="document.getElementById('textInput').value = '${dummyText}'; document.querySelector('[data-tab=\"text\"]').click(); this.parentElement.style.display='none'">
                    استخدم هذا النص
                </button>
            `;
            
            this.showToast('تم جلب النص بنجاح', 'success');
        } catch (error) {
            this.showToast('فشل جلب الرابط', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    switchTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.toggle('active', pane.id === tab + 'Tab');
        });
    }
    
    updateCounts() {
        const text = this.textInput.value;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const chars = text.length;
        
        document.getElementById('wordCount').textContent = words;
        document.getElementById('charCount').textContent = chars;
    }
    
    pasteText() {
        navigator.clipboard.readText().then(text => {
            this.textInput.value = text;
            this.updateCounts();
            this.showToast('تم لصق النص', 'success');
        }).catch(() => {
            this.showToast('لا يمكن الوصول للحافظة', 'error');
        });
    }
    
    clearText() {
        this.textInput.value = '';
        this.updateCounts();
        this.showToast('تم مسح النص', 'info');
    }
    
    loadExample() {
        this.textInput.value = 'الذكاء الاصطناعي هو فرع من فروع علوم الحاسوب يهدف إلى إنشاء آلات وأجهزة ذكية قادرة على محاكاة القدرات البشرية مثل التعلم والاستدلال وحل المشكلات. في السنوات الأخيرة، شهدنا تطوراً هائلاً في هذا المجال مع ظهور نماذج لغوية كبيرة مثل GPT-4 التي تستطيع كتابة نصوص تبدو وكأنها من صنع الإنسان.';
        this.updateCounts();
        this.showToast('تم تحميل نص تجريبي', 'info');
    }
    
    async analyze() {
        // التحقق من الرصيد
        if (this.currentBalance <= 0) {
            this.showLimitMessage();
            return;
        }
        
        const text = this.getInputText();
        if (!text || text.length < 10) {
            this.showToast('الرجاء إدخال نص أطول (10 أحرف على الأقل)', 'error');
            return;
        }
        
        this.showLoading(true);
        
        try {
            await this.simulateAnalysis();
            const results = await this.performAnalysis(text);
            this.displayResults(results);
            this.useBalance();
            this.addToHistory(text, results);
            this.updateStats();
            this.showToast('تم التحليل بنجاح', 'success');
        } catch (error) {
            this.showToast('فشل التحليل، حاول مرة أخرى', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    getInputText() {
        const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
        
        switch(activeTab) {
            case 'text':
                return this.textInput.value;
            case 'file':
                return localStorage.getItem('uploadedText') || '';
            case 'url':
                return localStorage.getItem('urlText') || '';
            default:
                return '';
        }
    }
    
    simulateAnalysis() {
        return new Promise((resolve) => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                if (progress >= 100) {
                    clearInterval(interval);
                    resolve();
                }
            }, 150);
        });
    }
    
    async performAnalysis(text) {
        // محاكاة تحليل متقدم
        return new Promise((resolve) => {
            setTimeout(() => {
                const aiProb = Math.floor(Math.random() * 40) + 60; // 60-100
                const humanProb = 100 - aiProb;
                
                resolve({
                    aiProbability: aiProb,
                    humanProbability: humanProb,
                    repetition: Math.floor(Math.random() * 30) + 20,
                    fluency: Math.floor(Math.random() * 30) + 60,
                    vocabulary: Math.floor(Math.random() * 30) + 50,
                    confidence: 98.5,
                    model: 'GPT-4',
                    patterns: Math.floor(Math.random() * 20) + 15
                });
            }, 500);
        });
    }
    
    displayResults(results) {
        // تحديث النتائج
        document.getElementById('gaugeFill').style.width = `${results.aiProbability}%`;
        document.getElementById('gaugeValue').textContent = `${results.aiProbability}%`;
        
        document.getElementById('aiFill').style.width = `${results.aiProbability}%`;
        document.getElementById('humanFill').style.width = `${results.humanProbability}%`;
        
        document.getElementById('aiValue').textContent = `${results.aiProbability}%`;
        document.getElementById('humanValue').textContent = `${results.humanProbability}%`;
        
        document.getElementById('repetitionBar').style.width = `${results.repetition}%`;
        document.getElementById('repetitionValue').textContent = `${results.repetition}%`;
        
        document.getElementById('fluencyBar').style.width = `${results.fluency}%`;
        document.getElementById('fluencyValue').textContent = `${results.fluency}%`;
        
        document.getElementById('vocabularyBar').style.width = `${results.vocabulary}%`;
        document.getElementById('vocabularyValue').textContent = `${results.vocabulary}%`;
        
        // تحديث النص الأساسي
        const resultLabel = document.getElementById('resultLabel');
        const icon = resultLabel.querySelector('i');
        const text = resultLabel.querySelector('span');
        
        if (results.aiProbability > 70) {
            icon.className = 'fas fa-robot';
            text.textContent = 'نص مكتوب بالذكاء الاصطناعي';
        } else if (results.aiProbability > 40) {
            icon.className = 'fas fa-code-merge';
            text.textContent = 'نص مختلط';
        } else {
            icon.className = 'fas fa-user';
            text.textContent = 'نص بشري';
        }
        
        // عرض النتائج
        this.resultsCard.style.display = 'block';
        this.resultsCard.scrollIntoView({ behavior: 'smooth' });
    }
    
    loadBalance() {
        const saved = localStorage.getItem('dailyBalance');
        const lastReset = localStorage.getItem('lastReset');
        const today = new Date().toDateString();
        
        if (lastReset !== today) {
            this.currentBalance = this.maxDailyBalance;
            localStorage.setItem('dailyBalance', this.currentBalance);
            localStorage.setItem('lastReset', today);
        } else if (saved) {
            this.currentBalance = parseInt(saved);
        }
        
        this.updateBalanceDisplay();
    }
    
    useBalance() {
        if (this.currentBalance > 0) {
            this.currentBalance--;
            localStorage.setItem('dailyBalance', this.currentBalance);
            this.updateBalanceDisplay();
            
            if (this.currentBalance <= 2) {
                this.showLowBalanceWarning();
            }
        }
    }
    
    updateBalanceDisplay() {
        document.getElementById('balanceAmount').textContent = this.currentBalance;
        const percentage = (this.currentBalance / this.maxDailyBalance) * 100;
        document.getElementById('progressFill').style.width = `${percentage}%`;
    }
    
    showLimitMessage() {
        this.dailyLimitMessage.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    closeLimitMessage() {
        this.dailyLimitMessage.style.display = 'none';
        document.body.style.overflow = '';
    }
    
    showUpgradeMessage() {
        this.showLimitMessage();
    }
    
    showLowBalanceWarning() {
        this.showToast(`لديك ${this.currentBalance} تحاليل متبقية فقط`, 'warning');
    }
    
    addToHistory(text, results) {
        const history = JSON.parse(localStorage.getItem('analysisHistory')) || [];
        const item = {
            id: Date.now(),
            text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
            result: results.aiProbability > 70 ? 'AI' : (results.aiProbability > 40 ? 'Mixed' : 'Human'),
            probability: results.aiProbability,
            date: new Date().toLocaleString('ar-EG')
        };
        
        history.unshift(item);
        if (history.length > 10) history.pop();
        
        localStorage.setItem('analysisHistory', JSON.stringify(history));
        this.displayHistory();
    }
    
    loadHistory() {
        this.displayHistory();
    }
    
    displayHistory() {
        const history = JSON.parse(localStorage.getItem('analysisHistory')) || [];
        const list = document.getElementById('historyList');
        
        if (history.length === 0) {
            list.innerHTML = '<p class="empty-history">لا توجد تحاليل سابقة</p>';
            return;
        }
        
        list.innerHTML = history.map(item => `
            <div class="history-item">
                <div class="history-text">${item.text}</div>
                <div class="history-result ${item.result.toLowerCase()}">
                    <span>${item.result}</span>
                    <span>${item.probability}%</span>
                </div>
                <div class="history-date">${item.date}</div>
            </div>
        `).join('');
    }
    
    clearHistory() {
        localStorage.removeItem('analysisHistory');
        this.displayHistory();
        this.showToast('تم مسح التاريخ', 'info');
    }
    
    copyResult() {
        const result = document.getElementById('resultLabel').querySelector('span').textContent;
        const probability = document.getElementById('gaugeValue').textContent;
        const text = `نتيجة التحليل: ${result} (${probability})`;
        
        navigator.clipboard.writeText(text);
        this.showToast('تم نسخ النتيجة', 'success');
    }
    
    newAnalysis() {
        this.resultsCard.style.display = 'none';
        this.textInput.value = '';
        this.updateCounts();
        this.switchTab('text');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    shareResults() {
        if (navigator.share) {
            navigator.share({
                title: 'نتيجة تحليل AI Detector',
                text: document.getElementById('resultLabel').querySelector('span').textContent,
                url: window.location.href
            }).catch(() => {
                this.copyResult();
            });
        } else {
            this.copyResult();
        }
    }
    
    updateStats() {
        // تحديث الإحصائيات الوهمية
        document.getElementById('totalScans').textContent = '1,247,893';
        document.getElementById('aiDetected').textContent = '823,456';
        document.getElementById('activeUsers').textContent = '50,234';
    }
    
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'info-circle';
        if (type === 'success') icon = 'check-circle';
        if (type === 'error') icon = 'exclamation-circle';
        if (type === 'warning') icon = 'exclamation-triangle';
        
        toast.innerHTML = `<i class="fas fa-${icon}"></i>${message}`;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'toastSlideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    showLoading(show) {
        this.loadingOverlay.style.display = show ? 'flex' : 'none';
    }
    
    generateParticles() {
        const particles = document.getElementById('particles');
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 3}px;
                height: ${Math.random() * 3}px;
                background: rgba(255, 0, 0, ${Math.random() * 0.5});
                border-radius: 50%;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                animation: floatParticle ${Math.random() * 10 + 5}s linear infinite;
            `;
            particles.appendChild(particle);
        }
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes floatParticle {
                from { transform: translateY(0) translateX(0); }
                to { transform: translateY(-100px) translateX(${Math.random() * 50 - 25}px); }
            }
        `;
        document.head.appendChild(style);
    }
}

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AIDetector();
    
    // زر مسح التاريخ
    document.getElementById('clearHistory').addEventListener('click', () => {
        if (confirm('هل أنت متأكد من مسح كل التحاليل السابقة؟')) {
            window.app.clearHistory();
        }
    });
});