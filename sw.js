self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

self.addEventListener('message', e => {
  if (!e.data || e.data.type !== 'NOTIFY_SUBS') return;
  const { subs, tomorrowDay } = e.data;
  subs.forEach(sub => {
    if (!sub.billingDate || sub.billingDate.day !== tomorrowDay) return;
    const amt = sub.amount.toLocaleString('ko-KR');
    const messages = [
      `내일 "${sub.name}" ${amt}원이 빠져나가요 💳 생활비 잔액 미리 확인해두세요!`,
      `📅 ${sub.name} 결제 D-1이에요. ${amt}원 준비됐나요?`,
      `💸 내일은 ${sub.name} 결제일! ${amt}원이 자동결제돼요. 잔액 체크!`,
    ];
    const body = messages[Math.floor(Math.random() * messages.length)];
    self.registration.showNotification('구독 결제 하루 전 알림 🔔', {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: `sub-${sub.id}-${tomorrowDay}`,
      renotify: false,
      requireInteraction: false,
    });
  });
});
