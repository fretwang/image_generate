import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'zh' | 'en';

interface Translations {
  // Header
  header: {
    home: string;
    generate: string;
    gallery: string;
    profile: string;
    contact: string;
    signOut: string;
    availableCredits: string;
  };
  
  // Home page
  home: {
    title: string;
    subtitle: string;
    description: string;
    startCreating: string;
    creditsPerGeneration: string;
    availableCredits: string;
    imagesGenerated: string;
    creditsUsed: string;
    sessions: string;
    recentCreations: string;
    viewAll: string;
    latestPrompt: string;
    generateImages: string;
    generateDescription: string;
    rechargeCredits: string;
    rechargeDescription: string;
  };

  // Generate page
  generate: {
    title: string;
    subtitle: string;
    promptLabel: string;
    promptPlaceholder: string;
    chooseStyle: string;
    chooseRatio: string;
    chooseCount: string;
    transparentBackground: string;
    cost: string;
    credits: string;
    generating: string;
    generateImages: string;
    generatedImages: string;
    downloadAll: string;
    promptUsed: string;
    style: string;
    background: string;
    creditsUsed: string;
    normal: string;
    transparent: string;
    creatingImages: string;
    creatingDescription: string;
    preview: string;
    download: string;
    insufficientCredits: string;
    insufficientCreditsMessage: string;
  };

  // Gallery page
  gallery: {
    title: string;
    subtitle: string;
    noImages: string;
    noImagesDescription: string;
    createFirstImage: string;
    totalImages: string;
    generationSessions: string;
    creditsUsed: string;
    allImages: string;
    realistic: string;
    cartoon: string;
    oilPainting: string;
    render3d: string;
    watercolor: string;
    cyberpunk: string;
    transparentBg: string;
    newestFirst: string;
    oldestFirst: string;
    noImagesForFilter: string;
    preview: string;
    download: string;
  };

  // Profile page
  profile: {
    title: string;
    subtitle: string;
    availableCredits: string;
    generationsAvailable: string;
    recharge: string;
    totalRecharged: string;
    creditsUsed: string;
    quickRecharge: string;
    generations: string;
    popular: string;
    recentTransactions: string;
    total: string;
    noTransactions: string;
  };

  // Login page
  login: {
    title: string;
    subtitle: string;
    login: string;
    register: string;
    googleLogin: string;
    loggingIn: string;
    orUseEmail: string;
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    forgotPassword: string;
    processing: string;
    useRealEmail: string;
    verifyEmail: string;
    verificationSent: string;
    backToRegister: string;
    emailNotVerified: string;
    emailNotVerifiedDescription: string;
    accountStatus: string;
    unverified: string;
    emailNeedsVerification: string;
    resendVerificationEmail: string;
    sending: string;
    backToLogin: string;
    emailTips: string;
    checkSpam: string;
    validFor10Minutes: string;
    noEmailReceived: string;
    passwordMismatch: string;
    passwordTooShort: string;
  };

  // Verification
  verification: {
    title: string;
    enterCode: string;
    noCodeReceived: string;
    resend: string;
    resendIn: string;
    emailSentTo: string;
    emailTips: string;
    checkInbox: string;
    validFor10Minutes: string;
    clickResend: string;
  };

  // Forgot Password
  forgotPassword: {
    title: string;
    verifyEmail: string;
    resetPassword: string;
    resetSuccess: string;
    emailAddress: string;
    enterEmail: string;
    sendCode: string;
    newPassword: string;
    confirmNewPassword: string;
    enterNewPassword: string;
    reenterNewPassword: string;
    resetingPassword: string;
    resetPasswordButton: string;
    successTitle: string;
    successDescription: string;
    sendingCode: string;
    emailDescription: string;
  };

  // Recharge Modal
  recharge: {
    title: string;
    selectAmount: string;
    paymentMethod: string;
    orderSummary: string;
    amount: string;
    baseCredits: string;
    bonusCredits: string;
    totalCredits: string;
    cancel: string;
    pay: string;
    processing: string;
    successTitle: string;
    successDescription: string;
    demoNotice: string;
    wechatPay: string;
    alipay: string;
    creditCard: string;
    bonus: string;
  };

  // Contact Modal
  contact: {
    title: string;
    description: string;
    emailUs: string;
    close: string;
  };

  // Image Preview
  imagePreview: {
    title: string;
    prompt: string;
    style: string;
    background: string;
    generated: string;
    downloadImage: string;
    transparent: string;
    normal: string;
  };

  // Debug Logs
  debug: {
    title: string;
    records: string;
    refresh: string;
    download: string;
    clear: string;
    filterLevel: string;
    all: string;
    noLogs: string;
    viewDetails: string;
    autoSaved: string;
    latestFirst: string;
  };

  // Google Auth Callback
  googleAuth: {
    loggingIn: string;
    processing: string;
    loginFailed: string;
    backToLogin: string;
  };

  // Common
  common: {
    loading: string;
    error: string;
    success: string;
    confirm: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    submit: string;
    retry: string;
    refresh: string;
  };

  // Styles
  styles: {
    realistic: string;
    cartoon: string;
    oilPainting: string;
    render3d: string;
    watercolor: string;
    cyberpunk: string;
  };

  // Ratios
  ratios: {
    square: string;
    landscape: string;
    portrait: string;
    photo: string;
    classic: string;
    wide: string;
    tall: string;
  };
}

const translations: Record<Language, Translations> = {
  zh: {
    header: {
      home: '首页',
      generate: '生成',
      gallery: '画廊',
      profile: '个人',
      contact: '联系我们',
      signOut: '退出登录',
      availableCredits: '可用积分',
    },
    home: {
      title: '用AI魔法创造惊艳艺术',
      subtitle: 'AI艺术工作室',
      description: '使用我们先进的AI图像生成平台，将您的想法转化为令人惊叹的视觉效果。只需描述您想要的内容，看着您的想象力变为现实。',
      startCreating: '开始创作',
      creditsPerGeneration: '每次生成10积分',
      availableCredits: '可用积分',
      imagesGenerated: '已生成图片',
      creditsUsed: '已使用积分',
      sessions: '生成次数',
      recentCreations: '最近创作',
      viewAll: '查看全部 →',
      latestPrompt: '最新提示词：',
      generateImages: '生成图片',
      generateDescription: '通过文本描述创建令人惊叹的AI生成艺术作品',
      rechargeCredits: '充值积分',
      rechargeDescription: '为您的账户充值以继续创作精彩艺术',
    },
    generate: {
      title: '生成AI图片',
      subtitle: '描述您的愿景，看AI将其变为现实',
      promptLabel: '描述您想要创建的内容',
      promptPlaceholder: '例如：一条威严的龙在日落时分飞越幻想城堡...',
      chooseStyle: '选择风格',
      chooseRatio: '选择比例',
      chooseCount: '选择数量',
      transparentBackground: '透明背景',
      cost: '费用',
      credits: '积分',
      generating: '生成中...',
      generateImages: '生成图片',
      generatedImages: '生成的图片',
      downloadAll: '下载全部',
      promptUsed: '使用的提示词：',
      style: '风格',
      background: '背景',
      creditsUsed: '使用积分',
      normal: '普通',
      transparent: '透明',
      creatingImages: '正在创建您的图片',
      creatingDescription: '这可能需要几分钟时间...',
      preview: '预览',
      download: '下载',
      insufficientCredits: '积分不足！',
      insufficientCreditsMessage: '请为您的账户充值。',
    },
    gallery: {
      title: '图片画廊',
      subtitle: '浏览您的AI生成创作',
      noImages: '暂无图片',
      noImagesDescription: '开始创建令人惊叹的AI生成图片，在这里查看它们。',
      createFirstImage: '创建您的第一张图片',
      totalImages: '总图片数',
      generationSessions: '生成会话',
      creditsUsed: '使用积分',
      allImages: '所有图片',
      realistic: '写实',
      cartoon: '卡通',
      oilPainting: '油画',
      render3d: '3D渲染',
      watercolor: '水彩',
      cyberpunk: '赛博朋克',
      transparentBg: '透明背景',
      newestFirst: '最新优先',
      oldestFirst: '最旧优先',
      noImagesForFilter: '所选筛选器未找到图片。',
      preview: '预览',
      download: '下载',
    },
    profile: {
      title: '个人资料与积分',
      subtitle: '管理您的账户并充值积分',
      availableCredits: '可用积分',
      generationsAvailable: '可生成图片',
      recharge: '充值',
      totalRecharged: '总充值',
      creditsUsed: '已使用积分',
      quickRecharge: '快速充值',
      generations: '次生成',
      popular: '热门',
      recentTransactions: '最近交易',
      total: '总计',
      noTransactions: '暂无交易记录',
    },
    login: {
      title: 'AI艺术工作室',
      subtitle: '用AI创造令人惊叹的图片',
      login: '登录',
      register: '注册',
      googleLogin: '使用 Google 登录',
      loggingIn: '登录中...',
      orUseEmail: '或使用邮箱',
      name: '姓名',
      email: '邮箱地址',
      password: '密码',
      confirmPassword: '确认密码',
      forgotPassword: '忘记密码？',
      processing: '处理中...',
      useRealEmail: '请使用真实邮箱注册以接收验证码',
      verifyEmail: '验证邮箱',
      verificationSent: '我们已向您发送验证码',
      backToRegister: '返回注册',
      emailNotVerified: '邮箱未验证',
      emailNotVerifiedDescription: '您的账户已注册，但邮箱尚未验证',
      accountStatus: '账户状态：未验证',
      unverified: '未验证',
      emailNeedsVerification: '需要验证后才能登录',
      resendVerificationEmail: '重新发送验证邮件',
      sending: '发送中...',
      backToLogin: '返回登录',
      emailTips: '邮件提示：',
      checkSpam: '• 请检查您的邮箱（包括垃圾邮件文件夹）',
      validFor10Minutes: '• 验证码有效期为10分钟',
      noEmailReceived: '• 如果长时间未收到，请点击重新发送',
      passwordMismatch: '两次输入的密码不一致',
      passwordTooShort: '密码长度至少6位',
    },
    verification: {
      title: '验证邮箱',
      enterCode: '请输入6位验证码',
      noCodeReceived: '没有收到验证码？',
      resend: '重新发送',
      resendIn: '重新发送',
      emailSentTo: '验证码已发送至',
      emailTips: '邮件提示：',
      checkInbox: '• 请检查您的邮箱（包括垃圾邮件文件夹）',
      validFor10Minutes: '• 验证码有效期为10分钟',
      clickResend: '• 如果长时间未收到，请点击重新发送',
    },
    forgotPassword: {
      title: '忘记密码',
      verifyEmail: '验证邮箱',
      resetPassword: '重置密码',
      resetSuccess: '重置成功',
      emailAddress: '邮箱地址',
      enterEmail: '请输入注册邮箱',
      sendCode: '发送验证码',
      newPassword: '新密码',
      confirmNewPassword: '确认新密码',
      enterNewPassword: '请输入新密码',
      reenterNewPassword: '请再次输入新密码',
      resetingPassword: '重置中...',
      resetPasswordButton: '重置密码',
      successTitle: '密码重置成功',
      successDescription: '您的密码已成功重置，请使用新密码登录',
      sendingCode: '发送中...',
      emailDescription: '我们将向此邮箱发送密码重置验证码',
    },
    recharge: {
      title: '充值积分',
      selectAmount: '选择金额',
      paymentMethod: '支付方式',
      orderSummary: '订单摘要',
      amount: '金额',
      baseCredits: '基础积分',
      bonusCredits: '奖励积分',
      totalCredits: '总积分',
      cancel: '取消',
      pay: '支付',
      processing: '处理中...',
      successTitle: '充值成功！',
      successDescription: '您的账户已充值积分。',
      demoNotice: '这是演示版本。不会进行实际支付。',
      wechatPay: '微信支付',
      alipay: '支付宝',
      creditCard: '信用卡',
      bonus: '奖励',
    },
    contact: {
      title: '联系我们',
      description: '如有任何问题或建议，请通过邮件联系我们：',
      emailUs: '发送邮件',
      close: '关闭',
    },
    imagePreview: {
      title: '图片预览',
      prompt: '提示词',
      style: '风格',
      background: '背景',
      generated: '生成时间',
      downloadImage: '下载图片',
      transparent: '透明',
      normal: '普通',
    },
    debug: {
      title: '系统日志',
      records: '条记录',
      refresh: '刷新日志',
      download: '下载日志',
      clear: '清空日志',
      filterLevel: '过滤级别：',
      all: '全部',
      noLogs: '暂无日志记录',
      viewDetails: '查看详细数据',
      autoSaved: '日志自动保存在浏览器本地存储中',
      latestFirst: '最新日志在顶部显示',
    },
    googleAuth: {
      loggingIn: '正在登录...',
      processing: '正在处理Google登录信息，请稍候',
      loginFailed: '登录失败',
      backToLogin: '返回登录页',
    },
    common: {
      loading: '加载中...',
      error: '错误',
      success: '成功',
      confirm: '确认',
      cancel: '取消',
      save: '保存',
      delete: '删除',
      edit: '编辑',
      close: '关闭',
      back: '返回',
      next: '下一步',
      previous: '上一步',
      submit: '提交',
      retry: '重试',
      refresh: '刷新',
    },
    styles: {
      realistic: '写实',
      cartoon: '卡通',
      oilPainting: '油画',
      render3d: '3D渲染',
      watercolor: '水彩',
      cyberpunk: '赛博朋克',
    },
    ratios: {
      square: '正方形',
      landscape: '横向',
      portrait: '纵向',
      photo: '照片',
      classic: '经典',
      wide: '宽屏',
      tall: '高屏',
    },
  },
  en: {
    header: {
      home: 'Home',
      generate: 'Generate',
      gallery: 'Gallery',
      profile: 'Profile',
      contact: 'Contact Us',
      signOut: 'Sign Out',
      availableCredits: 'Available Credits',
    },
    home: {
      title: 'Create Amazing Art with AI Magic',
      subtitle: 'AI Art Studio',
      description: 'Transform your ideas into stunning visuals with our advanced AI image generation platform. Simply describe what you want, and watch your imagination come to life.',
      startCreating: 'Start Creating',
      creditsPerGeneration: '10 credits per generation',
      availableCredits: 'Available Credits',
      imagesGenerated: 'Images Generated',
      creditsUsed: 'Credits Used',
      sessions: 'Sessions',
      recentCreations: 'Recent Creations',
      viewAll: 'View All →',
      latestPrompt: 'Latest prompt:',
      generateImages: 'Generate Images',
      generateDescription: 'Create stunning AI-generated artwork from text descriptions',
      rechargeCredits: 'Recharge Credits',
      rechargeDescription: 'Top up your account to continue creating amazing art',
    },
    generate: {
      title: 'Generate AI Images',
      subtitle: 'Describe your vision and watch AI bring it to life',
      promptLabel: 'Describe what you want to create',
      promptPlaceholder: 'E.g., A majestic dragon flying over a fantasy castle at sunset...',
      chooseStyle: 'Choose Style',
      chooseRatio: 'Choose Ratio',
      chooseCount: 'Choose Count',
      transparentBackground: 'Transparent Background',
      cost: 'Cost',
      credits: 'credits',
      generating: 'Generating...',
      generateImages: 'Generate Images',
      generatedImages: 'Generated Images',
      downloadAll: 'Download All',
      promptUsed: 'Prompt used:',
      style: 'Style',
      background: 'Background',
      creditsUsed: 'Credits used',
      normal: 'Normal',
      transparent: 'Transparent',
      creatingImages: 'Creating Your Images',
      creatingDescription: 'This may take a few moments...',
      preview: 'Preview',
      download: 'Download',
      insufficientCredits: 'Insufficient credits!',
      insufficientCreditsMessage: 'Please recharge your account.',
    },
    gallery: {
      title: 'Image Gallery',
      subtitle: 'Browse your AI-generated creations',
      noImages: 'No Images Yet',
      noImagesDescription: 'Start creating amazing AI-generated images to see them here.',
      createFirstImage: 'Create Your First Image',
      totalImages: 'Total Images',
      generationSessions: 'Generation Sessions',
      creditsUsed: 'Credits Used',
      allImages: 'All Images',
      realistic: 'Realistic',
      cartoon: 'Cartoon',
      oilPainting: 'Oil Painting',
      render3d: '3D Render',
      watercolor: 'Watercolor',
      cyberpunk: 'Cyberpunk',
      transparentBg: 'Transparent BG',
      newestFirst: 'Newest First',
      oldestFirst: 'Oldest First',
      noImagesForFilter: 'No images found for the selected filter.',
      preview: 'Preview',
      download: 'Download',
    },
    profile: {
      title: 'Profile & Credits',
      subtitle: 'Manage your account and recharge credits',
      availableCredits: 'Available Credits',
      generationsAvailable: 'image generations available',
      recharge: 'Recharge',
      totalRecharged: 'Total Recharged',
      creditsUsed: 'Credits Used',
      quickRecharge: 'Quick Recharge',
      generations: 'generations',
      popular: 'Popular',
      recentTransactions: 'Recent Transactions',
      total: 'total',
      noTransactions: 'No transactions yet',
    },
    login: {
      title: 'AI Art Studio',
      subtitle: 'Create stunning images with AI',
      login: 'Login',
      register: 'Register',
      googleLogin: 'Continue with Google',
      loggingIn: 'Logging in...',
      orUseEmail: 'or use email',
      name: 'Name',
      email: 'Email Address',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot Password?',
      processing: 'Processing...',
      useRealEmail: 'Please use a real email address to receive verification codes',
      verifyEmail: 'Verify Email',
      verificationSent: 'We have sent you a verification code',
      backToRegister: 'Back to Register',
      emailNotVerified: 'Email Not Verified',
      emailNotVerifiedDescription: 'Your account is registered but email is not verified yet',
      accountStatus: 'Account Status: Unverified',
      unverified: 'Unverified',
      emailNeedsVerification: 'needs verification before login',
      resendVerificationEmail: 'Resend Verification Email',
      sending: 'Sending...',
      backToLogin: 'Back to Login',
      emailTips: 'Email Tips:',
      checkSpam: '• Please check your inbox (including spam folder)',
      validFor10Minutes: '• Verification code is valid for 10 minutes',
      noEmailReceived: '• If you don\'t receive it, click resend',
      passwordMismatch: 'Passwords do not match',
      passwordTooShort: 'Password must be at least 6 characters',
    },
    verification: {
      title: 'Verify Email',
      enterCode: 'Please enter the 6-digit verification code',
      noCodeReceived: 'Didn\'t receive the code?',
      resend: 'Resend',
      resendIn: 'Resend',
      emailSentTo: 'Verification code sent to',
      emailTips: 'Email Tips:',
      checkInbox: '• Please check your inbox (including spam folder)',
      validFor10Minutes: '• Verification code is valid for 10 minutes',
      clickResend: '• If you don\'t receive it, click resend',
    },
    forgotPassword: {
      title: 'Forgot Password',
      verifyEmail: 'Verify Email',
      resetPassword: 'Reset Password',
      resetSuccess: 'Reset Successful',
      emailAddress: 'Email Address',
      enterEmail: 'Please enter your registered email',
      sendCode: 'Send Code',
      newPassword: 'New Password',
      confirmNewPassword: 'Confirm New Password',
      enterNewPassword: 'Please enter new password',
      reenterNewPassword: 'Please re-enter new password',
      resetingPassword: 'Resetting...',
      resetPasswordButton: 'Reset Password',
      successTitle: 'Password Reset Successful',
      successDescription: 'Your password has been successfully reset, please login with your new password',
      sendingCode: 'Sending...',
      emailDescription: 'We will send a password reset code to this email',
    },
    recharge: {
      title: 'Recharge Credits',
      selectAmount: 'Select Amount',
      paymentMethod: 'Payment Method',
      orderSummary: 'Order Summary',
      amount: 'Amount',
      baseCredits: 'Base Credits',
      bonusCredits: 'Bonus Credits',
      totalCredits: 'Total Credits',
      cancel: 'Cancel',
      pay: 'Pay',
      processing: 'Processing...',
      successTitle: 'Recharge Successful!',
      successDescription: 'Your account has been credited with credits.',
      demoNotice: 'This is a demo. No actual payment will be processed.',
      wechatPay: 'WeChat Pay',
      alipay: 'Alipay',
      creditCard: 'Credit Card',
      bonus: 'bonus',
    },
    contact: {
      title: 'Contact Us',
      description: 'If you have any questions or suggestions, please contact us via email:',
      emailUs: 'Send Email',
      close: 'Close',
    },
    imagePreview: {
      title: 'Image Preview',
      prompt: 'Prompt',
      style: 'Style',
      background: 'Background',
      generated: 'Generated',
      downloadImage: 'Download Image',
      transparent: 'Transparent',
      normal: 'Normal',
    },
    debug: {
      title: 'System Logs',
      records: 'records',
      refresh: 'Refresh Logs',
      download: 'Download Logs',
      clear: 'Clear Logs',
      filterLevel: 'Filter Level:',
      all: 'All',
      noLogs: 'No log records',
      viewDetails: 'View Details',
      autoSaved: 'Logs are automatically saved in browser local storage',
      latestFirst: 'Latest logs are displayed at the top',
    },
    googleAuth: {
      loggingIn: 'Logging in...',
      processing: 'Processing Google login information, please wait',
      loginFailed: 'Login Failed',
      backToLogin: 'Back to Login',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      confirm: 'Confirm',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      retry: 'Retry',
      refresh: 'Refresh',
    },
    styles: {
      realistic: 'Realistic',
      cartoon: 'Cartoon',
      oilPainting: 'Oil Painting',
      render3d: '3D Render',
      watercolor: 'Watercolor',
      cyberpunk: 'Cyberpunk',
    },
    ratios: {
      square: 'Square',
      landscape: 'Landscape',
      portrait: 'Portrait',
      photo: 'Photo',
      classic: 'Classic',
      wide: 'Wide',
      tall: 'Tall',
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'zh';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage: handleSetLanguage, 
      t: translations[language] 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};