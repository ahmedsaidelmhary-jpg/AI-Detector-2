// balance.js - نظام إدارة الرصيد المتقدم

class BalanceManager {
    constructor() {
        this.dailyLimit = 5;
        this.currentBalance = 5;
        this.premium = false;
        this.lastReset = null;
        
        this.initialize();
    }
    
    initialize() {
        this.loadFromStorage();
        this.checkDailyReset();
        this.setupAutoReset();
        this.setupEventListeners();
    }
    
    loadFromStorage() {
        const saved = localStorage.getItem('aiDetectorBalance');
        if (saved) {
            const data = JSON.parse(saved);
            this.currentBalance = data.balance || 5;
            this.premium = data.premium || false;
            this.lastReset = data.lastReset || new Date().toDateString();
        }
    }
    
    saveToStorage() {
        localStorage.setItem('aiDetectorBalance', JSON.stringify({
            balance: this.currentBalance,
            premium: this.premium,
            lastReset: this.lastReset
        }));
    }
    
    checkDailyReset() {
        const today = new Date().toDateString();
        if (this.lastReset !== today && !this.premium) {
            this.currentBalance = this.dailyLimit;
            this.lastReset = today;
            this.saveToStorage();
            
            // إظهار إشعار
            this.showNotification('تم تجديد رصيدك اليومي! 5 تحاليل مجانية');
        }
    }
    
    setupAutoReset() {
        setInterval(() => {
            this.checkDailyReset();
        }, 3600000); // كل ساعة
    }
    
    setupEventListeners() {
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.checkDailyReset();
            }
        });
    }
    
    useBalance() {
        if (this.premium) return true;
        
        if (this.currentBalance > 0) {
            this.currentBalance--;
            this.saveToStorage();
            return true;
        }
        
        this.showOutOfBalance();
        return false;
    }
    
    addBalance(amount) {
        this.currentBalance += amount;
        this.saveToStorage();
        this.showNotification(`تم إضافة ${amount} تحاليل إلى رصيدك`);
    }
    
    upgradeToPremium() {
        this.premium = true;
        this.currentBalance = 999999;
        this.saveToStorage();
        this.showNotification('🎉 تهانينا! أنت الآن عضو Premium');
    }
    
    showOutOfBalance() {
        const message = document.getElementById('dailyLimitMessage');
        if (message) {
            message.style.display = 'flex';
        }
    }
    
    showNotification(message) {
        if (window.app) {
            window.app.showToast(message, 'info');
        }
    }
}

// تهيئة مدير الرصيد
const balanceManager = new BalanceManager();