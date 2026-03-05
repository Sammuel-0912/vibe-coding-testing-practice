---
description: LoginPage 測試案例
---

> 狀態：初始為 [ ]、完成為 [x]
> 注意：狀態只能在測試通過後由流程更新。
> 測試類型：前端元素、前端邏輯、Mock API、驗證權限...

---

## [x] 【前端元素】確認頁面正確渲染登入表單元素
**範例輸入**：無
**期待輸出**：畫面渲染 Email 輸入框、密碼輸入框、登入按鈕。

---

## [x] 【前端元素】確認已登入狀態下掛載組件會導向至 /dashboard
**範例輸入**：isAuthenticated 狀態為 true
**期待輸出**：組件掛載後呼叫 navigate 導向至 '/dashboard'。

---

## [x] 【前端邏輯】驗證 Email 格式錯誤時會顯示錯誤提示
**範例輸入**：Email 輸入 "invalid-email"
**期待輸出**：顯示「請輸入有效的 Email 格式」的錯誤訊息。

---

## [x] 【前端邏輯】驗證密碼長度不足或未包含英數時顯示錯誤提示
**範例輸入**：密碼輸入 "123" 或 "abcdefgh"
**期待輸出**：顯示「密碼必須至少 8 個字元」或「密碼必須包含英文字母和數字」錯誤訊息。

---

## [x] 【前端邏輯】驗證送出表單且格式驗證通過時會出現 Loading 狀態
**範例輸入**：輸入正確格式 Email 與密碼並點擊登入
**期待輸出**：登入按鈕顯示「登入中...」且按鈕變為 disabled 狀態。

---

## [x] 【Mock API】驗證登入成功時呼叫 login api 並導向至 /dashboard
**範例輸入**：輸入正確 Email 與密碼並成功呼叫 login 函式
**期待輸出**：成功導向至 '/dashboard' 且沒有錯誤訊息。

---

## [x] 【Mock API】驗證登入失敗時會顯示紅色的 API 錯誤 banner
**範例輸入**：登入 API 回傳錯誤 (例如帳密錯誤)
**期待輸出**：畫面上方顯示包含 API 錯誤訊息的警告 banner。

---

## [x] 【前端邏輯】驗證 AuthContext 中有 authExpiredMessage 時正確顯示在畫面上並清除
**範例輸入**：authExpiredMessage 有值 (例如 "登入已過期")
**期待輸出**：將訊息顯示在 apiError 狀態，並立刻呼叫 clearAuthExpiredMessage()。
