// analyzer.js - محرك تحليل النصوص المتقدم

class TextAnalyzer {
    constructor() {
        this.models = {
            gpt4: 'GPT-4',
            claude: 'Claude',
            gemini: 'Gemini',
            llama: 'LLaMA'
        };
        
        this.patterns = {
            repetition: /(.{10,})\1+/g,
            formalWords: ['بالتالي', 'وعليه', 'بناءً على', 'نظراً ل', 'حيث أن', 'بما أن'],
            informalWords: ['يعني', 'زي', 'كدة', 'اه', 'طبعاً', 'بصراحة'],
            complexSentences: /[،,].{30,}[،,]/g
        };
    }
    
    async analyze(text) {
        const features = {
            length: text.length,
            words: this.countWords(text),
            sentences: this.countSentences(text),
            avgWordLength: this.averageWordLength(text),
            vocabularyRichness: this.vocabularyRichness(text),
            repetitionScore: this.repetitionScore(text),
            formalityScore: this.formalityScore(text),
            complexityScore: this.complexityScore(text),
            punctuationScore: this.punctuationScore(text),
            uniqueWords: this.uniqueWords(text)
        };
        
        const aiProbability = this.calculateAIProbability(features);
        const confidence = this.calculateConfidence(features);
        
        return {
            aiProbability,
            humanProbability: 100 - aiProbability,
            features,
            confidence,
            model: this.detectPossibleModel(features)
        };
    }
    
    countWords(text) {
        return text.trim().split(/\s+/).length;
    }
    
    countSentences(text) {
        return (text.match(/[.!?؟]+/g) || []).length || 1;
    }
    
    averageWordLength(text) {
        const words = text.split(/\s+/);
        const totalLength = words.reduce((sum, word) => sum + word.length, 0);
        return totalLength / words.length;
    }
    
    vocabularyRichness(text) {
        const words = text.toLowerCase().split(/\s+/);
        const uniqueWords = new Set(words);
        return (uniqueWords.size / words.length) * 100;
    }
    
    repetitionScore(text) {
        const matches = text.match(this.patterns.repetition) || [];
        return Math.min(matches.length * 10, 100);
    }
    
    formalityScore(text) {
        const words = text.split(/\s+/);
        let formalCount = 0;
        let informalCount = 0;
        
        words.forEach(word => {
            if (this.patterns.formalWords.includes(word)) formalCount++;
            if (this.patterns.informalWords.includes(word)) informalCount++;
        });
        
        return (formalCount / (formalCount + informalCount + 1)) * 100;
    }
    
    complexityScore(text) {
        const complexSentences = (text.match(this.patterns.complexSentences) || []).length;
        const totalSentences = this.countSentences(text);
        return (complexSentences / totalSentences) * 100;
    }
    
    punctuationScore(text) {
        const punctuation = (text.match(/[.,!?;:،؟]/g) || []).length;
        const words = this.countWords(text);
        return (punctuation / words) * 100;
    }
    
    uniqueWords(text) {
        const words = text.toLowerCase().split(/\s+/);
        return new Set(words).size;
    }
    
    calculateAIProbability(features) {
        let score = 50;
        
        // خوارزميات الكشف
        if (features.vocabularyRichness < 40) score += 15;
        if (features.repetitionScore > 30) score += 20;
        if (features.formalityScore > 70) score += 15;
        if (features.complexityScore > 50) score += 10;
        if (features.punctuationScore > 15) score += 10;
        if (features.avgWordLength > 6) score += 10;
        
        return Math.min(Math.max(score, 0), 100);
    }
    
    calculateConfidence(features) {
        let confidence = 85;
        
        if (features.length > 500) confidence += 10;
        if (features.words > 100) confidence += 5;
        if (features.uniqueWords > 50) confidence += 5;
        
        return Math.min(confidence, 99);
    }
    
    detectPossibleModel(features) {
        if (features.formalityScore > 80 && features.complexityScore > 60) {
            return this.models.gpt4;
        } else if (features.vocabularyRichness > 60) {
            return this.models.claude;
        } else if (features.repetitionScore < 20) {
            return this.models.gemini;
        } else {
            return this.models.llama;
        }
    }
    
    getSuggestions(text, results) {
        const suggestions = [];
        
        if (results.aiProbability > 70) {
            suggestions.push('أضف المزيد من الأمثلة الشخصية');
            suggestions.push('استخدم تعابير أقل رسمية');
            suggestions.push('نوع في أسلوب الكتابة');
            suggestions.push('أضف مشاعرك الشخصية');
        }
        
        if (results.features.repetitionScore > 30) {
            suggestions.push('تجنب تكرار نفس الكلمات');
            suggestions.push('استخدم مرادفات أكثر');
        }
        
        if (results.features.vocabularyRichness < 40) {
            suggestions.push('زيد من تنوع المفردات');
            suggestions.push('استخدم كلمات أكثر ثراءً');
        }
        
        return suggestions;
    }
}

const analyzer = new TextAnalyzer();