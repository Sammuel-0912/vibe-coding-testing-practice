---
description: DashboardPage 測試案例
---

> 狀態：初始為 [ ]、完成為 [x]
> 注意：狀態只能在測試通過後由流程更新。
> 測試類型：前端元素、前端邏輯、Mock API...

---

## [x] 【前端元素】確認頁面渲染儀表板標題、歡迎卡片（含 avatar 與 role badge）、登出按鈕
**範例輸入**：以任意已登入使用者渲染 DashboardPage  
**期待輸出**：畫面渲染「儀表板」標題、包含 avatar 與 role badge 的歡迎卡片、以及「登出」按鈕。

---

## [x] 【前端邏輯】admin 使用者顯示「🛠️ 管理後台」連結，一般用戶不顯示
**範例輸入**：`user.role` 分別為 `'admin'` 與 `'user'`  
**期待輸出**：admin 角色時顯示導向 `/admin` 的「🛠️ 管理後台」連結；user 角色時該連結不存在於畫面。

---

## [x] 【前端邏輯】admin 角色顯示「管理員」徽章，user 角色顯示「一般用戶」徽章
**範例輸入**：`user.role` 分別為 `'admin'` 與 `'user'`  
**期待輸出**：welcome card 內的 role-badge 文字對應顯示「管理員」或「一般用戶」。

---

## [x] 【前端邏輯】welcome card 的 avatar 正確顯示 username 的首字大寫
**範例輸入**：`user.username` 為 `'alice'`  
**期待輸出**：avatar 區域顯示 `'A'`。

---

## [x] 【前端邏輯】點擊登出按鈕呼叫 logout() 並導向至 /login
**範例輸入**：點擊「登出」按鈕  
**期待輸出**：呼叫 `logout()`，並使用 `navigate('/login', { replace: true, state: null })` 導向登入頁。

---

## [x] 【Mock API】掛載時呼叫 productApi.getProducts() 並顯示「載入商品中...」Loading 狀態
**範例輸入**：Mock `productApi.getProducts` 為永不 resolve 的 Promise（或延遲回應）  
**期待輸出**：元件掛載後立即顯示 loading spinner 與「載入商品中...」文字。

---

## [x] 【Mock API】商品取得成功時正確顯示商品卡片（名稱、描述、價格）
**範例輸入**：Mock `productApi.getProducts` 回傳包含一筆商品 `{ id: 1, name: '測試商品', description: '描述', price: 100 }` 的陣列  
**期待輸出**：畫面渲染對應的商品卡片，顯示名稱「測試商品」、描述「描述」、價格「NT$ 100」。

---

## [x] 【Mock API】商品取得失敗（非 401）時顯示 API 錯誤訊息
**範例輸入**：Mock `productApi.getProducts` 拋出含 `response.data.message: '伺服器錯誤'` 的 AxiosError（status 500）  
**期待輸出**：畫面顯示包含「伺服器錯誤」的錯誤容器（error-container）。

---

## [x] 【Mock API】401 錯誤時不設定 error 狀態（由 axios interceptor 處理）
**範例輸入**：Mock `productApi.getProducts` 拋出含 `response.status: 401` 的 AxiosError  
**期待輸出**：error 狀態保持為 `null`，畫面不顯示錯誤訊息，loading 結束後呈現空的商品列表。
