---
description: AdminPage 測試案例
---

> 狀態：初始為 [ ]、完成為 [x]
> 注意：狀態只能在測試通過後由流程更新。
> 測試類型：前端元素、前端邏輯、驗證權限...

---

## [x] 【前端元素】確認頁面正確渲染管理後台標題、返回連結、登出按鈕
**範例輸入**：以 admin 角色渲染 AdminPage  
**期待輸出**：畫面渲染「🛠️ 管理後台」標題、導向 `/dashboard` 的「← 返回」連結、以及「登出」按鈕。

---

## [x] 【前端邏輯】admin 角色顯示「管理員」徽章，user 角色顯示「一般用戶」徽章
**範例輸入**：user.role 分別為 `'admin'` 與 `'user'`  
**期待輸出**：role-badge 文字對應顯示「管理員」或「一般用戶」。

---

## [x] 【前端邏輯】點擊登出按鈕呼叫 logout() 並導向至 /login
**範例輸入**：點擊「登出」按鈕  
**期待輸出**：呼叫 `logout()`，並使用 `navigate('/login', { replace: true, state: null })` 導向登入頁。

---

## [x] 【驗證權限】RoleBasedRoute 在 isLoading 為 true 時顯示「驗證權限中...」Loading 畫面
**範例輸入**：`isLoading` 為 `true`  
**期待輸出**：畫面顯示 loading spinner 與「驗證權限中...」文字，不渲染子元件。

---

## [x] 【驗證權限】非 admin 角色（user 角色）被 RoleBasedRoute 重定向至 /dashboard
**範例輸入**：`user.role` 為 `'user'`，嘗試訪問 `/admin`  
**期待輸出**：`RoleBasedRoute` 執行 `<Navigate to="/dashboard" replace />`，不渲染 AdminPage。
