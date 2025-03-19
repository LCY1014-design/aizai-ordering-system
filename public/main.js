import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// 🔥 Firebase 設定
const firebaseConfig = {
  apiKey: "你的API Key",
  authDomain: "你的authDomain",
  projectId: "你的projectId",
  storageBucket: "你的storageBucket",
  messagingSenderId: "你的messagingSenderId",
  appId: "你的appId"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const state = {
  orders: []
};

// ✅ 初始化訂單（從 Firebase 加載）
async function initOrders() {
  state.orders = [];
  const querySnapshot = await getDocs(collection(db, 'orders'));
  querySnapshot.forEach(doc => {
    state.orders.push({ id: doc.id, ...doc.data() });
  });
  renderOrders();
}

// ✅ 送出訂單（儲存到 Firebase）
async function submitOrder(order) {
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      meal: order.meal,
      size: order.size,
      spicy: order.spicy,
      custom: order.custom,
      name: order.name,
      phone: order.phone,
      location: order.location,
      completed: false
    });
    console.log("訂單已儲存，ID:", docRef.id);

    order.id = docRef.id;
    order.completed = false;
    state.orders.push(order);
    renderOrders();
  } catch (error) {
    console.error("提交訂單時出錯: ", error);
  }
}

// ✅ 完成訂單（更新 Firebase 狀態）
async function completeOrder(id) {
  const orderRef = doc(db, 'orders', id);
  try {
    await updateDoc(orderRef, { completed: true });
    const order = state.orders.find(o => o.id === id);
    if (order) {
      order.completed = true;
      renderOrders();
    }
  } catch (error) {
    console.error("標記完成時出錯: ", error);
  }
}

// ✅ 渲染訂單（同步到後台）
function renderOrders() {
  const orderList = document.getElementById('orderList');
  if (!orderList) return;

  orderList.innerHTML = '';

  state.orders.forEach(order => {
    const orderItem = document.createElement('div');
    orderItem.className = 'order-item';
    orderItem.innerHTML = `
      <p>餐點：${order.meal} - ${order.size} (${order.spicy})</p>
      <p>客製化：${order.custom}</p>
      <p>姓名：${order.name}，電話：${order.phone}</p>
      <p>取餐地點：${order.location}</p>
      ${order.completed ? 
        '<p style="color: green;">已完成</p>' : 
        `<button onclick="completeOrder('${order.id}')" class="complete-btn">標記完成</button>`
      }
    `;
    orderList.appendChild(orderItem);
  });
}

// ✅ 匯出函式，供前後台呼叫
export { initOrders, submitOrder, completeOrder };
