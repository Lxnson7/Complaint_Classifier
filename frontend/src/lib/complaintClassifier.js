const categoryKeywords = {
  'Payment Issue': ['charged', 'charge', 'payment', 'billing', 'invoice', 'transaction', 'card', 'debit', 'credit', 'money', 'amount', 'fee', 'price'],
  'Delivery Issue': ['delivery', 'shipping', 'arrived', 'package', 'tracking', 'courier', 'delayed', 'late', 'stuck', 'transit', 'shipped'],
  'Product Defect': ['broken', 'defect', 'damaged', 'not working', 'faulty', 'quality', 'crack', 'screen', 'malfunction', 'defective'],
  'Refund Request': ['refund', 'money back', 'return', 'cancelled', 'cancel', 'reimburse', 'compensation'],
  'Account Problem': ['account', 'login', 'password', 'access', 'locked', 'reset', 'profile', 'username', 'email', 'sign in'],
  'Fraud': ['fraud', 'unauthorized', 'scam', 'suspicious', 'stolen', 'hack', 'security', 'identity'],
  'General Query': ['question', 'inquiry', 'information', 'help', 'support', 'how to', 'where', 'when']
};

const priorityKeywords = {
  critical: ['fraud', 'unauthorized', 'stolen', 'security', 'identity', 'hack', 'urgent', 'immediately', 'emergency'],
  high: ['refund', 'money back', 'broken', 'defect', 'not working', 'damaged', 'compensation'],
  medium: ['delayed', 'late', 'stuck', 'waiting', 'problem', 'issue'],
  low: ['question', 'inquiry', 'information', 'help', 'how to']
};

export function classifyComplaint(text) {
  const lowerText = text.toLowerCase();
  
  const scores = {};
  Object.keys(categoryKeywords).forEach(cat => {
    scores[cat] = { score: 0, keywords: [] };
  });

  Object.entries(categoryKeywords).forEach(([category, keywords]) => {
    keywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        scores[category].score += 1;
        scores[category].keywords.push(keyword);
      }
    });
  });

  let maxScore = 0;
  let bestCategory = 'General Query';
  let matchedKeywords = [];

  Object.entries(scores).forEach(([category, data]) => {
    if (data.score > maxScore) {
      maxScore = data.score;
      bestCategory = category;
      matchedKeywords = data.keywords;
    }
  });

  const confidence = Math.min(0.95, 0.5 + (maxScore / 10) * 0.45);

  let priority = 'Medium';
  for (const keyword of priorityKeywords.critical) {
    if (lowerText.includes(keyword)) {
      priority = 'Critical';
      break;
    }
  }

  if (priority === 'Medium') {
    for (const keyword of priorityKeywords.high) {
      if (lowerText.includes(keyword)) {
        priority = 'High';
        break;
      }
    }
  }

  if (priority === 'Medium') {
    for (const keyword of priorityKeywords.low) {
      if (lowerText.includes(keyword)) {
        priority = 'Low';
        break;
      }
    }
  }

  return {
    category: bestCategory,
    confidence,
    priority,
    keywordsMatched: [...new Set(matchedKeywords)]
  };
}
