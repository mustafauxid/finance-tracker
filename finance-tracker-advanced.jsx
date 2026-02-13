import React, { useState, useEffect } from 'react';
import { PlusCircle, TrendingUp, TrendingDown, Wallet, Users, Calendar, PieChart, BarChart3, ArrowUpCircle, ArrowDownCircle, RefreshCw, Filter, X, Lock, Unlock, LogOut, Download, Upload, Settings, Eye, EyeOff, Mail, Shield, Cloud } from 'lucide-react';

const FinanceTrackerApp = () => {
  // Auth states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // login, signup
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  
  // PIN lock states
  const [hasPinLock, setHasPinLock] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [pin, setPin] = useState('');
  const [storedPin, setStoredPin] = useState('');
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [confirmPin, setConfirmPin] = useState('');
  
  // App states
  const [currentView, setCurrentView] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [loans, setLoans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState('month');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showPasswordInAuth, setShowPasswordInAuth] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: '',
    personName: '',
    loanType: 'lend'
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userResult = await window.storage.get('currentUser');
      const pinResult = await window.storage.get('appPin');
      
      if (userResult?.value) {
        const userData = JSON.parse(userResult.value);
        setUser(userData);
        setIsAuthenticated(true);
        
        if (pinResult?.value) {
          setStoredPin(pinResult.value);
          setHasPinLock(true);
          setIsLocked(true);
        } else {
          await loadUserData(userData.email);
        }
      } else {
        setShowAuthModal(true);
      }
    } catch (error) {
      console.log('First time user');
      setShowAuthModal(true);
    }
    setIsLoading(false);
  };

  const loadUserData = async (userEmail) => {
    try {
      const transKey = `transactions_${userEmail}`;
      const loanKey = `loans_${userEmail}`;
      
      const transResult = await window.storage.get(transKey);
      const loanResult = await window.storage.get(loanKey);
      
      if (transResult?.value) setTransactions(JSON.parse(transResult.value));
      if (loanResult?.value) setLoans(JSON.parse(loanResult.value));
    } catch (error) {
      console.log('No existing data for user');
    }
  };

  const saveUserData = async (newTransactions, newLoans) => {
    if (!user) return;
    
    try {
      const transKey = `transactions_${user.email}`;
      const loanKey = `loans_${user.email}`;
      
      if (newTransactions !== undefined) {
        await window.storage.set(transKey, JSON.stringify(newTransactions));
      }
      if (newLoans !== undefined) {
        await window.storage.set(loanKey, JSON.stringify(newLoans));
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  // Auth functions
  const handleSignup = async () => {
    if (!authForm.email || !authForm.password || !authForm.name) {
      alert('সব তথ্য পূরণ করুন');
      return;
    }
    
    if (authForm.password.length < 6) {
      alert('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }

    try {
      const userKey = `user_${authForm.email}`;
      const existingUser = await window.storage.get(userKey);
      
      if (existingUser?.value) {
        alert('এই ইমেইল দিয়ে ইউজার আছে। লগইন করুন।');
        setAuthMode('login');
        return;
      }

      const userData = {
        email: authForm.email,
        name: authForm.name,
        password: authForm.password, // In production, this should be hashed
        createdAt: Date.now()
      };

      await window.storage.set(userKey, JSON.stringify(userData));
      await window.storage.set('currentUser', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      setShowAuthModal(false);
      setAuthForm({ email: '', password: '', name: '' });
    } catch (error) {
      alert('সাইনআপ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
    }
  };

  const handleLogin = async () => {
    if (!authForm.email || !authForm.password) {
      alert('ইমেইল এবং পাসওয়ার্ড দিন');
      return;
    }

    try {
      const userKey = `user_${authForm.email}`;
      const userResult = await window.storage.get(userKey);
      
      if (!userResult?.value) {
        alert('ইউজার খুঁজে পাওয়া যায়নি। সাইনআপ করুন।');
        setAuthMode('signup');
        return;
      }

      const userData = JSON.parse(userResult.value);
      
      if (userData.password !== authForm.password) {
        alert('ভুল পাসওয়ার্ড');
        return;
      }

      await window.storage.set('currentUser', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      setShowAuthModal(false);
      await loadUserData(userData.email);
      setAuthForm({ email: '', password: '', name: '' });
    } catch (error) {
      alert('লগইন ব্যর্থ হয়েছে');
    }
  };

  const handleSocialLogin = async (provider) => {
    // Simulated social login
    alert(`${provider} লগইন শীঘ্রই আসছে! এখন Email দিয়ে সাইনআপ করুন।`);
    
    // In production, integrate with OAuth providers:
    // Google: https://developers.google.com/identity/protocols/oauth2
    // Facebook: https://developers.facebook.com/docs/facebook-login
  };

  const handleLogout = async () => {
    if (confirm('লগআউট করতে চান?')) {
      try {
        await window.storage.delete('currentUser');
        setUser(null);
        setIsAuthenticated(false);
        setTransactions([]);
        setLoans([]);
        setShowAuthModal(true);
        setIsLocked(false);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  };

  // PIN lock functions
  const setupPin = async () => {
    if (pin.length !== 4 || confirmPin.length !== 4) {
      alert('৪ ডিজিটের PIN দিন');
      return;
    }
    
    if (pin !== confirmPin) {
      alert('PIN মিলছে না');
      return;
    }

    try {
      await window.storage.set('appPin', pin);
      setStoredPin(pin);
      setHasPinLock(true);
      setShowPinSetup(false);
      setPin('');
      setConfirmPin('');
      alert('PIN সেট হয়েছে');
    } catch (error) {
      alert('PIN সেভ করতে সমস্যা হয়েছে');
    }
  };

  const removePin = async () => {
    if (confirm('PIN লক সরাতে চান?')) {
      try {
        await window.storage.delete('appPin');
        setHasPinLock(false);
        setStoredPin('');
        setIsLocked(false);
        setPin('');
        alert('PIN লক সরানো হয়েছে');
      } catch (error) {
        alert('সমস্যা হয়েছে');
      }
    }
  };

  const verifyPin = () => {
    if (pin === storedPin) {
      setIsLocked(false);
      setPin('');
      loadUserData(user.email);
    } else {
      alert('ভুল PIN');
      setPin('');
    }
  };

  // Backup & Restore functions
  const backupToGoogleDrive = async () => {
    const backupData = {
      transactions,
      loans,
      user: { email: user.email, name: user.name },
      backupDate: new Date().toISOString(),
      version: '1.0'
    };

    const dataStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finance-backup-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    alert('ব্যাকআপ ডাউনলোড হয়েছে! এটি আপনার Google Drive এ আপলোড করুন।');
    
    // Note: Direct Google Drive integration requires OAuth setup
    // Guide: https://developers.google.com/drive/api/guides/about-sdk
  };

  const restoreFromBackup = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const backupData = JSON.parse(text);

        if (!backupData.transactions || !backupData.loans) {
          alert('ভুল ব্যাকআপ ফাইল');
          return;
        }

        if (confirm('বর্তমান ডেটা রিপ্লেস হবে। নিশ্চিত?')) {
          setTransactions(backupData.transactions);
          setLoans(backupData.loans);
          await saveUserData(backupData.transactions, backupData.loans);
          alert('ব্যাকআপ রিস্টোর সফল!');
        }
      } catch (error) {
        alert('ব্যাকআপ রিড করতে সমস্যা');
      }
    };
    input.click();
  };

  // Transaction functions (same as before)
  const addTransaction = async () => {
    if (!formData.amount || !formData.category) {
      alert('সব তথ্য পূরণ করুন');
      return;
    }

    const newTransaction = {
      id: Date.now().toString(),
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      date: formData.date,
      type: formData.type,
      timestamp: Date.now()
    };

    const updated = [...transactions, newTransaction];
    setTransactions(updated);
    await saveUserData(updated, undefined);
    resetForm();
    setShowAddModal(false);
  };

  const addLoan = async () => {
    if (!formData.amount || !formData.personName) {
      alert('সব তথ্য পূরণ করুন');
      return;
    }

    const newLoan = {
      id: Date.now().toString(),
      amount: parseFloat(formData.amount),
      personName: formData.personName,
      description: formData.description,
      date: formData.date,
      type: formData.loanType,
      status: 'pending',
      timestamp: Date.now()
    };

    const updated = [...loans, newLoan];
    setLoans(updated);
    await saveUserData(undefined, updated);
    resetForm();
    setShowAddModal(false);
  };

  const markLoanPaid = async (loanId) => {
    const updated = loans.map(loan => 
      loan.id === loanId ? { ...loan, status: 'paid' } : loan
    );
    setLoans(updated);
    await saveUserData(undefined, updated);
  };

  const deleteTransaction = async (id) => {
    if (confirm('ডিলিট করতে চান?')) {
      const updated = transactions.filter(t => t.id !== id);
      setTransactions(updated);
      await saveUserData(updated, undefined);
    }
  };

  const deleteLoan = async (id) => {
    if (confirm('ডিলিট করতে চান?')) {
      const updated = loans.filter(l => l.id !== id);
      setLoans(updated);
      await saveUserData(undefined, updated);
    }
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      type: '',
      personName: '',
      loanType: 'lend'
    });
  };

  const openModal = (type) => {
    setModalType(type);
    setFormData({ ...formData, type: type === 'loan' ? formData.loanType : type });
    setShowAddModal(true);
  };

  // Statistics
  const getFilteredTransactions = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return transactions.filter(t => {
      const tDate = new Date(t.date);
      if (filterPeriod === 'month') {
        return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
      } else if (filterPeriod === 'year') {
        return tDate.getFullYear() === currentYear;
      }
      return true;
    });
  };

  const filteredTrans = getFilteredTransactions();
  const totalIncome = filteredTrans.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filteredTrans.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;
  
  const pendingLoans = loans.filter(l => l.status === 'pending');
  const toLend = pendingLoans.filter(l => l.type === 'lend').reduce((sum, l) => sum + l.amount, 0);
  const toBorrow = pendingLoans.filter(l => l.type === 'borrow').reduce((sum, l) => sum + l.amount, 0);

  const incomeCategories = ['বেতন', 'ব্যবসা', 'ফ্রিল্যান্সিং', 'বিনিয়োগ', 'উপহার', 'অন্যান্য'];
  const expenseCategories = ['খাবার', 'বাসা ভাড়া', 'যাতায়াত', 'বিল', 'শিক্ষা', 'চিকিৎসা', 'বিনোদন', 'কেনাকাটা', 'অন্যান্য'];

  const expenseByCategory = {};
  filteredTrans.filter(t => t.type === 'expense').forEach(t => {
    expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT' }).format(amount);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-indigo-600 mb-4 inline-block"><RefreshCw size={48} /></div>
          <p className="text-gray-600">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  // Auth Modal
  if (showAuthModal && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <Wallet className="text-indigo-600" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">আর্থিক ব্যবস্থাপনা</h1>
            <p className="text-gray-600 mt-2">আপনার টাকার হিসাব সহজে রাখুন</p>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-3 rounded-lg font-medium transition ${
                authMode === 'login'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              লগইন
            </button>
            <button
              onClick={() => setAuthMode('signup')}
              className={`flex-1 py-3 rounded-lg font-medium transition ${
                authMode === 'signup'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              সাইনআপ
            </button>
          </div>

          <div className="space-y-4">
            {authMode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">নাম</label>
                <input
                  type="text"
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="আপনার নাম"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ইমেইল</label>
              <input
                type="email"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">পাসওয়ার্ড</label>
              <div className="relative">
                <input
                  type={showPasswordInAuth ? 'text' : 'password'}
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  onClick={() => setShowPasswordInAuth(!showPasswordInAuth)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPasswordInAuth ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              onClick={authMode === 'login' ? handleLogin : handleSignup}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition"
            >
              {authMode === 'login' ? 'লগইন করুন' : 'সাইনআপ করুন'}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">অথবা</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSocialLogin('Google')}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm font-medium">Google</span>
              </button>

              <button
                onClick={() => handleSocialLogin('Facebook')}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-sm font-medium">Facebook</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PIN Lock Screen
  if (isLocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <Lock className="text-indigo-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">PIN দিয়ে আনলক করুন</h2>
            <p className="text-gray-600 mt-2">৪ ডিজিটের PIN এন্টার করুন</p>
          </div>

          <input
            type="password"
            inputMode="numeric"
            maxLength="4"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            className="w-full px-4 py-4 text-center text-2xl tracking-widest border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4"
            placeholder="••••"
            autoFocus
          />

          <button
            onClick={verifyPin}
            disabled={pin.length !== 4}
            className="w-full bg-indigo-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-indigo-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            আনলক করুন
          </button>
        </div>
      </div>
    );
  }

  // Settings Modal
  if (showSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">সেটিংস</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* User Info */}
            <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{user?.name}</p>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* PIN Lock */}
            <div className="space-y-4 mb-6">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Shield size={20} />
                সিকিউরিটি
              </h3>
              
              {!hasPinLock ? (
                <button
                  onClick={() => setShowPinSetup(true)}
                  className="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition flex items-center justify-center gap-2"
                >
                  <Lock size={20} />
                  PIN লক চালু করুন
                </button>
              ) : (
                <button
                  onClick={removePin}
                  className="w-full bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition flex items-center justify-center gap-2"
                >
                  <Unlock size={20} />
                  PIN লক সরান
                </button>
              )}
            </div>

            {/* Backup & Restore */}
            <div className="space-y-4 mb-6">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Cloud size={20} />
                ব্যাকআপ ও রিস্টোর
              </h3>
              
              <button
                onClick={backupToGoogleDrive}
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition flex items-center justify-center gap-2"
              >
                <Download size={20} />
                ব্যাকআপ ডাউনলোড করুন
              </button>

              <button
                onClick={restoreFromBackup}
                className="w-full bg-purple-500 text-white py-3 rounded-lg font-medium hover:bg-purple-600 transition flex items-center justify-center gap-2"
              >
                <Upload size={20} />
                ব্যাকআপ থেকে রিস্টোর করুন
              </button>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  💡 টিপস: ব্যাকআপ ফাইল আপনার Google Drive এ সেভ করে রাখুন। পরে যেকোনো সময় রিস্টোর করতে পারবেন।
                </p>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition flex items-center justify-center gap-2"
            >
              <LogOut size={20} />
              লগআউট
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PIN Setup Modal
  if (showPinSetup) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <Lock className="text-indigo-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">PIN সেট করুন</h2>
            <p className="text-gray-600 mt-2">৪ ডিজিটের PIN তৈরি করুন</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">নতুন PIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength="4"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 text-center text-xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">PIN নিশ্চিত করুন</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength="4"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 text-center text-xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••"
              />
            </div>

            <button
              onClick={setupPin}
              disabled={pin.length !== 4 || confirmPin.length !== 4}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              PIN সেভ করুন
            </button>

            <button
              onClick={() => {
                setShowPinSetup(false);
                setPin('');
                setConfirmPin('');
              }}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              বাতিল
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main App UI (same as before but with settings button)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Wallet size={32} />
              আর্থিক ব্যবস্থাপনা
            </h1>
            <p className="text-indigo-100 mt-1">স্বাগতম, {user?.name}!</p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition"
          >
            <Settings size={24} />
          </button>
        </div>
      </div>

      {/* Period Filter */}
      <div className="p-4 bg-white shadow-sm flex gap-2 overflow-x-auto">
        {[
          { value: 'month', label: 'এই মাস', icon: Calendar },
          { value: 'year', label: 'এই বছর', icon: Calendar },
          { value: 'all', label: 'সব সময়', icon: Filter }
        ].map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setFilterPeriod(value)}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 whitespace-nowrap transition ${
              filterPeriod === value
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="p-4">
        {currentView === 'dashboard' && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUpCircle size={24} />
                  <span className="text-sm opacity-90">আয়</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(totalIncome)}</p>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-pink-600 text-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowDownCircle size={24} />
                  <span className="text-sm opacity-90">খরচ</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(totalExpense)}</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet size={24} />
                  <span className="text-sm opacity-90">ব্যালেন্স</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(balance)}</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-amber-600 text-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={24} />
                  <span className="text-sm opacity-90">লেনদেন</span>
                </div>
                <div className="text-sm">
                  <p>পাবো: {formatCurrency(toLend)}</p>
                  <p>দিতে হবে: {formatCurrency(toBorrow)}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <button
                onClick={() => openModal('income')}
                className="bg-green-500 text-white p-4 rounded-xl shadow-lg hover:bg-green-600 transition flex flex-col items-center gap-2"
              >
                <TrendingUp size={28} />
                <span className="text-sm font-medium">আয় যোগ করুন</span>
              </button>

              <button
                onClick={() => openModal('expense')}
                className="bg-red-500 text-white p-4 rounded-xl shadow-lg hover:bg-red-600 transition flex flex-col items-center gap-2"
              >
                <TrendingDown size={28} />
                <span className="text-sm font-medium">খরচ যোগ করুন</span>
              </button>

              <button
                onClick={() => openModal('loan')}
                className="bg-orange-500 text-white p-4 rounded-xl shadow-lg hover:bg-orange-600 transition flex flex-col items-center gap-2"
              >
                <Users size={28} />
                <span className="text-sm font-medium">লেনদেন</span>
              </button>
            </div>

            {/* Expense by Category */}
            {Object.keys(expenseByCategory).length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <PieChart size={20} />
                  বিভাগ অনুযায়ী খরচ
                </h2>
                <div className="space-y-3">
                  {Object.entries(expenseByCategory)
                    .sort((a, b) => b[1] - a[1])
                    .map(([category, amount]) => {
                      const percentage = ((amount / totalExpense) * 100).toFixed(1);
                      return (
                        <div key={category}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700">{category}</span>
                            <span className="text-gray-600">{formatCurrency(amount)} ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-indigo-600 h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h2 className="text-lg font-bold text-gray-800 mb-4">সাম্প্রতিক লেনদেন</h2>
              {filteredTrans.length === 0 ? (
                <p className="text-gray-500 text-center py-8">এখনও কোনো লেনদেন নেই</p>
              ) : (
                <div className="space-y-3">
                  {filteredTrans.slice(-10).reverse().map(t => (
                    <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                          {t.type === 'income' ? (
                            <TrendingUp size={20} className="text-green-600" />
                          ) : (
                            <TrendingDown size={20} className="text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{t.category}</p>
                          <p className="text-xs text-gray-500">{formatDate(t.date)}</p>
                          {t.description && <p className="text-xs text-gray-600">{t.description}</p>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                        </p>
                        <button
                          onClick={() => deleteTransaction(t.id)}
                          className="text-red-500 text-xs mt-1 hover:underline"
                        >
                          মুছুন
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {currentView === 'loans' && (
          <div className="space-y-4">
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => openModal('loan')}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl shadow-lg hover:bg-indigo-700 transition font-medium"
              >
                <PlusCircle className="inline mr-2" size={20} />
                নতুন লেনদেন
              </button>
            </div>

            {/* Pending Loans */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h2 className="text-lg font-bold text-gray-800 mb-4">চলমান লেনদেন</h2>
              {pendingLoans.length === 0 ? (
                <p className="text-gray-500 text-center py-8">কোনো চলমান লেনদেন নেই</p>
              ) : (
                <div className="space-y-3">
                  {pendingLoans.map(loan => (
                    <div key={loan.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-gray-800">{loan.personName}</p>
                          <p className="text-xs text-gray-500">{formatDate(loan.date)}</p>
                          {loan.description && <p className="text-sm text-gray-600 mt-1">{loan.description}</p>}
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-lg ${loan.type === 'lend' ? 'text-green-600' : 'text-orange-600'}`}>
                            {formatCurrency(loan.amount)}
                          </p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            loan.type === 'lend' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {loan.type === 'lend' ? 'পাবো' : 'দিতে হবে'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => markLoanPaid(loan.id)}
                          className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition"
                        >
                          ✓ পরিশোধ হয়েছে
                        </button>
                        <button
                          onClick={() => deleteLoan(loan.id)}
                          className="px-4 bg-red-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition"
                        >
                          মুছুন
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Paid Loans */}
            {loans.filter(l => l.status === 'paid').length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-4">
                <h2 className="text-lg font-bold text-gray-800 mb-4">পরিশোধিত লেনদেন</h2>
                <div className="space-y-3">
                  {loans.filter(l => l.status === 'paid').map(loan => (
                    <div key={loan.id} className="p-3 bg-gray-50 rounded-lg opacity-60">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium text-gray-700">{loan.personName}</p>
                          <p className="text-xs text-gray-500">{formatDate(loan.date)}</p>
                        </div>
                        <p className="font-bold text-gray-600">{formatCurrency(loan.amount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-t-3xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {modalType === 'income' && 'আয় যোগ করুন'}
                {modalType === 'expense' && 'খরচ যোগ করুন'}
                {modalType === 'loan' && 'লেনদেন যোগ করুন'}
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {modalType === 'loan' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ধরন</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFormData({ ...formData, loanType: 'lend' })}
                      className={`flex-1 py-3 rounded-lg font-medium transition ${
                        formData.loanType === 'lend'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      আমি দিয়েছি (পাবো)
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, loanType: 'borrow' })}
                      className={`flex-1 py-3 rounded-lg font-medium transition ${
                        formData.loanType === 'borrow'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      আমি নিয়েছি (দিবো)
                    </button>
                  </div>
                </div>
              )}

              {modalType === 'loan' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ব্যক্তির নাম *</label>
                  <input
                    type="text"
                    value={formData.personName}
                    onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="নাম লিখুন"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">টাকার পরিমাণ *</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="০"
                />
              </div>

              {modalType !== 'loan' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">বিভাগ *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">বিভাগ নির্বাচন করুন</option>
                    {(modalType === 'income' ? incomeCategories : expenseCategories).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">তারিখ</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">বিবরণ (ঐচ্ছিক)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows="2"
                  placeholder="অতিরিক্ত তথ্য"
                />
              </div>

              <button
                onClick={modalType === 'loan' ? addLoan : addTransaction}
                className="w-full bg-indigo-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-indigo-700 transition shadow-lg"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around p-3">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition ${
              currentView === 'dashboard'
                ? 'text-indigo-600 bg-indigo-50'
                : 'text-gray-600'
            }`}
          >
            <BarChart3 size={24} />
            <span className="text-xs font-medium">ড্যাশবোর্ড</span>
          </button>

          <button
            onClick={() => setCurrentView('loans')}
            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition ${
              currentView === 'loans'
                ? 'text-indigo-600 bg-indigo-50'
                : 'text-gray-600'
            }`}
          >
            <Users size={24} />
            <span className="text-xs font-medium">লেনদেন</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FinanceTrackerApp;
